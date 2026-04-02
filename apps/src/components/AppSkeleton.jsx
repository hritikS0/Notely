import React from "react";

const AppSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0b0e13] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="h-24 rounded-2xl border border-white/10 bg-[#10141b] animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-56 rounded-2xl border border-white/10 bg-[#12161d] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppSkeleton;
