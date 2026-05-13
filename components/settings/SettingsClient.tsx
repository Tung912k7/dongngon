"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { m } from "framer-motion";
import ProfileTab from "./ProfileTab";
import AccountTab from "./AccountTab";
import InterfaceTab from "./InterfaceTab";

interface SettingsClientProps {
  user: User;
  initialNickname: string;
  initialAvatarUrl: string;
  initialBirthday: string | null;
  initialDescription: string;
  initialIsPrivate: boolean;
  initialPublicFields: Record<string, boolean>;
}

type SettingsTabId = "profile" | "account" | "interface";

export default function SettingsClient({ 
  user, 
  initialNickname, 
  initialAvatarUrl, 
  initialBirthday, 
  initialDescription,
  initialIsPrivate,
  initialPublicFields
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

  const tabs: Array<{ id: SettingsTabId; label: string }> = [
    { id: "profile", label: "Hồ sơ cá nhân" },
    { id: "account", label: "Tài khoản & Bảo mật" },
    { id: "interface", label: "Giao diện & Ngôn ngữ" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f5f5f5] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        {/* Header Section */}
        <m.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 lg:mb-16 space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-2 bg-black" />
            <h1 className="font-ganh text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter font-black">
              Thiết lập tài khoản
            </h1>
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm pl-16">
            Quản lý thông tin cá nhân và cài đặt trải nghiệm của bạn
          </p>
        </m.div>

        <style dangerouslySetInnerHTML={{__html: `
          @media (min-width: 1024px) {
            .settings-sidebar {
              width: 320px !important;
              flex: none !important;
            }
          }
        `}} />
        
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar w-full shrink-0 space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-8 py-5 rounded-2xl font-bold transition-all duration-300 border-2 border-black flex items-center justify-between group ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
                    : "bg-white text-black hover:bg-gray-50 translate-y-0 active:translate-y-1"
                }`}
              >
                <span className="font-ganh text-lg md:text-xl uppercase tracking-tight">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <m.div 
                    layoutId="activeTabIcon"
                    className="w-2 h-2 bg-white rounded-full" 
                  />
                )}
              </button>
            ))}
            
            {/* Context Card (Optional Brutalist accent) */}
            <div className="hidden lg:block p-8 border-2 border-dashed border-black/20 rounded-[2rem] bg-black/5 mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-black/40">
                Hãy đảm bảo thông tin của bạn luôn chính xác để có trải nghiệm tốt nhất trên Đồng Ngôn.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <m.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border-2 border-black rounded-[2.5rem] p-6 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.03)]"
            >
              {activeTab === "profile" && (
                <ProfileTab 
                  initialNickname={initialNickname} 
                  initialAvatarUrl={initialAvatarUrl} 
                  initialBirthday={initialBirthday}
                  initialDescription={initialDescription}
                  initialIsPrivate={initialIsPrivate}
                  initialPublicFields={initialPublicFields}
                  userEmail={user.email || ""}
                />
              )}
              {activeTab === "account" && <AccountTab userEmail={user.email || ""} />}
              {activeTab === "interface" && <InterfaceTab />}
            </m.div>
          </div>
        </div>
      </div>
    </div>
  );
}

