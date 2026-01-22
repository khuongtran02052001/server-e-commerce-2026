package clients

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	blogDomain "module-shop/internal/domain/blog"
)

type AuthorHTTPClient struct {
	baseURL string
	token   string
	httpc   *http.Client
}

func NewAuthorHTTPClientFromEnv() *AuthorHTTPClient {
	return &AuthorHTTPClient{
		baseURL: os.Getenv("AUTH_SERVICE_BASE_URL"), // vd: http://localhost:8081/service-system/v1/api
		token:   os.Getenv("INTERNAL_TOKEN"),        // super-secret
		httpc:   &http.Client{Timeout: 15 * time.Second},
	}
}

type batchReq struct {
	IDs []string `json:"ids"`
}

type batchResp struct {
	Data []blogDomain.AuthorLite `json:"data"`
}

func (c *AuthorHTTPClient) BatchFindLiteByIDs(authorIDs []string) (map[string]blogDomain.AuthorLite, error) {
	out := map[string]blogDomain.AuthorLite{}
	if c.baseURL == "" || len(authorIDs) == 0 {
		return out, nil
	}
	// de-dup (phòng khi ai gọi sai)
	seen := map[string]struct{}{}
	ids := make([]string, 0, len(authorIDs))
	for _, id := range authorIDs {
		if id == "" {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}

	body, _ := json.Marshal(batchReq{IDs: ids})
	ctx, cancel := context.WithTimeout(context.Background(), 12*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/users/lite", bytes.NewReader(body))
	if err != nil {
		return out, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("X-Internal-Token", c.token)
	}
	start := time.Now()

	res, err := c.httpc.Do(req)
	if err != nil {
		log.Printf("[author_client] DO error url=%s err=%T %v", req.URL.String(), err, err)
		return out, err
	}
	log.Printf("[author_client] duration=%s", time.Since(start))

	log.Printf("[author_client] got response status=%s", res.Status)
	defer res.Body.Close()

	bodyBytes, readErr := io.ReadAll(res.Body)
	if readErr != nil {
		return out, readErr
	}
	if res.StatusCode >= 400 {
		return out, errors.New("auth service status: " + res.Status)
	}

	var parsed batchResp
	if err := json.Unmarshal(bodyBytes, &parsed); err != nil {
		return out, err
	}

	for _, u := range parsed.Data {
		out[u.ID] = u
	}

	return out, nil
}
