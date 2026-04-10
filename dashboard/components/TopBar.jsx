"use client";
import { Bell, Search, Wifi } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TopBar() {
  const pathname = usePathname();
  
  let title = 'Dashboard Overview';
  if (pathname === '/vehicles') title = 'Vehicle Tracking';
  if (pathname === '/visitors') title = 'Smart Visitors';
  if (pathname === '/live-feed') title = 'Live Feed';

  const currentTime = "10:36:29 PM"; // Static for UI mock as per screenshots

  return (
    <header className="h-16 border-b border-[#1e293b] bg-[#0b0f19] px-6 flex items-center justify-between shrink-0">
      <h2 className="text-white text-lg font-semibold">{title}</h2>

      <div className="flex items-center gap-6">
        <button className="text-[#64748b] hover:text-white transition-colors">
          <Search className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#064e3b]/20 text-[#10b981] border border-[#064e3b] rounded-full">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">System Online</span>
        </div>

        <div className="relative">
          <button className="text-[#64748b] hover:text-white transition-colors mt-1">
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold border-2 border-[#0b0f19]">
            14
          </span>
        </div>

        <div className="text-[#94a3b8] text-sm font-medium border-l border-[#1e293b] pl-6 py-1">
          {currentTime}
        </div>
      </div>
    </header>
  );
}
