"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [isDonateOpen, setIsDonateOpen] = useState(false);


  return (
    <>
      <footer className="w-full bg-white border-t border-black py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="text-xl font-roboto tracking-widest">
            ĐỒNG NGÔN
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500 font-roboto">
            © {new Date().getFullYear()} Đồng ngôn bởi tôi và bạn trai.
          </div>

          {/* Links */}
          <nav className="flex gap-8 font-roboto text-sm uppercase tracking-wider items-center">
            <a 
              href="https://forms.gle/2ENzFe3rdUhkXTP59" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity uppercase"
            >
              Liên hệ
            </a>
            <button 
              onClick={() => setIsDonateOpen(true)}
              className="hover:opacity-70 transition-opacity uppercase"
            >
              Ủng hộ
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

              <h3 className="text-xl font-serif mb-6">Ủng hộ Đồng ngôn</h3>
              
              <div className="w-64 h-64 bg-gray-100 flex items-center justify-center mb-4 border border-gray-200 rounded-lg">
                <span className="text-gray-400 font-roboto text-center px-4">
                  (Mã QR Ngân hàng sẽ được cập nhật ở đây)
                </span>
                {/* 
                  To replace with real QR code:
                  <img src="/path-to-qr-code.png" alt="Banking QR Code" className="w-full h-full object-contain" /> 
                */}
              </div>

              <p className="text-center font-roboto text-sm text-gray-600">
                Cảm ơn bạn đã đồng hành cùng chúng mình!
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
