export type Work = {
  id: string; // UUID
  title: string;
  category_type: string; // 'Poetry', 'Prose'
  sub_category: string; // 'Thơ 4 chữ', 'Tùy bút', etc. (Mapped to DB column)
  status: string; // 'active', 'completed'
  license: string;
  limit_type: string; // '1_sentence_day'
  age_rating?: string; // 'all', '13+', '16+', '18+'
  description?: string;
  created_at: string;
  created_by: string; // UUID
};

export type Contribution = {
  id: string; // UUID
  work_id: string; // UUID
  user_id: string; // UUID
  author_nickname: string;
  content: string;
  new_line?: boolean; // When true, renders a line break before this contribution (Thơ tự do)
  created_at: string;
};

export type Notification = {
  id: string; // UUID
  user_id: string; // UUID
  work_id?: string; // UUID
  type: string; // 'contribution', 'announcement', 'system'
  content: string;
  is_read: boolean;
  created_at: string;
};

export type UserRole = 'admin' | 'mod' | 'user';

export type Profile = {
  id: string; // UUID
  nickname: string;
  avatar_url?: string;
  description?: string;
  role?: UserRole; // 'admin', 'mod', 'user'
  has_seen_tour?: boolean;
  last_seen_changelog?: string;
  updated_at: string;
};

