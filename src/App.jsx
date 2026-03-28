import { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoRecorder } from './hooks/useVideoRecorder';

function App() {
  // Text State
  const [text, setText] = useState("Welcome to your Teleprompter!\n\nPaste your script here...\n\nClick 'Record' to begin.\n\nThis text should scroll automatically when you start recording.\n\nRecording will capture both video and audio.\n\nWhen you stop, you can download the video file.\n\nGood luck with your presentation!");
  
  // Scrolling State
  const [speed, setSpeed] = useState(30); // pixels per half second
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef(null);
  const animationRef = useRef(null);
  const speedRef = useRef(speed);
  const lastScrollTimeRef = useRef(0);

  // Customization State
  const [fontSize, setFontSize] = useState(64);
  const [backgroundColor, setBackgroundColor] = useState('#020617');
  const [textColor, setTextColor] = useState('#bae6fd');

  // Video Format State
  const [videoFormat, setVideoFormat] = useState('video/webm');
  const [supportedFormats, setSupportedFormats] = useState([]);

  // Video State
  const { recording, videoUrl, startRecording, stopRecording, downloadVideo, streamRef } = useVideoRecorder();

  // Check supported formats on mount
  useEffect(() => {
    const formats = [
      { mimeType: 'video/webm;codecs=vp9', label: 'WebM VP9 (Best)' },
      { mimeType: 'video/webm;codecs=vp8', label: 'WebM VP8' },
      { mimeType: 'video/webm', label: 'WebM (Default)' },
    ];

    const supported = formats.filter(format => 
      MediaRecorder.isTypeSupported(format.mimeType)
    );

    setSupportedFormats(supported.length > 0 ? supported : [{ mimeType: 'video/webm', label: 'WebM' }]);
  }, []);

  // Drag State
  const [previewPosition, setPreviewPosition] = useState({ x: 24, y: 320 }); // bottom-28 right-6 ≈ x:24, y:320
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);

  // Drag Handlers
  const handleDragStart = (e) => {
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Keep within screen bounds
    const maxX = window.innerWidth - 224;
    const maxY = window.innerHeight - 100;
    
    setPreviewPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove, {passive: false});
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, {passive: false});
      window.addEventListener('touchend', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset, handleDragEnd]);

  // Update speedRef when speed changes
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Scrolling Logic (Time-Based)
  useEffect(() => {
    if (isScrolling && scrollContainerRef.current) {
      const scroll = (timestamp) => {
        if (!lastScrollTimeRef.current) lastScrollTimeRef.current = timestamp;
        
        const elapsed = timestamp - lastScrollTimeRef.current;
        const speedPerSecond = speedRef.current;
        
        const scrollAmount = (speedPerSecond * elapsed) / 500;
        
        if (scrollAmount >= 1) {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop += scrollAmount;
            
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            
            if (scrollTop + clientHeight >= scrollHeight - 1) {
              setIsScrolling(false);
              lastScrollTimeRef.current = 0;
              return;
            }
          }
          lastScrollTimeRef.current = timestamp;
        }
        
        animationRef.current = requestAnimationFrame(scroll);
      };
      
      animationRef.current = requestAnimationFrame(scroll);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
      lastScrollTimeRef.current = 0;
    };
  }, [isScrolling]);

  // Handle Record Toggle
  const handleRecordToggle = () => {
    if (recording) {
      stopRecording();
      setIsScrolling(false);
    } else {
      startRecording(videoFormat);
      setIsScrolling(true);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans"
      style={{ backgroundColor }}
    >
      {/* Video Preview - Draggable Container */}
      {recording && (
        <div
          ref={previewRef}
          className={`fixed w-56 z-50 rounded-xl shadow-2xl shadow-black/50 cursor-move select-none ${
            isDragging ? 'scale-[1.02] opacity-90' : ''
          }`}
          style={{ 
            left: `${previewPosition.x}px`, 
            top: `${previewPosition.y}px`,
            willChange: 'transform, opacity'
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Drag Handle Bar */}
          <div className="h-4 bg-white/10 rounded-t-xl flex items-center justify-center border-b border-white/20">
            <div className="w-8 h-1 bg-white/30 rounded-full" />
          </div>
          
          {/* Video Element */}
          <video 
            ref={(video) => { 
              if (video && streamRef.current) video.srcObject = streamRef.current; 
            }} 
            autoPlay 
            muted 
            className="w-full transform scale-x-[-1] rounded-b-xl pointer-events-none" // 👈 Important: prevents video from intercepting events
          />
        </div>
      )}

      {/* Teleprompter Text Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        {/* Center Guide Line (subtle) */}
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-32 bg-white/5 pointer-events-none z-10" />
        
        <div 
          className="max-w-5xl mx-auto py-[50vh] px-12 leading-relaxed whitespace-pre-wrap outline-none text-center transition-colors duration-300"
          contentEditable={!recording}
          suppressContentEditableWarning
          onBlur={(e) => setText(e.target.innerText)}
          style={{ 
            fontSize: `${fontSize}px`,
            color: textColor
          }}
        >
          {text}
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t border-white/10 px-6 py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-10xl mx-auto">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Record Button (Primary) */}
            <button 
              onClick={handleRecordToggle}
              className={`px-10 py-4 rounded-xl font-bold text-base transition-all shadow-lg ${
                recording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse' 
                  : 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-sky-500/30'
              }`}
            >
              {recording ? 'Stop' : '● Record'}
            </button>

            {/* Download Button */}
            {videoUrl && (
              <button 
                onClick={downloadVideo} 
                className="px-6 py-4 bg-sky-500/20 hover:bg-sky-500/30 backdrop-blur rounded-xl font-semibold text-base transition-all border border-sky-500/30"
              >
                Download
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-12 bg-white/20 hidden sm:block" />

            {/* Speed Control */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Speed</div>
                <div className="text-white font-mono text-lg">{speed}</div>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32 accent-sky-500"
              />
            </div>

            {/* Font Size Control */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Font</div>
                <div className="text-white font-mono text-lg">{fontSize}</div>
              </div>
              <input 
                type="range" 
                min="32" 
                max="128" 
                step="4"
                value={fontSize} 
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-32 accent-sky-500"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-white/20 hidden sm:block" />

            {/* Color Pickers */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">BG</span>
                <label className="relative cursor-pointer">
                  <input 
                    type="color" 
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    disabled={recording}
                  />
                  <div 
                    className="w-10 h-10 rounded-lg border border-white/30 hover:border-white transition-colors shadow-lg"
                    style={{ backgroundColor }}
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Text</span>
                <label className="relative cursor-pointer">
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                    disabled={recording}
                  />
                  <div 
                    className="w-10 h-10 rounded-lg border border-white/30 hover:border-white transition-colors shadow-lg"
                    style={{ backgroundColor: textColor }}
                  />
                </label>
              </div>
            </div>

            {/* Format Selector */}
            <select 
              value={videoFormat}
              onChange={(e) => setVideoFormat(e.target.value)}
              className="bg-white/10 text-white px-4 py-3 rounded-xl border border-white/20 focus:border-sky-500 outline-none text-sm font-medium"
              disabled={recording}
            >
              {supportedFormats.map((format) => (
                <option key={format.mimeType} value={format.mimeType} className="bg-gray-900">
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;