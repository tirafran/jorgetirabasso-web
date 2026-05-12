export interface SiteConfig {
  id:                 number
  hero_image_url:     string | null
  profile_image_url:  string | null
  bio_short_es:       string | null
  bio_short_en:       string | null
  bio_full_es:        string | null
  bio_full_en:        string | null
  instagram_url:      string | null
  updated_at:         string
}

export interface Gallery {
  id:              string
  name_es:         string
  name_en:         string
  description_es:  string | null
  description_en:  string | null
  cover_image_url: string | null
  display_order:   number
  created_at:      string
}

export interface Recognition {
  id:           string
  photo_url:    string | null
  title_es:     string
  title_en:     string
  subtitle_es:  string | null
  subtitle_en:  string | null
  display_order: number
  created_at:   string
}

export interface Photo {
  id:              string
  gallery_id:      string
  title_es:        string
  title_en:        string
  description_es:  string | null
  description_en:  string | null
  awards:          string | null
  storage_path:    string
  display_order:   number
  created_at:      string
}
