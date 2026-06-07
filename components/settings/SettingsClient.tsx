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
  initialPublicFields,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("profile");

  const tabs: Array<{ id: SettingsTabId; label: string }> = [
    { id: "profile", label: "Hồ sơ cá nhân" },
    { id: "account", label: "Tài khoản & Bảo mật" },
    { id: "interface", label: "Giao diện & Ngôn ngữ" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] bg-[radial-gradient(#e2dfd9_1px,transparent_1px)] [background-size:24px_24px] font-be-vietnam">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 lg:mb-16 space-y-4"
        >
          <div className="flex items-center gap-4">
            <h1 className="font-ganh text-4xl md:text-5xl lg:text-6xl tracking-tighter font-bold text-deep-teal lowercase">
              thiết lập tài khoản
            </h1>
          </div>
          <p className="text-ink-charcoal/50 font-medium tracking-wide text-xs md:text-sm pl-1">
            Quản lý thông tin cá nhân và cài đặt trải nghiệm của bạn
          </p>
        </m.div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (min-width: 1024px) {
            .settings-sidebar {
              width: 320px !important;
              flex: none !important;
            }
          }
        `,
          }}
        />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar w-full shrink-0 space-y-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all duration-200 border flex items-center justify-between group ${activeTab === tab.id
                  ? "bg-[#134e4a] text-[#faf8f5] border-[#134e4a] shadow-sm"
                  : "bg-white text-ink-charcoal border-[#eae6e1] hover:bg-[#faf8f5] hover:border-deep-teal/20"
                  }`}
              >
                <span className="font-ganh text-lg md:text-xl lowercase tracking-tight">
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <m.div layoutId="activeTabIcon" className="w-1.5 h-1.5 bg-[#faf8f5] rounded-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-grow min-w-0">
            <m.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#fcfaf8] border border-[#eae6e1] rounded-2xl p-6 md:p-12 shadow-sm"
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
                  userId={user.id}
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
