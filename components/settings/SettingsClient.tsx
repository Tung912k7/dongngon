"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import ProfileTab from "./ProfileTab";
import AccountTab from "./AccountTab";
import InterfaceTab from "./InterfaceTab";

interface SettingsClientProps {
  user: User;
  initialNickname: string;
  initialAvatarUrl: string;
}

export default function SettingsClient({ user, initialNickname, initialAvatarUrl }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "interface">("profile");

  const tabs = [
    { id: "profile", label: "HỒ SƠ CÁ NHÂN" },
    { id: "account", label: "TÀI KHOẢN & BẢO MẬT" },
    { id: "interface", label: "GIAO DIỆN & NGÔN NGỮ" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[calc(100vh-100px)]">
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 1024px) {
          .settings-sidebar {
            width: 280px !important;
            flex: none !important;
          }
        }
      `}} />
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar w-full shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-6 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 border-2 ${
                activeTab === tab.id
                  ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                  : "bg-white text-gray-500 border-transparent hover:bg-gray-50 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border-2 border-black rounded-[2rem] p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            {activeTab === "profile" && (
              <ProfileTab 
                initialNickname={initialNickname} 
                initialAvatarUrl={initialAvatarUrl} 
                userEmail={user.email || ""}
              />
            )}
            {activeTab === "account" && <AccountTab userEmail={user.email || ""} />}
            {activeTab === "interface" && <InterfaceTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
