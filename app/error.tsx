"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1952B3] flex items-center justify-center mb-6 text-2xl font-bold">
        KB
      </div>
      <h2 className="text-2xl font-bold text-[#0A2540] mb-3">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md text-sm">
        We encountered a temporary issue. Please click below to refresh the page.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-[#1952B3] hover:bg-[#0A2540] text-white"
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Go to Home</Button>
        </Link>
      </div>
    </div>
  );
}

