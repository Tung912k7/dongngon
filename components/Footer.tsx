"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isLoveOpen, setIsLoveOpen] = useState(false);

  return (
    <>
      <footer className="w-full bg-white border-t border-black py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-3 items-center gap-6">
          {/* Logo */}
          <div className="flex justify-center md:justify-start md:-ml-4">
            <button 
              onClick={() => setIsLoveOpen(true)}
              className="hover:opacity-80 transition-opacity"
            >
              <Image 
                src="/logo.webp" 
                alt="Đồng ngôn Logo" 
                width={80} 
                height={80} 
                className="w-16 h-16 object-contain"
              />
            </button>
          </div>
            

          {/* Copyright */}
          <div 
            className="text-base font-medium text-slate-900 text-center justify-self-center whitespace-nowrap"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Đồng ngôn bởi tôi và bạn trai
          </div>

          {/* Links */}
          <nav className="flex gap-8 text-base font-normal uppercase tracking-wider items-center justify-self-end">
            <a 
              href="https://forms.gle/2ENzFe3rdUhkXTP59" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity uppercase"
            >
              Góp ý
            </a>
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="hover:opacity-70 transition-opacity uppercase"
            >
              Giải cứu admin
            </button>
          </nav>
        </div>
      </footer>

      {/* Love Modal */}
      <AnimatePresence>
        {isLoveOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoveOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="relative bg-white border-4 border-black p-8 rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-xs w-full flex flex-col items-center text-center"
            >
              <div className="mb-4 text-4xl animate-bounce">❤️</div>
              <p className="text-2xl font-bold text-black italic">
                "Yêu bé nhiều :33"
              </p>
              <button 
                onClick={() => setIsLoveOpen(false)}
                className="mt-6 px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95"
              >
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donation Modal */}
      <AnimatePresence>
        {isDonateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDonateOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white p-8 rounded-lg shadow-xl max-w-sm w-full flex flex-col items-center"
            >
              <button 
                onClick={() => setIsDonateOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <p className="text-center text-xl font-medium text-black mb-4">
                Cảm ơn bạn đã đồng hành cùng Đồng ngôn!
              </p>
              
              <div className="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full h-full p-2"
                >
                  <img 
                    src="/qr.png" 
                    alt="Mã QR Ủng hộ" 
                    className="w-full h-full object-contain" 
                    loading="lazy"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
