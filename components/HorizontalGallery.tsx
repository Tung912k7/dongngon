"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";

const cards = [
  {
    id: 1,
    title: "Khởi Nguyên",
    subtitle: "Nơi bắt đầu những dòng chảy",
    color: "bg-red-500", // Placeholder gradient
    img: "/pattern/pattern1.png" // Using available asset or color
  },
  {
    id: 2,
    title: "Cảm Hứng",
    subtitle: "Từ những điều bình dị nhất",
    color: "bg-blue-500",
  },
  {
    id: 3,
    title: "Sẻ Chia",
    subtitle: "Lan tỏa niềm vui viết lách",
    color: "bg-green-500",
  },
  {
    id: 4,
    title: "Đồng Ngôn",
    subtitle: "Một không gian của chúng ta",
    color: "bg-yellow-500",
  },
];

const HorizontalGallery = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-75%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-24 px-24">
          <div className="flex flex-col justify-center min-w-[30vw]">
             <h2 className="text-white font-ganh text-6xl md:text-8xl whitespace-nowrap">
                Hành trình <br /> Sáng tạo
             </h2>
             <p className="text-gray-400 font-be-vietnam mt-4 text-xl max-w-sm">
                Cuộn xuống để khám phá không gian nghệ thuật của chúng tôi.
             </p>
          </div>
          
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const Card = ({ card }: { card: typeof cards[0] }) => {
  return (
    <div
      key={card.id}
      className={`group relative h-[60vh] w-[400px] md:w-[600px] overflow-hidden rounded-3xl bg-neutral-800 border border-neutral-700 hover:border-white/50 transition-colors cursor-pointer`}
    >
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110"
        style={{
          backgroundImage: `url(${card.img || ''})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#333", // Fallback
        }}
      ></div>
      <div className="absolute inset-0 z-10 grid place-content-center bg-black/40">
        <div className="p-8 text-center bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
            <p className="text-white/80 font-be-vietnam uppercase tracking-widest text-sm mb-2">{card.subtitle}</p>
            <h3 className="text-4xl font-black uppercase text-white font-ganh">
            {card.title}
            </h3>
        </div>
      </div>
    </div>
  );
};

export default HorizontalGallery;
