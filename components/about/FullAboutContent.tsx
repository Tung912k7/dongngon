"use client";
import React, { useEffect, useRef, useState } from 'react';
import { sendIdeaToAdmins } from '@/actions/notification';

const CardSection = ({
  index,
  title,
  subtitle,
  children,
  decoration,
  delay = 0
}: {
  index: number,
  title: string,
  subtitle: string,
  children: React.ReactNode,
  decoration: React.ReactNode,
  delay?: number
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    setTimeout(() => observer.observe(el), delay);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(60px)',
        transition: 'opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1), transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`w-full flex flex-col md:flex-row gap-8 md:gap-16 items-center mb-40 md:mb-64 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
    >
      {/* Content Card */}
      <div className="w-full md:w-1/2 p-10 md:p-14 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-sm relative group">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-8 h-[2px] bg-white/30" />
          <span className="font-ganh text-xs uppercase tracking-[0.4em] text-white/40 font-bold">
            {subtitle}
          </span>
        </div>

        <h3 className="font-ganh text-3xl sm:text-4xl md:text-5xl leading-tight text-white tracking-tighter font-bold uppercase mb-8">
          {title}
        </h3>

        <div className="text-white/60 font-be-vietnam text-base sm:text-lg leading-relaxed">
          {children}
        </div>
      </div>

      {/* Decoration Side */}
      <div className={`hidden md:flex w-full md:w-1/2 items-center ${isEven ? 'justify-end' : 'justify-start'}`}>
        {decoration}
      </div>
    </div>
  );
};

const DecorationBlock = ({ content }: { content: string }) => {
  const lines = content.split('<br/>');

  return (
    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center border-2 border-white/5 rounded-full p-12 group overflow-hidden">
      <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-110 transition-transform duration-1000 ease-out" />
      <div className="relative flex flex-col items-center">
        {lines.map((line, idx) => (
          <p
            key={idx}
            className="font-ganh text-white/20 text-6xl sm:text-8xl md:text-9xl font-black uppercase text-center leading-[0.85] tracking-tighter transition-all duration-700 group-hover:text-white/30 group-hover:scale-105"
          >
            {line.trim()}
          </p>
        ))}
      </div>
    </div>
  );
};

const FullAboutContent = () => {
  const [formData, setFormData] = useState({
    id: '',
    penName: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.penName.trim() || !formData.description.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await sendIdeaToAdmins(formData.id, formData.penName, formData.description);
      if (result.success) {
        setIsSubmitted(true);
        setFormData({ id: '', penName: '', description: '' });
      } else {
        setError(result.error || "Gửi ý tưởng thất bại.");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col px-4 sm:px-12 md:px-20 lg:px-32 py-20 relative z-20">

      {/* 🛡️ Page Header */}
      <div className="mb-40 md:mb-64 flex flex-col items-center text-center">
        <h1 className="font-ganh text-5xl sm:text-8xl md:text-[130px] font-black text-white uppercase leading-tight tracking-tighter mb-4">
          Về chúng mình
        </h1>
      </div>

      {/* 01: Origin Section */}
      <CardSection
        index={0}
        title="Bắt đầu từ những cuộc trò chuyện hằng đêm."
        subtitle="Nguồn gốc"
        decoration={<DecorationBlock content="Đồng <br/> ngôn" />}
      >
        <p className="mb-6">
          Dự án chợt loé lên trong đầu của người ấy khi chúng mình đang học bài cùng nhau.
          <span className="text-white font-bold italic ml-2">Một ý tưởng độc đáo, kì lạ và có một chút điên rồ.</span>
        </p>
        <p>
          Thế là Đồng Ngôn ra đời từ đó, một nơi mà mọi người đều có thể chia sẻ những câu chuyện, những suy nghĩ của mình.
        </p>
      </CardSection>

      {/* 02: Meaning Section */}
      <CardSection
        index={1}
        title="Đồng ngôn là cái gì? Có ăn được không?"
        subtitle="Ý nghĩa"
        decoration={<DecorationBlock content="Tâm <br/> hồn" />}
      >
        <p className="mb-6">
          Cái tên <span className="text-white font-bold underline decoration-white/30 decoration-offset-4">Đồng ngôn</span> thật ra rất đơn giản.
        </p>
        <div className="grid gap-6">
          <div className="p-4 bg-white/5 rounded-2xl">
            <p className="text-base text-white leading-relaxed">Cùng một ngôn từ, cùng một ngôn ngữ</p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl">
            <p className="text-base text-white leading-relaxed">Cùng một tác phẩm, trăm triệu tâm hồn</p>
          </div>
        </div>
      </CardSection>

      {/* 03: Future Section (Idea Form) */}
      <CardSection
        index={2}
        title="Gửi gắm ý tưởng cho trang web."
        subtitle="Ý tưởng"
        decoration={<DecorationBlock content="Tương <br/> lai" />}
      >
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
            <p className="text-white/40 text-sm mb-2">
              Chúng mình luôn lắng nghe những đóng góp, góp ý của mọi người để ngày một tốt hơn!
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Mã định danh</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="Mã định danh..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-all font-be-vietnam"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Bút danh</label>
                <input
                  type="text"
                  value={formData.penName}
                  onChange={(e) => setFormData(prev => ({ ...prev, penName: e.target.value }))}
                  placeholder="Bút danh của bạn..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-white/30 transition-all font-be-vietnam"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 pl-1">Mô tả ý tưởng</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ý tưởng của bạn..."
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-4 text-white text-sm outline-none focus:border-white/30 transition-all font-be-vietnam min-h-[120px] resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-xs font-black uppercase">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full border-2 border-white text-white font-ganh text-xl uppercase py-4 rounded-xl transition-all active:scale-[0.98] mt-2 group flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'}`}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi ý tưởng'}
              {!isSubmitting && (
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-white font-ganh text-2xl uppercase mb-2">Cảm ơn bạn! Ý tưởng của bạn,chúng mình đã nhận được!</h4>
            <p className="text-white/40 text-sm">Chúc bạn một ngày tốt lành 🫰</p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-8 text-white/30 text-[10px] uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
            >
              Gửi thêm ý tưởng
            </button>
          </div>
        )}
      </CardSection>

      {/* Outro */}
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-[1px] h-32 bg-gradient-to-b from-white to-transparent mb-12" />
        <p className="font-ganh text-white/40 text-4xl sm:text-6xl md:text-9xl uppercase font-black tracking-tighter select-none">
          Hihi 💕
        </p>
      </div>

    </div>
  );
};

export default FullAboutContent;
