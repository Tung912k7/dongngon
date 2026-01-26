"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <>
      <footer className="w-full bg-white border-t border-black py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:grid md:grid-cols-3 items-center gap-4">
          {/* Empty div to maintain grid spacing for centering */}
          <div className="hidden md:block" />
            

          {/* Copyright */}
          <div className="text-base font-medium text-slate-900 font-montserrat text-center justify-self-center whitespace-nowrap">
            © {new Date().getFullYear()} Đồng ngôn bởi tôi và bạn trai
          </div>

          {/* Links */}
          <nav className="flex gap-8 font-montserrat text-base font-normal uppercase tracking-wider items-center justify-self-end">
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

              <p className="text-center font-montserrat text-xl font-medium text-black mb-4">
                Cảm ơn bạn đã đồng hành cùng Đồng ngôn!
              </p>
              
              <div className="w-64 h-64 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden">
                <img 
                  src="/qr.png" 
                  alt="Mã QR Ủng hộ" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
