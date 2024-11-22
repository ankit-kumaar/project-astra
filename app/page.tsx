"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in"); // Redirect to /sign-in for unauthenticated users
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !userId) {
    return null; // Show nothing while checking auth state
  }

  return <div></div>;
}
