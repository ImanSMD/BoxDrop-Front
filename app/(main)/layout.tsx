"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Splash } from "@/components/layout/Splash";
import { JoinDealModal } from "@/components/deal/JoinDealModal";
import { InstallBanner } from "@/components/layout/InstallBanner";
import { useAuthBootstrap } from "@/lib/hooks/useAuth";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { accessToken, hydrated } = useAuthBootstrap();

  useEffect(() => {
    if (hydrated && !accessToken) router.replace("/login");
  }, [hydrated, accessToken, router]);

  if (!hydrated || !accessToken) return <Splash />;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface">
      <div className="flex flex-1 flex-col pb-2">{children}</div>
      <BottomNav />
      <JoinDealModal />
      <InstallBanner />
    </div>
  );
}
