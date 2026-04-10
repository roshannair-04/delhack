"use client";
import { useState } from 'react';
import { Camera, Play, Square, UserPlus, RefreshCw, WifiOff } from 'lucide-react';
import EnrollmentModal from '@/components/EnrollmentModal';

export default function LiveFeed() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startWebcam = () => {
    setIsStreaming(!isStreaming);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <EnrollmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <div className="flex gap-6 h-[600px]">
        {/* Main Feed */}
        <div className="flex-1 bg-[#141b2d] rounded-xl border border-[#1e293b] flex flex-col overflow-hidden relative">
          <div className="flex items-center justify-between p-4 border-b border-[#1e293b] z-10 bg-[#0b0f19]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <h3 className="text-white font-semibold text-sm">AI Camera — Live Detection Feed</h3>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Add Face
              </button>
              <button 
                onClick={startWebcam}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-medium transition-colors ${
                  isStreaming ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isStreaming ? (
                  <><Square className="w-4 h-4 fill-white" /> Stop AI Stream</>
                ) : (
                  <><Play className="w-4 h-4 fill-white" /> Start AI Stream</>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {isStreaming ? (
              <img 
                src="http://127.0.0.1:8001/video_feed" 
                alt="AI Video Stream" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f19]">
                <Camera className="w-12 h-12 text-[#1e293b] mb-4" />
                <p className="text-[#334155] text-sm font-medium">Click "Start AI Stream" to begin backend AI monitoring</p>
                <p className="text-[#334155] text-xs font-medium mt-2 max-w-sm text-center">
                  Make sure you have launched `python stream_server.py` in your terminal first!
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[#1e293b] flex items-center justify-between mt-auto">
            <div className="flex items-center gap-6 text-xs font-medium">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-emerald-500">7 Online</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-red-500">1 Offline</span></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-amber-500">1 Maintenance</span></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#64748b] text-xs">Refreshed 10:36:44 PM</span>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <div className="flex items-center bg-[#0b0f19] px-1 py-1 rounded-md border border-[#1e293b]">
                 <span className="px-2 py-0.5 text-[#64748b] hover:text-white cursor-pointer text-xs">2x</span>
                 <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium">3x</span>
                 <span className="px-2 py-0.5 text-[#64748b] hover:text-white cursor-pointer text-xs">4x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Details */}
        <div className="w-80 flex flex-col gap-6">
          <div className="flex-1 bg-[#141b2d] rounded-xl border border-[#1e293b] p-4 flex flex-col">
            <h4 className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-4">Detections (0)</h4>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[#334155] text-xs">No persons detected</p>
            </div>
          </div>
          
          <div className="h-64 bg-[#141b2d] rounded-xl border border-[#1e293b] p-4 flex flex-col overflow-hidden">
            <h4 className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase mb-4">Face DB (3)</h4>
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex justify-between items-center bg-[#0b0f19] p-3 rounded border border-[#1e293b]">
                <span className="text-sm font-medium text-white">Aakash Chaudhary</span>
                <span className="text-[10px] text-[#64748b]">1 photo</span>
              </div>
              <div className="flex justify-between items-center bg-[#0b0f19] p-3 rounded border border-[#1e293b]">
                <span className="text-sm font-medium text-white">Adith Nambiar</span>
                <span className="text-[10px] text-[#64748b]">1 photo</span>
              </div>
              <div className="flex justify-between items-center bg-[#0b0f19] p-3 rounded border border-[#1e293b]">
                <span className="text-sm font-medium text-white">Raghav Chugh</span>
                <span className="text-[10px] text-[#64748b]">1 photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 bg-[#141b2d] rounded-xl border border-[#1e293b] border-dashed flex flex-col items-center justify-center p-8">
         <WifiOff className="w-8 h-8 text-[#334155] mb-2" />
         <p className="text-[#64748b] text-sm">No IP cameras connected</p>
      </div>
    </div>
  );
}
