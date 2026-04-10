"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { ShieldAlert, Activity, CheckCircle, Search, RefreshCw, X, Shield, BellRing, Clock, AlertCircle } from 'lucide-react';

const socket = io("http://localhost:4000");

function StatCard({ label, count, colorClass, icon: Icon }) {
  return (
    <div className={`bg-[#141b2d] rounded-xl border border-[#1e293b] p-6 flex flex-col justify-between h-32 relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-20">
         <Icon className={`w-12 h-12 ${colorClass}`} />
      </div>
      <div className="flex flex-col h-full justify-center z-10">
        <div className={`text-4xl font-bold ${colorClass}`}>{count}</div>
        <div className="text-[#64748b] text-sm tracking-widest font-bold uppercase mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    { id: 1, time: '10:32 PM', identity: 'Unknown Intruder', status: 'RED', camera: 'Cam 03 - Back Gate', ack: false },
    { id: 2, time: '10:15 PM', identity: 'Unknown', status: 'YELLOW', camera: 'Cam 01 - Main Lobby', ack: true },
    { id: 3, time: '09:45 PM', identity: 'Aakash Chaudhary', status: 'GREEN', camera: 'Cam 01 - Main Lobby', ack: true },
  ]);

  useEffect(() => {
    socket.on("alert", (data) => {
      setAlerts((prev) => [{ 
        id: Date.now(), 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        identity: data.identity || 'Unknown Entity', 
        status: data.status, 
        camera: 'Cam 01 - AI Feed', 
        ack: false 
      }, ...prev]);
    });
    return () => socket.off("alert");
  }, []);

  const acknowledgeAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, ack: true } : a));
  };

  const redCount = alerts.filter(a => a.status === 'RED').length;
  const unackCount = alerts.filter(a => !a.ack).length;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 shrink-0">
        <StatCard label="CRITICAL THREATS" count={redCount} colorClass="text-red-500" icon={ShieldAlert} />
        <StatCard label="UNRESOLVED ALERTS" count={unackCount} colorClass="text-amber-500" icon={BellRing} />
        <StatCard label="ALL DETECTIONS" count={alerts.length} colorClass="text-blue-500" icon={Activity} />
        <StatCard label="SYSTEM STATUS" count="SECURE" colorClass="text-emerald-500" icon={CheckCircle} />
      </div>

      <div className="bg-[#141b2d] rounded-xl border border-[#1e293b] flex flex-col flex-1 overflow-hidden min-h-0">
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b] shrink-0">
          <div>
            <h3 className="text-white font-bold tracking-wider uppercase text-sm">Real-time Alert Log</h3>
            <p className="text-[#64748b] text-xs mt-0.5">Showing {alerts.length} events</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search logs..." className="bg-[#0b0f19] border border-[#1e293b] text-sm text-white rounded-md pl-9 pr-4 py-1.5 focus:outline-none focus:border-blue-500 w-64 placeholder-[#64748b]" />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-medium bg-[#0b0f19]">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#141b2d] z-10 shadow">
              <tr className="border-b border-[#1e293b] text-[#64748b] text-[10px] tracking-widest font-bold uppercase">
                <th className="p-4 pl-6 font-semibold">Time</th>
                <th className="p-4 font-semibold">Threat Level</th>
                <th className="p-4 font-semibold">Identity</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className={`border-b border-[#1e293b]/50 transition-colors ${a.status === 'RED' && !a.ack ? 'bg-red-500/10' : a.status === 'YELLOW' && !a.ack ? 'bg-amber-500/5' : 'hover:bg-[#1e293b]/30'}`}>
                  <td className="p-4 pl-6 text-[#94a3b8] text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {a.time}
                  </td>
                  <td className="p-4">
                    {a.status === 'RED' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-red-500 bg-red-500/10 text-xs font-bold border border-red-500/30 w-max tracking-wide"><ShieldAlert className="w-3.5 h-3.5" /> CRITICAL (RED)</span>
                    ) : a.status === 'YELLOW' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-amber-500 bg-amber-500/10 text-xs font-bold border border-amber-500/30 w-max tracking-wide"><AlertCircle className="w-3.5 h-3.5" /> WARNING (YELLOW)</span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded text-emerald-500 bg-emerald-500/10 text-xs font-bold border border-emerald-500/30 w-max tracking-wide"><CheckCircle className="w-3.5 h-3.5" /> SAFE (GREEN)</span>
                    )}
                  </td>
                  <td className={`p-4 font-semibold text-sm ${a.status === 'GREEN' ? 'text-white' : 'text-slate-300'}`}>
                    {a.identity}
                  </td>
                  <td className="p-4 text-[#94a3b8] text-sm">
                    {a.camera}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {!a.ack && a.status !== 'GREEN' ? (
                      <button 
                        onClick={() => acknowledgeAlert(a.id)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${a.status === 'RED' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155]'}`}
                      >
                         Acknowledge
                      </button>
                    ) : (
                      <span className="text-emerald-500 text-xs font-bold flex items-center justify-end gap-1"><CheckCircle className="w-3.5 h-3.5" /> Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {alerts.length === 0 && (
             <div className="flex flex-col items-center justify-center p-12 text-[#64748b]">
               <Shield className="w-12 h-12 mb-4 opacity-50" />
               <p className="text-sm">No alerts recorded yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
