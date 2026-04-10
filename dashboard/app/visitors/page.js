"use client";
import { useState } from 'react';
import { UserPlus, QrCode, Search, RefreshCw, UserCheck, CheckCircle2, ShieldOff, Clock } from 'lucide-react';
import EnrollmentModal from '@/components/EnrollmentModal';

const mockVisitors = [
  { name: 'Ragesh', phone: '+91 9383283232', initial: 'R', purpose: 'Parent Visit', host: '—', status: 'Checked Out', qr: 'D166B5', face: false, timeAgo: '29m ago', timeUntil: 'Until 10:07 PM', action: '—' },
  { name: 'Sunita Patel', phone: '+91 87654 32109', initial: 'S', purpose: 'Parent visit', host: 'Priya Patel', status: 'Pre-Approved', qr: 'A2B', face: true, timeAgo: '53m ago', timeUntil: 'Until 04:04 AM', action: 'Check In' },
  { name: 'Ramesh Sharma', phone: '+91 98765 43210', initial: 'R', purpose: 'Parent visit', host: 'Aarav Sharma', status: 'Checked In', qr: '001', face: true, timeAgo: '1h ago', timeUntil: 'Until 02:04 AM', action: 'Check Out' },
  { name: 'Delivery Agent (Amazon)', phone: '+91 76543 21098', initial: 'D', purpose: 'Parcel delivery', host: '—', status: 'Checked Out', qr: '002', face: false, timeAgo: '2h ago', timeUntil: '', action: '—' },
  { name: 'Prof. R.K. Mishra', phone: '+91 65432 10987', initial: 'P', purpose: 'Guest lecture', host: 'Amit Kumar', status: 'Checked In', qr: '003', face: true, timeAgo: '08 Apr 2026', timeUntil: 'Until 03:04 AM', action: 'Check Out' },
  { name: 'Unknown Visitor', phone: 'No phone', initial: 'U', purpose: 'Not specified', host: '—', status: 'Blacklisted', qr: '—', face: false, timeAgo: '07 Apr 2026', timeUntil: '', action: '—' },
];

function StatCard({ label, count, colorClass, borderGlow }) {
  return (
    <div className={`bg-[#141b2d] rounded-xl border border-[#1e293b] p-6 flex flex-col justify-between h-32 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-12 -translate-y-12`}></div>
      <div className="flex flex-col h-full justify-center">
        <div className={`text-4xl font-bold ${colorClass}`}>{count}</div>
        <div className="text-[#64748b] text-sm tracking-widest font-bold uppercase mt-1">{label}</div>
      </div>
    </div>
  );
}

function StatusBadge({ type }) {
  if (type === 'Checked In') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-emerald-500 bg-[#0b0f19] text-xs font-semibold border border-emerald-500/30 w-max"><UserCheck className="w-3.5 h-3.5" /> Checked In</span>;
  if (type === 'Pre-Approved') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-blue-500 bg-[#0b0f19] text-xs font-semibold border border-blue-500/30 w-max"><CheckCircle2 className="w-3.5 h-3.5" /> Pre-Approved</span>;
  if (type === 'Checked Out') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[#94a3b8] bg-[#0b0f19] text-xs font-semibold border border-[#334155] w-max"><UserCheck className="w-3.5 h-3.5" /> Checked Out</span>;
  if (type === 'Blacklisted') return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-red-500 bg-[#0b0f19] text-xs font-semibold border border-red-500/30 w-max"><ShieldOff className="w-3.5 h-3.5" /> Blacklisted</span>;
  return null;
}

export default function Visitors() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8">
      <EnrollmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="ON CAMPUS" count="2" colorClass="text-emerald-500" />
        <StatCard label="PRE-APPROVED" count="1" colorClass="text-blue-500" />
        <StatCard label="CHECKED OUT" count="2" colorClass="text-slate-300" />
        <StatCard label="BLACKLISTED" count="1" colorClass="text-red-500" />
      </div>

      <div className="flex items-center gap-4 border-b border-[#1e293b] pb-4 mb-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Register Visitor
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-white text-sm font-medium transition-colors">
          <QrCode className="w-4 h-4" /> Gate Verification
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm font-medium">
          <UserCheck className="w-4 h-4" /> All Visitors
        </button>
      </div>

      <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] flex flex-col mb-6">
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Visitor Log</h3>
            <p className="text-[#64748b] text-xs mt-0.5">6 of 6 visitors</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search visitors..." className="bg-[#0b0f19] border border-[#1e293b] text-sm text-white rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 w-64 placeholder-[#64748b]" />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-medium bg-[#0b0f19]">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b] text-[10px] tracking-widest font-bold uppercase">
                <th className="p-4 pl-6 font-semibold">Visitor</th>
                <th className="p-4 font-semibold">Purpose</th>
                <th className="p-4 font-semibold">Host</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">QR Pass</th>
                <th className="p-4 font-semibold">Face ID</th>
                <th className="p-4 font-semibold">Time Window</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockVisitors.map((v, i) => (
                <tr key={i} className={`border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors ${v.status === 'Blacklisted' ? 'bg-red-500/5' : ''}`}>
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-[#94a3b8] font-bold text-sm">
                      {v.initial}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{v.name}</p>
                      <p className="text-[#64748b] text-xs">{v.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-[#94a3b8] text-sm">{v.purpose}</td>
                  <td className="p-4 text-[#94a3b8] text-sm">{v.host}</td>
                  <td className="p-4"><StatusBadge type={v.status} /></td>
                  <td className="p-4">
                    {v.qr !== '—' ? (
                      <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-mono font-medium flex items-center gap-1 w-max">
                        <QrCode className="w-3 h-3" /> {v.qr}
                      </span>
                    ) : <span className="text-[#64748b]">—</span>}
                  </td>
                  <td className="p-4">
                    {v.face ? (
                      <span className="text-emerald-500 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                    ) : (
                      <span className="text-[#64748b] text-xs">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-[#94a3b8] text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {v.timeAgo}</p>
                    {v.timeUntil && <p className="text-[#64748b] text-xs mt-0.5">{v.timeUntil}</p>}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {v.action === 'Check In' ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 ml-auto">
                        <UserPlus className="w-3.5 h-3.5" /> Check In
                      </button>
                    ) : v.action === 'Check Out' ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#64748b] ml-auto">
                        <UserCheck className="w-3.5 h-3.5" /> Check Out
                      </button>
                    ) : <span className="text-[#64748b] mr-4">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
