"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { CHANGELOG, LATEST_VERSION, ChangelogEntry } from "@/data/changelog";
import { markChangelogSeen } from "@/actions/changelog";

interface ChangelogModalProps {
  lastSeenVersion: string | null;
}

export default function ChangelogModal({ lastSeenVersion }: ChangelogModalProps) {
  // Find all unseen changelog entries
  const unseenEntries = getUnseenEntries(lastSeenVersion);
  const [isOpen, setIsOpen] = useState(unseenEntries.length > 0);

  const handleDismiss = async () => {
    setIsOpen(false);
    await markChangelogSeen(LATEST_VERSION);
  };

  if (unseenEntries.length === 0) return null;

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleDismiss}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                <m.div
                  initial={{ scale: 0.92, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 30 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="bg-white border-2 border-black rounded-3xl w-full max-w-lg relative z-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[85vh] flex flex-col"
                >
                  {/* Header */}
                  <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight">Có gì mới?</h2>
                      <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                        Phiên bản {LATEST_VERSION}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                    {unseenEntries.map((entry) => (
                      <div key={entry.version}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-full">
                            v{entry.version}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {entry.date}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-black mb-2">{entry.title}</h3>
                        <ul className="space-y-2">
                          {entry.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t-2 border-black">
                    <button
                      onClick={handleDismiss}
                      className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all text-sm active:scale-[0.98] cursor-pointer"
                    >
                      Đã hiểu, tiếp tục
                    </button>
                  </div>
                </m.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

function getUnseenEntries(lastSeenVersion: string | null): ChangelogEntry[] {
  if (!lastSeenVersion) return CHANGELOG;

  const unseen: ChangelogEntry[] = [];
  for (const entry of CHANGELOG) {
    if (entry.version === lastSeenVersion) break;
    unseen.push(entry);
  }
  return unseen;
}
