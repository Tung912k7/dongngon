"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type BlacklistItem = {
  id: string;
  word: string;
  is_regex: boolean;
};

export default function BlacklistPage() {
  const [words, setWords] = useState<BlacklistItem[]>([]);
  const [newWord, setNewWord] = useState("");
  const [isRegex, setIsRegex] = useState(false);
  const [regexError, setRegexError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchBlacklist();
  }, []);

  // Live Regex Validation
  useEffect(() => {
    if (isRegex && newWord) {
      try {
        new RegExp(newWord);
        setRegexError(null);
      } catch (e: any) {
        setRegexError(e.message);
      }
    } else {
      setRegexError(null);
    }
  }, [newWord, isRegex]);

  const fetchBlacklist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blacklist_words")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching blacklist:", error);
    } else {
      setWords(data || []);
    }
    setLoading(false);
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || regexError) return;

    setSubmitting(true);
    const { error } = await supabase
      .from("blacklist_words")
      .insert([{ 
        word: newWord.trim(), 
        is_regex: isRegex 
      }]);

    if (error) {
      if (error.code === "23505") {
        alert("Pattern này đã có trong danh sách.");
      } else {
        alert("Lỗi: " + error.message);
      }
    } else {
      setNewWord("");
      setIsRegex(false);
      fetchBlacklist();
    }
    setSubmitting(false);
  };

  const handleDeleteWord = async (id: string) => {
    if (!confirm("Xóa pattern này khỏi danh sách?")) return;

    const { error } = await supabase
      .from("blacklist_words")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      fetchBlacklist();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Quản lý từ cấm</h1>
      </div>

      {/* Add Form Card */}
      <div className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-12">
        <form onSubmit={handleAddWord} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">Mẫu (Pattern)</label>
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                maxLength={100}
                placeholder={isRegex ? "Ví dụ: [a-z0-9._%+-]+@..." : "Nhập từ khóa..."}
                className={`w-full px-6 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-lg font-bold transition-all ${
                  regexError ? 'border-red-500 bg-red-50' : ''
                }`}
              />
            </div>
            
            <div className="md:w-48 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest pl-1">Loại</label>
              <select
                value={isRegex ? "regex" : "word"}
                onChange={(e) => setIsRegex(e.target.value === "regex")}
                className="w-full px-4 py-4 rounded-2xl border-4 border-black focus:outline-none font-bold appearance-none bg-white cursor-pointer"
              >
                <option value="word">Từ thuần</option>
                <option value="regex">Biểu thức (Regex)</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {regexError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border-2 border-red-500 p-3 rounded-xl text-red-700 text-sm font-bold"
              >
                ⚠️ Regex không hợp lệ: {regexError}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting || !!regexError || !newWord.trim()}
            className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
          >
            {submitting ? "ĐANG LƯU..." : "XÁC NHẬN THÊM"}
          </button>
        </form>
      </div>

      {/* List Section */}
      <h2 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">{words.length}</span>
        Danh sách hiện tại
      </h2>

      <div className="flex flex-wrap gap-4">
        {loading ? (
          <div className="w-full py-12 flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-slate-400 italic">Đang tải dữ liệu...</p>
          </div>
        ) : words.length === 0 ? (
          <div className="w-full py-12 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
            <p className="font-bold text-slate-400 italic">Chưa có quy tắc nào được thiết lập.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {words.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex items-center gap-3 px-6 py-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex flex-col">
                  {item.is_regex && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-black italic mb-1 w-fit">REGEX</span>
                  )}
                  <span className="font-bold text-lg">{item.word}</span>
                </div>
                <button
                  onClick={() => handleDeleteWord(item.id)}
                  className="ml-2 p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Xóa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
