"use client";
import { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function EnrollmentModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !file) return;

    setStatus('loading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/user/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          // Reset state after close
          setTimeout(() => {
            setName('');
            setFile(null);
            setPreview(null);
            setStatus('idle');
          }, 300);
        }, 2000);
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to enroll face');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Network error. Is the backend running?');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-[#1e293b] rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b] bg-[#141b2d]">
          <h2 className="text-white font-semibold flex items-center gap-2">
            Add Face to Database
          </h2>
          <button onClick={onClose} className="text-[#64748b] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div>
            <label className="block text-[#94a3b8] text-sm font-medium mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-[#141b2d] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-[#94a3b8] text-sm font-medium mb-2">Face Image</label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${preview ? 'border-blue-500/50 bg-[#141b2d]' : 'border-[#1e293b] bg-[#141b2d] hover:border-blue-500/50 hover:bg-[#1e293b]/30'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                required
              />
              
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Upload className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-white text-sm font-medium">Click to upload image</p>
                  <p className="text-[#64748b] text-xs mt-1">JPEG/PNG only. Ensure facing forward.</p>
                </div>
              )}
            </div>
            {preview && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="text-red-400 text-xs font-medium mt-2 hover:text-red-300 transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              Successfully Enrolled!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              disabled={status === 'loading'}
              className="px-4 py-2 text-[#94a3b8] hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={status === 'loading' || !file || !name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              Enroll into System
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
