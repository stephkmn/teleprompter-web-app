import { useRef, useState } from 'react';

export const useVideoRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      // Request Camera & Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      streamRef.current = stream;

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Collect Data
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Handle Stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        
        // Stop camera light
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setVideoUrl(null);
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Camera/Mic access denied. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = videoUrl;
      a.download = `teleprompter-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  return { recording, videoUrl, startRecording, stopRecording, downloadVideo, streamRef };
};