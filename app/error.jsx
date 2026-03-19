"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }) {
  return (
    <div className="h-full w-full flex items-center justify-center min-h-[50vh]">
      <div className="glass-panel p-8 text-center rounded-2xl max-w-md w-full">
        <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-brand-muted text-sm mb-6">
          {error?.message || "An unexpected error occurred in your workspace."}
        </p>
        <button
          onClick={() => reset()}
          className="bg-brand-primary text-white hover:bg-brand-primaryHover px-6 py-2 rounded-md transition-colors text-sm font-medium shadow-lg w-full"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
