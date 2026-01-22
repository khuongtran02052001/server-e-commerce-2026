package utils

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"time"
)

type UserLite struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	FirestName string `json:"firstName"`
	LastName   string `json:"lastName"`
}

type AuthClient struct {
	baseURL string
	token   string
	httpc   *http.Client
}

// Env cần có:
// AUTH_SERVICE_BASE_URL=http://localhost:8081/service-system/v1/api
// INTERNAL_TOKEN=super-secret

func NewAuthClientFromEnv() *AuthClient {
	base := os.Getenv("AUTH_SERVICE_BASE_URL")
	tok := os.Getenv("INTERNAL_TOKEN")

	return &AuthClient{
		baseURL: base,
		token:   tok,
		httpc: &http.Client{
			Timeout: 3 * time.Second,
		},
	}
}

type batchReq struct {
	IDs []string `json:"ids"`
}

type batchResp struct {
	Data []UserLite `json:"data"`
	// nếu bạn wrap theo format khác thì thêm field ở đây
}

func (c *AuthClient) BatchUserLite(ctx context.Context, ids []string) (map[string]UserLite, error) {
	out := map[string]UserLite{}
	if c == nil || c.baseURL == "" || len(ids) == 0 {
		return out, nil
	}

	payload, _ := json.Marshal(batchReq{IDs: ids})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+"/users/lite", bytes.NewReader(payload))
	if err != nil {
		return out, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("X-Internal-Token", c.token)
	}

	res, err := c.httpc.Do(req)
	if err != nil {
		return out, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return out, errors.New("auth service status: " + res.Status)
	}

	var parsed batchResp
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return out, err
	}

	for _, u := range parsed.Data {
		out[u.ID] = u
	}
	return out, nil
}
