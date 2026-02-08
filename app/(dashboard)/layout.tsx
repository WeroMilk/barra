"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/Auth/AuthGuard";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardFooter from "@/components/Dashboard/DashboardFooter";
import { notificationsService } from "@/lib/movements";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notificationsService.getUnreadCount());
    const handler = () => setUnreadCount(notificationsService.getUnreadCount());
    window.addEventListener("barra-notifications-update", handler);
    return () => window.removeEventListener("barra-notifications-update", handler);
  }, []);

  return (
    <AuthGuard>
      <div
        className="bg-apple-bg flex flex-col overflow-hidden w-full max-w-[100vw]"
        style={{
          height: "100dvh",
          minHeight: "100dvh",
          maxHeight: "100dvh",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <DashboardHeader notificationsCount={unreadCount} />
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {children}
        </main>
        <DashboardFooter />
      </div>
    </AuthGuard>
  );
}
