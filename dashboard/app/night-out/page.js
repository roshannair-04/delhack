"use client";

import { Construction } from "lucide-react";

export default function NightOutPage() {
  return (
    <div className="p-8 h-full flex flex-col items-center justify-center">
      <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] flex flex-col items-center justify-center p-12 text-center w-full max-w-2xl">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">Night-Out Module</h2>
        <p className="text-[#64748b] text-sm">
          This feature was not included in the initial UI mockups block. It is currently under construction.
        </p>
      </div>
    </div>
  );
}
