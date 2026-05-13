// data/helpCenter.ts
// Static data for Help Center sections and articles

import { HelpCenterSection, HelpCenterArticle } from '../types/helpCenter';

export const HELP_CENTER_SECTIONS: HelpCenterSection[] = [
  {
    id: 'tai-khoan',
    title: 'Tài khoản',
    description: 'Đăng ký, đăng nhập và quản lý tài khoản của bạn',
    icon: 'account',
  },
  {
    id: 'tao-tac-pham',
    title: 'Tạo tác phẩm',
    description: 'Hướng dẫn tạo và quản lý các tác phẩm',
    icon: 'create',
  },
  {
    id: 'dong-gop',
    title: 'Đóng góp & Cộng tác',
    description: 'Các quy tắc và hướng dẫn khi đóng góp tác phẩm',
    icon: 'collaborate',
  },
  {
    id: 'kho-tang',
    title: 'Kho tàng',
    description: 'Khám phá và tương tác với tác phẩm',
    icon: 'stats',
  },
  {
    id: 'noi-dung',
    title: 'Kiểm duyệt',
    description: 'Quy định nội dung và vai trò kiểm duyệt',
    icon: 'content',
  },
  {
    id: 'cai-dat',
    title: 'Cài đặt & Hồ sơ',
    description: 'Tùy chỉnh hồ sơ và quyền riêng tư',
    icon: 'settings',
  },
];

export const HELP_CENTER_ARTICLES: HelpCenterArticle[] = [];

