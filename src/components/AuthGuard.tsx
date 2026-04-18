"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from "react";

/**
 * AuthGuard component that protects routes by checking both NextAuth session status.
 * It redirects unauthenticated users to the login page.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  // Prevent flash of content for unauthenticated users
  if (status === "unauthenticated") return null;

  return <>{children}</>;
}
