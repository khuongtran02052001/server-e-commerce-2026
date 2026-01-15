package models

import "gorm.io/datatypes"

func JSONFromRaw(raw []byte) datatypes.JSON {
	return datatypes.JSON(raw)
}
