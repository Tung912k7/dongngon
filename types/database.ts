export type Work = {
  id: string; // UUID
  title: string;
  category_type: string; // 'Poetry', 'Prose'
  sub_category: string; // 'Luc bat', 'Tan van', etc.
  period: string; // 'Ancient', 'Modern'
  status: string; // 'active', 'completed'
  license: string;
  limit_type: string; // '1_sentence_day'
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

export type UserRole = 'admin' | 'mod' | 'user';

export type Profile = {
  id: string; // UUID
  nickname: string;
  avatar_url?: string;
  role?: UserRole; // 'admin', 'mod', 'user'
  updated_at: string;
};

