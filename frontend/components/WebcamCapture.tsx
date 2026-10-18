import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface WebcamCaptureProps {
  onImageSelected: (base64OrFile: string | File) => void;
  onRunDemo: () => void;
  isLoading: boolean;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onImageSelected,
  onRunDemo,
  isLoading,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      setCameraError("Camera access denied or unavailable. You can upload an image instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopCamera();
      onImageSelected(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        onImageSelected(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCameraError(null);
    stopCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-400" />
            1. Facial Image Input & Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture a live selfie or upload a high-resolution face image under balanced illumination.
          </p>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-brand-500/30 hover:from-cyan-600/50 hover:to-brand-500/50 border border-brand-500/40 text-brand-300 text-xs font-semibold transition-all shadow-sm hover:shadow-brand-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          Load Demo Case (Instant)
        </button>
      </div>

      {cameraError && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative aspect-[4/3] max-w-lg mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Patient Face Capture"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-500/90 text-white text-[11px] font-medium flex items-center gap-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Captured Ready
            </div>
          </div>
        ) : isCameraActive ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {/* Facial alignment oval guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-2 border-dashed border-brand-400/70 rounded-[50%] shadow-lg shadow-brand-500/20 animate-pulse-slow"></div>
            </div>
            <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-slate-900/80 text-[11px] text-brand-300 font-mono">
                Align face within the frame
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Camera className="w-8 h-8 text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">No Image Captured Yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Position face towards natural lighting. Avoid harsh backlighting or heavy filters.
              </p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Control Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {capturedImage ? (
          <button
            onClick={resetCapture}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retake / Change Image
          </button>
        ) : isCameraActive ? (
          <>
            <button
              onClick={captureSnapshot}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-brand-500/25 transition transform hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel Camera
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-brand-500/20 transition transform hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              Start Webcam
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Upload className="w-4 h-4 text-brand-400" />
              Upload Image File
            </button>
          </>
        )}
      </div>
    </div>
  );
};
