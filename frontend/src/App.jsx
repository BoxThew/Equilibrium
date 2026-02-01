import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';

// --- PAGE 1: HOME PAGE ---
const HomePage = ({ onStart }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12 animate-in fade-in duration-700 font-sans">
    <div>
      <h1 className="text-7xl font-black italic leading-[1.1] mb-6 tracking-tighter">
        CrimeCatcher.
      </h1>
      <p className="text-xl text-gray-500 max-w-md mb-10">
        A smarter way to monitor crime in real time, for a safer tomorrow.
      </p>
      <button 
        onClick={onStart}
        className="bg-black text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10"
      >
        Get Started <ArrowRight size={20} />
      </button>
    </div>

    <div className="relative">
      <div className="bg-gray-50 rounded-[3rem] border border-gray-200 aspect-square shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-5 flex gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4 p-10 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-400 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// --- PAGE 2: CAMERA FEED PAGE ---
const CameraPage = () => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('SECURE');
  const [lastAlert, setLastAlert] = useState(null);

  useEffect(() => {
    // 1. Setup Webcam Stream with better constraints
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play(); // Explicitly start playback
          }
        })
        .catch((err) => {
          console.error("Webcam access error:", err);
          alert("Camera access denied or not available. Please check browser permissions.");
        });
    }

    // 2. Poll for status updates from Python backend
    const checkStatus = () => {
      fetch('http://127.0.0.1:5001/api/status')
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setStatus(data.status);
          }
          if (data.lastAlert) {
            setLastAlert(data.lastAlert);
          }
        })
        .catch(err => console.error("Backend connection error:", err));
    };

    // Initial check
    checkStatus();

    // Poll every 2 seconds
    const interval = setInterval(checkStatus, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Determine status color
  const getStatusColor = () => {
    switch(status) {
      case 'WEAPON DETECTED':
      case 'THREAT DETECTED':
        return 'bg-red-500';
      case 'SUSPICIOUS':
        return 'bg-orange-500';
      case 'PERSON DOWN':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-700 font-sans">
      <header className="mb-8">
        <h1 className="text-5xl font-black italic mb-2 tracking-tighter">Live Camera.</h1>
        <p className="text-gray-400 font-semibold">Real-time threat detection system</p>
      </header>

      {/* Main Video Feed */}
      <div className="relative aspect-video bg-black rounded-[2.5rem] shadow-2xl mb-8 overflow-hidden flex items-center justify-center border border-gray-100">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        
        {/* Live Indicator */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">Live Feed</span>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-6 right-6 flex items-center gap-2 ${getStatusColor()} backdrop-blur-md px-4 py-2 rounded-full border border-white/20`}>
          <ShieldAlert size={16} className="text-white" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">{status}</span>
        </div>
      </div>

      {/* Alert Panel */}
      {lastAlert && status !== 'SECURE' && (
        <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-600 mb-1">{lastAlert.event_type}</h3>
              <p className="text-gray-600 mb-2">{lastAlert.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Time: {new Date(lastAlert.timestamp).toLocaleTimeString()}</span>
                <span>•</span>
                <span>Confidence: {lastAlert.confidence_score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-1">Detection Mode</h4>
          <p className="text-sm text-gray-500">Continuous monitoring active</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-1">AI Model</h4>
          <p className="text-sm text-gray-500">YOLOv8 + MediaPipe + EyePop</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h4 className="font-bold text-gray-800 mb-1">Response Status</h4>
          <p className="text-sm text-gray-500">Automated alerts enabled</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 lg:p-12 selection:bg-black selection:text-white font-sans">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center mb-12">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => setCurrentPage('home')}
        >
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
             <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
          </div>
          <span className="font-black text-2xl tracking-tighter italic">CrimeCatcher.</span>
        </div>
        <div className="hidden md:flex gap-10 text-[13px] font-bold uppercase tracking-tight">
          <button 
            onClick={() => setCurrentPage('camera')} 
            className={`transition-all ${currentPage === 'camera' ? 'text-black border-b-2 border-black' : 'text-gray-300 hover:text-black'}`}
          >
            Real-Time Analysis
          </button>
        </div>
      </nav>

      {/* CONTENT SWITCHER */}
      {currentPage === 'home' ? (
        <HomePage onStart={() => setCurrentPage('camera')} />
      ) : (
        <CameraPage />
      )}
    </div>
  );
}