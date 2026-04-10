"use client";
import { Car, Search, ChevronDown, ShieldOff, ShieldAlert, Upload, Plus } from 'lucide-react';

const mockVehicles = [
  { plate: 'KA02 MN 1826', owner: 'Dr. Ragesh', type: 'Car', status: 'PARKED', reg: 'Registered', entry: '18m ago', exit: '—', action: 'Blacklist' },
  { plate: 'KA02 MM 9091', owner: 'Unknown', type: 'Car', status: 'PARKED', reg: 'Unknown', entry: '18m ago', exit: '—', action: 'Blacklist' },
  { plate: 'RJ14 CD 5678', owner: 'Amit Kumar', type: 'Motorcycle', status: 'MOVING', reg: 'Registered', entry: '1h ago', exit: '—', action: 'Blacklist' },
  { plate: 'RJ14 AB 1234', owner: 'Dr. Rakesh Tiwari', type: 'Car', status: 'PARKED', reg: 'Registered', entry: '1h ago', exit: '—', action: 'Blacklist' },
  { plate: 'DL01 BC 9012', owner: 'Visitor - Prof. Mishra', type: 'Car', status: 'PARKED', reg: 'Unknown', entry: '2h ago', exit: '—', action: 'Blacklist' },
  { plate: 'RJ14 CA 7742', owner: 'Unknown', type: 'Car', status: 'PARKED', reg: 'Unknown', entry: '2h ago', exit: '—', action: 'Blacklist' },
  { plate: 'RJ27 GH 7890', owner: 'Unknown', type: 'Truck', status: 'MOVING', reg: 'Blacklisted', entry: '4h ago', exit: '—', action: 'Unblacklist' },
  { plate: 'MH12 DE 1433', owner: 'Unknown', type: 'Car', status: 'EXITED', reg: 'Blacklisted', entry: '6h ago', exit: '5h ago', action: 'Unblacklist' },
  { plate: 'RJ14 EF 3456', owner: 'Priya Patel', type: 'Scooter', status: 'EXITED', reg: 'Registered', entry: '8h ago', exit: '2h ago', action: 'Blacklist' },
];

function StatCard({ label, count, colorClass }) {
  return (
    <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] p-6 flex flex-col justify-between h-32">
      <div className={`text-4xl font-bold ${colorClass}`}>{count}</div>
      <div className="text-[#64748b] text-sm font-medium">{label}</div>
    </div>
  );
}

function StatusBadge({ type }) {
  if (type === 'PARKED') return <span className="flex items-center gap-1.5 px-2 py-1 rounded text-blue-400 bg-blue-500/10 text-xs font-semibold border border-blue-500/20"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>PARKED</span>;
  if (type === 'MOVING') return <span className="flex items-center gap-1.5 px-2 py-1 rounded text-amber-500 bg-amber-500/10 text-xs font-semibold border border-amber-500/20"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>MOVING</span>;
  if (type === 'EXITED') return <span className="flex items-center gap-1.5 px-2 py-1 rounded text-[#94a3b8] bg-[#1e293b]/50 text-xs font-semibold border border-[#1e293b]"><div className="w-1.5 h-1.5 rounded-full bg-[#64748b]"></div>EXITED</span>;
  return null;
}

function RegBadge({ reg }) {
  if (reg === 'Registered') return <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold"><ShieldOff className="w-3.5 h-3.5" /> Registered</span>;
  if (reg === 'Unknown') return <span className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold"><ShieldAlert className="w-3.5 h-3.5" /> Unknown</span>;
  if (reg === 'Blacklisted') return <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold"><ShieldAlert className="w-3.5 h-3.5" /> Blacklisted</span>;
  return null;
}

export default function Vehicles() {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
        <StatCard label="Currently Parked" count="5" colorClass="text-blue-500" />
        <StatCard label="Moving on Campus" count="2" colorClass="text-amber-500" />
        <StatCard label="Exited Today" count="2" colorClass="text-slate-300" />
        <StatCard label="Blacklisted" count="2" colorClass="text-red-500" />
      </div>

      <div className="flex items-center gap-6 mb-6 text-xs">
        <span className="text-[#94a3b8] font-medium">Color key:</span>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-emerald-500">Registered</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-amber-500">Unknown</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-red-500">Blacklisted</span></div>
      </div>

      <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] flex flex-col mb-6">
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />
            Add Known Vehicle to Database
          </button>
          <button className="flex items-center gap-1 text-[#64748b] hover:text-white text-xs">
            <ChevronDown className="w-4 h-4" /> expand
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-[#64748b] text-[10px] tracking-widest font-bold uppercase">
                <th className="p-4 pl-6 font-semibold">License Plate</th>
                <th className="p-4 font-semibold">Owner</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Registration</th>
                <th className="p-4 font-semibold">Entry Time</th>
                <th className="p-4 font-semibold">Exit Time</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockVehicles.map((v, i) => (
                <tr key={i} className={`border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors ${v.reg === 'Blacklisted' ? 'bg-red-500/5' : v.reg === 'Unknown' ? 'bg-amber-500/5' : ''}`}>
                  <td className="p-4 pl-6">
                    <span className="text-white font-bold bg-[#1e293b] px-2 py-1 rounded text-sm tracking-wider border border-[#334155]">{v.plate}</span>
                  </td>
                  <td className={`p-4 text-sm font-medium ${v.reg === 'Registered' ? 'text-white' : 'text-[#94a3b8]'}`}>{v.owner}</td>
                  <td className="p-4 text-[#94a3b8] text-sm flex items-center gap-2 mt-1.5">
                    <Car className="w-4 h-4" /> {v.type}
                  </td>
                  <td className="p-4"><StatusBadge type={v.status} /></td>
                  <td className="p-4"><RegBadge reg={v.reg} /></td>
                  <td className="p-4 text-[#94a3b8] text-sm">{v.entry}</td>
                  <td className="p-4 text-[#94a3b8] text-sm">{v.exit}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className={`px-3 py-1.5 rounded text-xs font-semibold border ${v.action === 'Blacklist' ? 'border-[#334155] text-[#94a3b8] hover:text-white hover:border-[#64748b]' : 'border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20'}`}>
                      {v.action === 'Blacklist' ? <span className="flex items-center gap-1.5"><ShieldOff className="w-3.5 h-3.5" /> Blacklist</span> : <span className="flex items-center gap-1.5"><ShieldOff className="w-3.5 h-3.5" /> Unblacklist</span>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#1e293b]/30 transition-colors">
        <Upload className="w-6 h-6 text-blue-500 mb-2" />
        <p className="text-blue-400 font-medium text-sm">Demo Video Analysis <span className="text-[#64748b] font-normal">— upload a video to detect & log number plates</span></p>
      </div>
    </div>
  );
}
