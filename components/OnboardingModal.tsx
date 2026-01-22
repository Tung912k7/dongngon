"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { completeOnboarding } from "@/actions/profile";
import { useRouter, usePathname } from "next/navigation";
import { 
  Sparkles, 
  ArrowRight,
  X,
  Target,
  Search,
  BookOpen,
  UserCircle,
  Filter,
  Layers,
  PenTool,
  CheckCircle2,
  ArrowRightCircle
} from "lucide-react";

export default function OnboardingModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(0); 
  const [mounted, setMounted] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slides = useMemo(() => [
    // SCENE: HOME
    {
      targetId: null,
      path: "/",
      title: "CHÀO MỪNG BẠN",
      content: "Chúng mình sẽ dẫn bạn đi tham quan một vòng thế giới Đồng Ngôn nhé?",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      targetId: "tour-brand",
      path: "/",
      title: "ĐẠI SẢNH",
      content: "Đây là nơi mọi câu chuyện bắt đầu. Đồng Ngôn là không gian sáng tác cộng đồng độc đáo.",
      icon: <Target className="w-8 h-8" />
    },
    {
      targetId: "tour-search",
      path: "/",
      title: "TÌM KIẾM CẢM HỨNG",
      content: "Tìm thấy những chủ đề, tác phẩm hoặc tác giả mà bạn yêu thích chỉ trong một lần nhấn.",
      icon: <Search className="w-8 h-8" />
    },
    {
      targetId: "tour-feed",
      path: "/",
      title: "DÒNG CHẢY SÁNG TẠO",
      content: "Cùng khám phá kho tàng tác phẩm của cộng đồng nhé!",
      icon: <ArrowRightCircle className="w-8 h-8" />,
      action: () => router.push("/dong-ngon")
    },
    // SCENE: DONG NGON (FEED)
    {
      targetId: "tour-filters",
      path: "/dong-ngon",
      title: "BỘ LỌC TINH TẾ",
      content: "Dễ dàng tìm thấy thể loại thơ, văn xuôi hay những tác phẩm đang viết dở.",
      icon: <Filter className="w-8 h-8" />
    },
    {
      targetId: "tour-work-grid",
      path: "/dong-ngon",
      title: "KHO TÁC PHẨM",
      content: "Mỗi ô là một thế giới riêng đang chờ bạn khám phá và đóng góp.",
      icon: <Layers className="w-8 h-8" />,
      action: () => {
        // Try to find the first work link to navigate to
        const firstWork = document.querySelector("#tour-work-grid a") as HTMLAnchorElement;
        if (firstWork) firstWork.click();
      }
    },
    // SCENE: WORK DETAIL
    {
      targetId: "tour-work-title",
      path: "/work/", // Matches any /work/[id]
      title: "TÊN TÁC PHẨM",
      content: "Mỗi tác phẩm đều có linh hồn riêng, nơi mọi người cùng chung tay dệt nên.",
      icon: <PenTool className="w-8 h-8" />
    },
    {
      targetId: "tour-work-content",
      path: "/work/",
      title: "NỘI DUNG LIỀN MẠCH",
      content: "Các câu văn được nối tiếp nhau tạo nên một dòng chảy cảm xúc mượt mà.",
      icon: <BookOpen className="w-8 h-8" />
    },
    {
      targetId: "tour-editor",
      path: "/work/",
      title: "ĐÓNG GÓP CỦA BẠN",
      content: "Hãy viết tiếp một câu văn để cùng cộng đồng hoàn thiện tác phẩm này.",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      targetId: "tour-vote",
      path: "/work/",
      title: "HOÀN THÀNH",
      content: "Khi thấy tác phẩm đã đủ đầy, hãy bình chọn để kết thúc hành trình sáng tác.",
      icon: <CheckCircle2 className="w-8 h-8" />,
      action: () => router.push("/profile")
    },
    // SCENE: PROFILE
    {
      targetId: "tour-user-info",
      path: "/profile",
      title: "HỒ SƠ CỦA BẠN",
      content: "Nơi lưu giữ bút danh và những dấu ấn sáng tạo của riêng bạn.",
      icon: <UserCircle className="w-8 h-8" />
    },
    {
      targetId: "tour-edit-profile",
      path: "/profile",
      title: "SẴN SÀNG CHƯA?",
      content: "Hành trình khám phá đã xong. Giờ là lúc bạn viết nên câu chuyện của chính mình!",
      icon: <Sparkles className="w-8 h-8" />
    }
  ], [router]);

  useEffect(() => {
    const updateRect = () => {
      const currentSlide = slides[step];
      if (!currentSlide) return;

      // Check if we are on the correct path for this slide
      // For /work/ we use startsWith
      const isCorrectPath = currentSlide.path === "/" 
        ? pathname === "/" 
        : pathname.startsWith(currentSlide.path);

      if (currentSlide.targetId && isCorrectPath) {
        const el = document.getElementById(currentSlide.targetId);
        if (el) {
          setHighlightRect(el.getBoundingClientRect());
        } else {
          setHighlightRect(null);
        }
      } else {
        setHighlightRect(null);
      }
    };

    // Delay slightly to allow for navigation/rendering
    const timer = setTimeout(updateRect, 300);
    
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [step, slides, pathname]);

  const handleNext = () => {
    const currentSlide = slides[step];
    if (currentSlide.action) {
      currentSlide.action();
    }
    
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsOpen(false);
    await completeOnboarding();
  };

  const handleSkip = async () => {
    setIsOpen(false);
    await completeOnboarding();
  };

  if (!mounted || !isOpen) return null;

  const currentSlide = slides[step];

  // Calculate Tooltip position and arrow orientation
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isBelow = highlightRect && highlightRect.top < window.innerHeight / 2;

  const getTooltipPosition = () => {
    if (!highlightRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    
    const margin = 50;
    const top = isBelow ? highlightRect.bottom + margin : highlightRect.top - margin - 300;
    const left = isMobile ? "50%" : `${highlightRect.left + highlightRect.width / 2}px`;

    return { 
      top: `${Math.max(20, Math.min(window.innerHeight - 320, top))}px`, 
      left, 
      transform: isMobile ? "translateX(-50%)" : "translateX(-50%)",
      width: isMobile ? "calc(100vw - 32px)" : "400px"
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] overflow-hidden">
      {/* Spotlight Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {highlightRect && (
              <rect
                x={highlightRect.left - 8}
                y={highlightRect.top - 4}
                width={highlightRect.width + 16}
                height={highlightRect.height + 8}
                rx="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.8)"
          mask="url(#spotlight-mask)"
          className="transition-all duration-500"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      {/* Curved Arrow (Desktop Only) */}
      {highlightRect && !isMobile && (
        <motion.svg 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute w-32 h-32 text-white pointer-events-none z-[100002]"
          style={{
            top: isBelow ? highlightRect.bottom + 10 : highlightRect.top - 100,
            left: highlightRect.left + highlightRect.width / 2 - 16,
            transform: isBelow ? 'none' : 'scaleY(-1)'
          }}
        >
          <path 
            d="M 10 10 Q 50 50 10 90" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeDasharray="8,5"
            strokeLinecap="round"
          />
          <path d="M 10 90 L 0 80 M 10 90 L 20 80" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </motion.svg>
      )}

      {/* Tooltip Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        style={getTooltipPosition()}
        className="absolute bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-[100001]"
      >
        <div className="relative">
          <button 
            onClick={handleSkip}
            className="absolute -top-4 -right-4 p-2 bg-gray-100 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-[-2px]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 border-3 border-black rounded-2xl flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {currentSlide.icon}
            </div>

            <h3 className="text-4xl font-bold mb-4 uppercase tracking-tight text-black font-aquus">
              {currentSlide.title}
            </h3>
            
            <p className="text-gray-600 text-sm font-medium leading-relaxed font-sans mb-8">
              {currentSlide.content}
            </p>

            <div className="flex items-center justify-between w-full mt-2">
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full ${i === step ? "w-4 bg-black" : "w-1 bg-gray-200"}`} />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="px-8 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-80 transition-all flex items-center gap-2"
              >
                {step === slides.length - 1 ? "HOÀN TẤT" : "TIẾP THEO"}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Skip Global Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100001]">
         <button
          onClick={handleSkip}
          className="px-8 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white/20 transition-all shadow-xl"
        >
          Bỏ qua hướng dẫn (Skip)
        </button>
      </div>
    </div>,
    document.body
  );
}
