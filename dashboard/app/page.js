"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Activity, BellRing, Camera, ShieldAlert, Moon, Package, Users, Shield, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io("http://localhost:4000");

const mockTraffic = [
  { time: '6AM', entries: 15, exits: 5 }, { time: '7AM', entries: 40, exits: 12 },
  { time: '8AM', entries: 120, exits: 30 }, { time: '9AM', entries: 90, exits: 45 },
  { time: '10AM', entries: 40, exits: 35 }, { time: '11AM', entries: 35, exits: 40 },
  { time: '12PM', entries: 50, exits: 45 }, { time: '1PM', entries: 45, exits: 50 },
  { time: '2PM', entries: 60, exits: 55 }, { time: '3PM', entries: 35, exits: 40 },
  { time: '4PM', entries: 40, exits: 60 }, { time: '5PM', entries: 70, exits: 110 },
  { time: '6PM', entries: 45, exits: 80 }, { time: '7PM', entries: 30, exits: 40 },
  { time: '8PM', entries: 20, exits: 30 }, { time: '9PM', entries: 15, exits: 20 },
  { time: '10PM', entries: 5, exits: 15 }, { time: '11PM', entries: 2, exits: 5 },
];

function StatCard({ title, value, icon: Icon, stat, statColor, iconBg, subtext }) {
  return (
    <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] p-5 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#94a3b8] text-sm font-medium mb-1">{title}</p>
          <div className="text-3xl font-bold text-white">{value}</div>
        </div>
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5 text-white opacity-80" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {stat && (
          <div className={`flex items-center text-xs font-semibold ${statColor}`}>
            {stat.includes('+') || stat.includes('↑') ? <ArrowUp className="w-3 h-3 mr-1" /> : (stat.includes('↓') || stat.includes('-') ? <ArrowDown className="w-3 h-3 mr-1" /> : null)}
            {stat}
          </div>
        )}
        {subtext && <div className="text-[#64748b] text-xs">{subtext}</div>}
      </div>
    </div>
  );
}

export default function Overview() {
  const [alerts, setAlerts] = useState([
    { status: 'RED', identity: 'Unknown person detected by live camera', time: '8m ago', ack: false },
    { status: 'RED', identity: 'Unknown person detected by live camera', time: '8m ago', ack: false },
    { status: 'RED', identity: 'Unknown person detected by live camera', time: '9m ago', ack: false },
    { status: 'RED', identity: 'Unknown person detected by live camera', time: '9m ago', ack: false },
    { status: 'RED', identity: 'Unknown person detected by live camera', time: '11m ago', ack: true },
  ]);

  useEffect(() => {
    socket.on("alert", (data) => {
      setAlerts((prev) => [{ status: data.status, identity: data.identity, time: 'Just now', ack: false }, ...prev]);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Entries Today" value="458" icon={Activity} stat="↑ 12%" statColor="text-emerald-500" subtext="vs yesterday" iconBg="bg-blue-500/20 text-blue-500" />
        <StatCard title="Active Alerts" value="7" icon={BellRing} stat="" statColor="" subtext="2 RED • 1 YELLOW" iconBg="bg-red-500/20 text-red-500" />
        <StatCard title="Cameras Online" value="7/9" icon={Camera} stat="" statColor="" subtext="2 offline/maintenance" iconBg="bg-emerald-500/20 text-emerald-500" />
        <StatCard title="Unauthorized Attempts" value="2" icon={ShieldAlert} stat="↓ 90%" statColor="text-emerald-500" subtext="this month" iconBg="bg-amber-500/20 text-amber-500" />
        
        <StatCard title="Night-Out Active" value="4" icon={Moon} stat="" statColor="" subtext="0 overdue" iconBg="bg-indigo-500/20 text-indigo-500" />
        <StatCard title="Parcels Pending" value="4" icon={Package} stat="" statColor="" subtext="1 escalated (48h+)" iconBg="bg-orange-500/20 text-orange-500" />
        <StatCard title="Visitors on Campus" value="2" icon={Users} stat="" statColor="" subtext="1 pre-registered pending" iconBg="bg-cyan-500/20 text-cyan-500" />
        <div className="bg-[#141b2d] rounded-xl border border-red-500/30 p-5 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-red-500" />
             </div>
          </div>
          <div>
            <p className="text-[#94a3b8] text-sm font-medium mb-1">Threat Level</p>
            <div className="text-3xl font-extrabold text-white tracking-widest mt-1">ELEVATED</div>
          </div>
          <div className="text-red-400 text-xs font-semibold">7 active RED alerts</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#141b2d] rounded-xl border border-[#1e293b] p-5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Recent Alerts</h3>
            <button className="text-blue-400 text-sm font-medium hover:text-blue-300">View All ↗</button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="bg-[#0b0f19] border border-red-500/20 p-3 rounded-lg flex items-start gap-3">
                <div className="bg-red-500/20 p-2 rounded-full mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {alert.status}
                    </span>
                    <span className="text-[#64748b] text-xs">{alert.time}</span>
                  </div>
                  <p className="text-white text-sm font-medium leading-snug">{alert.identity || "Unknown person detected"}</p>
                  {alert.ack && <p className="text-[#64748b] text-xs mt-1">Acknowledged by guard</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#141b2d] rounded-xl border border-[#1e293b] p-5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold">Today's Traffic</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-[#94a3b8]">Entries</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-500"></div><span className="text-[#94a3b8]">Exits</span></div>
            </div>
          </div>
          <div className="flex-1 w-full h-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={0}>
              <BarChart data={mockTraffic} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#1e293b', opacity: 0.4 }} contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Bar dataKey="entries" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="exits" fill="#64748b" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
