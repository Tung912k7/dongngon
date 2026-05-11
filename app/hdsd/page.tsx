// app/hdsd/page.tsx
// Help Center main page — now dynamically fetching data from database.
// Hero section with title + search bar, category grid, and FAQ.

import React from 'react';
import { HELP_CENTER_SECTIONS } from '@/data/helpCenter';
import { getPublishedHDSDArticles } from '@/actions/hdsd';
import HelpCenterClient from '@/components/hdsd/HelpCenterClient';
import { ContactCard } from '@/components/hdsd/HelpCenterContact';
import { FAQItem } from '@/components/hdsd/HelpCenterFAQ';

import { Metadata } from 'next';

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
    question: 'Định hướng tương lai của Đồng ngôn là gì?',
    answer: 'Khi nền tảng đủ lớn, chúng mình sẽ thêm các lựa chọn ngôn ngữ cho các tác phẩm để làm đa dạng hơn không chỉ về thể loại mà còn ngôn ngữ của các tác phẩm.',
  },
  {
    question: 'Đồng ngôn do mấy người làm?',
    answer: 'Đồng ngôn hiện tại có 1 người phát triển và vận hành, còn bạn kia thì sẽ hỗ trợ tuỳ tình hình.',
  },
  {
    question: 'Tôi có thể tạo những loại tác phẩm nào?',
    answer: 'Đồng Ngôn hỗ trợ nhiều thể loại sáng tác bao gồm: Thơ tự do, Thơ tứ ngôn, Văn xuôi (truyện ngắn, tản văn), Nhật ký, và Tùy bút. Bạn có thể chọn thể loại khi tạo tác phẩm mới.',
  },
  {
    question: 'Làm cách nào để đóng góp vào tác phẩm chung?',
    answer: 'Truy cập trang Kho tàng, Chọn 1 tác phẩm mà bạn muốn và bấm vào nút "Đến tác phẩm" để đọc và đóng góp cho tác phẩm.',
  },
  {
    question: 'Tại sao tác phẩm của tôi bị đánh dấu hoặc hạn chế?',
    answer: 'Tác phẩm có thể bị đánh dấu nếu vi phạm quy định cộng đồng về nội dung. Bạn có thể xem chi tiết lý do trong mục Thông báo và gửi phản hồi nếu cho rằng đây là nhầm lẫn.',
  },
  {
    question: 'Tôi có thể chỉnh sửa tác phẩm sau khi xuất bản không?',
    answer: 'Có, bạn có thể chỉnh sửa tác phẩm bất cứ lúc nào. Mở tác phẩm đã đăng, nhấn biểu tượng Chỉnh sửa để cập nhật nội dung. Lịch sử chỉnh sửa sẽ được lưu lại.',
  },
  {
    question: 'Tôi có thể chỉnh sửa tác phẩm sau khi xuất bản không?',
    answer: 'Có, bạn có thể chỉnh sửa tác phẩm bất cứ lúc nào. Mở tác phẩm đã đăng, nhấn biểu tượng Chỉnh sửa để cập nhật nội dung. Lịch sử chỉnh sửa sẽ được lưu lại.',
  },
];

export const metadata: Metadata = {
  title: "Hướng dẫn sử dụng | Đồng ngôn",
  description: "Câu hỏi thường gặp và hướng dẫn sử dụng nền tảng sáng tác văn học cộng đồng Đồng ngôn.",
  openGraph: {
    title: "Hướng dẫn sử dụng | Đồng ngôn",
    description: "Tìm thấy câu trả lời cho mọi thắc mắc về cách sử dụng Đồng ngôn tại đây.",
    url: "https://dongngon.vercel.app/hdsd",
    siteName: "Đồng ngôn",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hướng dẫn sử dụng | Đồng ngôn",
    description: "Khám phá các tính năng và cách tham gia sáng tác tại Đồng ngôn.",
  },
  alternates: {
    canonical: "/hdsd",
  },
};

export default async function HelpCenterPage() {
  // Fetch dynamic articles to calculate counts automatically
  const result = await getPublishedHDSDArticles();
  const articles = result.success ? result.data || [] : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "FAQPage",
                "name": "Hướng dẫn sử dụng Đồng Ngôn",
                "description": "Câu hỏi thường gặp và hướng dẫn sử dụng nền tảng sáng tác văn học cộng đồng Đồng Ngôn.",
                "url": "https://dongngon.vercel.app/hdsd",
                "inLanguage": "vi",
                "isPartOf": {
                  "@type": "WebSite",
                  "@id": "https://dongngon.vercel.app/#website"
                },
                "mainEntity": FAQ_ITEMS.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Trang chủ",
                    "item": "https://dongngon.vercel.app"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Hướng dẫn sử dụng",
                    "item": "https://dongngon.vercel.app/hdsd"
                  }
                ]
              }
            ]
          })
        }}
      />
      <HelpCenterClient
        sections={HELP_CENTER_SECTIONS}
        articles={articles}
        faqItems={FAQ_ITEMS}
        contactCards={CONTACT_CARDS}
      />
    </>
  );
}
