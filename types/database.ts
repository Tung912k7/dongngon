export type Work = {
  id: string; // UUID
  title: string;
  category_type: string; // 'Poetry', 'Prose'
  sub_category: string; // 'Thơ 4 chữ', 'Tùy bút', etc. (Mapped to DB column)
  status: string; // 'active', 'completed'
  license: string;
  limit_type: string; // '1_sentence_day'
  age_rating?: string; // 'all', '13+', '16+', '18+'
  created_at: string;
  created_by: string; // UUID
};

export type Contribution = {
  id: string; // UUID
  work_id: string; // UUID
  user_id: string; // UUID
  author_nickname: string;
  content: string;
  created_at: string;
};

export type Notification = {
  id: string; // UUID
  user_id: string; // UUID
  work_id?: string; // UUID
  type: string; // 'contribution', 'announcement', 'system'
  message: string;
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
  updated_at: string;
};

