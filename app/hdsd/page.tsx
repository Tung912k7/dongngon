// app/hdsd/page.tsx
// Help Center main page — now dynamically fetching data from database.
// Hero section with title + search bar, category grid, and FAQ.

import React from 'react';
import { HELP_CENTER_SECTIONS } from '@/data/helpCenter';
import { getPublishedHDSDArticles } from '@/actions/hdsd';
import HelpCenterClient from '@/components/hdsd/HelpCenterClient';
import { ContactCard } from '@/components/hdsd/HelpCenterContact';
import { FAQItem } from '@/components/hdsd/HelpCenterFAQ';

const CONTACT_CARDS: ContactCard[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    title: 'Góp ý',
    description: 'Chia sẻ ý tưởng và đề xuất cải tiến',
    ctaLabel: 'Gửi góp ý',
    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfRTalgsKarNe4OgmxFg1XRkoZnmu_nmofaZZ8s3BOHbN5xYw/viewform',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Báo lỗi',
    description: 'Phản hồi lỗi kỹ thuật hoặc nội dung',
    ctaLabel: 'Gửi báo lỗi',
    ctaHref: 'https://docs.google.com/forms/d/e/1FAIpQLSfRTalgsKarNe4OgmxFg1XRkoZnmu_nmofaZZ8s3BOHbN5xYw/viewform',
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Làm cách nào để đăng ký tài khoản trên Đồng Ngôn?',
    answer: 'Nhấn vào nút "Đăng ký" ở góc phải trên cùng. Bạn có thể đăng ký bằng email hoặc thông qua tài khoản Google. Sau khi đăng ký, bạn cần xác thực email để kích hoạt tài khoản.',
  },
  {
    question: 'Tôi có thể tạo những loại tác phẩm nào?',
    answer: 'Đồng Ngôn hỗ trợ nhiều thể loại sáng tác bao gồm: Thơ tự do, Thơ tứ ngôn, Văn xuôi (truyện ngắn, tản văn), Nhật ký, và Tùy bút. Bạn có thể chọn thể loại khi tạo tác phẩm mới.',
  },
  {
    question: 'Làm cách nào để đóng góp vào tác phẩm chung?',
    answer: 'Truy cập trang tác phẩm chung, nhấn "Đóng góp" để gửi phần viết của bạn. Tác giả gốc sẽ xem xét và phê duyệt đóng góp.',
  },
  {
    question: 'Tại sao tác phẩm của tôi bị đánh dấu hoặc hạn chế?',
    answer: 'Tác phẩm có thể bị đánh dấu nếu vi phạm quy định cộng đồng về nội dung. Bạn có thể xem chi tiết lý do trong mục Thông báo và gửi phản hồi nếu cho rằng đây là nhầm lẫn.',
  },
  {
    question: 'Làm cách nào để đặt lại mật khẩu?',
    answer: 'Nhấn "Quên mật khẩu" trên trang đăng nhập, nhập email đã đăng ký. Bạn sẽ nhận được liên kết đặt lại mật khẩu qua email trong vòng vài phút.',
  },
  {
    question: 'Tôi có thể chỉnh sửa tác phẩm sau khi xuất bản không?',
    answer: 'Có, bạn có thể chỉnh sửa tác phẩm bất cứ lúc nào. Mở tác phẩm đã đăng, nhấn biểu tượng Chỉnh sửa để cập nhật nội dung. Lịch sử chỉnh sửa sẽ được lưu lại.',
  },
  {
    question: 'Vai trò kiểm duyệt viên làm gì?',
    answer: 'Kiểm duyệt viên giúp duy trì chất lượng nội dung trên nền tảng bằng cách xem xét tác phẩm được báo cáo, đảm bảo tuân thủ quy định cộng đồng và hỗ trợ giải quyết tranh chấp nội dung.',
  },
];

export default async function HelpCenterPage() {
  // Fetch dynamic articles to calculate counts automatically
  const result = await getPublishedHDSDArticles();
  const articles = result.success ? result.data || [] : [];

  return (
    <HelpCenterClient
      sections={HELP_CENTER_SECTIONS}
      articles={articles}
      faqItems={FAQ_ITEMS}
      contactCards={CONTACT_CARDS}
    />
  );
}
