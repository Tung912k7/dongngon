"use client";

import React from "react";
import { m } from "framer-motion";

const steps = [
  {
    num: "1",
    title: "Chọn bắt đầu",
    desc: "Bắt đầu một câu hoặc tham gia",
  },
  {
    num: "2",
    title: "Viết một dòng",
    desc: "Thêm câu, câu thơ, hoặc đoạn",
  },
  {
    num: "3",
    title: "Xem thành phẩm",
    desc: "Mọi người tiếp nối, tác phẩm lớn dần",
  },
];

const HowItWorks = () => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4 relative">
        {/* Connecting Line - hidden on mobile */}
        <div className="hidden sm:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-black/10 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => (
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
            key={idx}
            className="flex flex-col items-center text-center gap-2 relative z-10 w-full sm:w-1/3 bg-white"
          >
            {/* Step Number Badge */}
            <div className="w-10 h-10 rounded-full border-2 border-black bg-white text-literary-gold font-ganh text-xl font-bold flex items-center justify-center">
              {step.num}
            </div>
            {/* Content */}
            <div className="mt-2">
              <h3 className="font-be-vietnam font-bold text-sm text-black uppercase tracking-wider">
                {step.title}
              </h3>
              <p className="font-be-vietnam text-xs text-black/70 mt-1 max-w-[150px] mx-auto leading-relaxed">
                {step.desc}
              </p>
            </div>
          </m.div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
