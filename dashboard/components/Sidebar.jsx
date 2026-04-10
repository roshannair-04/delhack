"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  BellRing,
  Users,
  Moon,
  Package,
  Car,
  BarChart2,
  Settings,
  Shield,
  LogOut
} from 'lucide-react';

const TOP_LINKS = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Live Feed', href: '/live-feed', icon: Video },
  { name: 'Alerts', href: '/alerts', icon: BellRing, badge: 3 },
  { name: 'Visitors', href: '/visitors', icon: Users },
  { name: 'Night-Out', href: '/night-out', icon: Moon },
  { name: 'Parcels', href: '/parcels', icon: Package },
  { name: 'Vehicles', href: '/vehicles', icon: Car },
];

const BOTTOM_LINKS = [
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Users', href: '/users', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-[#0b0f19] border-r border-[#1e293b] flex flex-col hidden md:flex shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold leading-tight">UWSD</h1>
          <p className="text-[#64748b] text-[10px] tracking-widest font-semibold uppercase">Surveillance System</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
        {TOP_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[#1e293b]/60 text-blue-400 font-medium'
                  : 'text-[#94a3b8] hover:bg-[#1e293b]/40 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-[#64748b]'}`} />
              <span className="flex-1">{link.name}</span>
              {link.badge && (
                <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-8 mb-2">
           {BOTTOM_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#1e293b]/60 text-blue-400 font-medium'
                    : 'text-[#94a3b8] hover:bg-[#1e293b]/40 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-[#64748b]'}`} />
                <span className="flex-1">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white font-bold text-sm">
            VK
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Vikram Singh</p>
            <p className="text-[#64748b] text-xs">Guard - On Duty</p>
          </div>
          <button className="text-[#64748b] hover:text-white p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
