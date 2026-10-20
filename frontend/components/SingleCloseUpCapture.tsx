'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Focus,
  CheckCircle2,
  FlipHorizontal,
  Sliders,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface SingleCloseUpCaptureProps {
  onImageReady: (image: string | File) => void;
  onRunDemo: () => void;
  isLoading?: boolean;
}

export const SingleCloseUpCapture: React.FC<SingleCloseUpCaptureProps> = ({
  onImageReady,
  onRunDemo,
  isLoading = false,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useWebcam, setUseWebcam] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize and maintain camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (!useWebcam) return;
      setCameraError(null);

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode,
              width: { ideal: 1280 },
              height: { ideal: 960 },
            },
            audio: false,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        } else {
          setCameraError('Webcam access is not supported on this browser or connection.');
          setUseWebcam(false);
        }
      } catch (err: any) {
        console.warn('Webcam stream unavailable:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. You can still upload a photo directly.'
            : 'Camera could not be started. Please use the photo upload button.'
        );
        setUseWebcam(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useWebcam, facingMode]);

  // Capture frame from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(dataUrl);
    setSelectedFile(null);
  };

  // Handle uploaded photo from file dialog
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset current selection to retake
  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    if (!useWebcam) {
      setUseWebcam(true);
    }
  };

  // Submit image for multi-task pinpoint analysis
  const handleStartAnalysis = () => {
    if (selectedFile) {
      onImageReady(selectedFile);
    } else if (capturedImage) {
      onImageReady(capturedImage);
    }
  };

  return (
    <div className="rounded-3xl p-5 sm:p-7 bg-white border border-[#e6e2d8] space-y-4 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ede6] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f6f1] border border-[#d6e0ce] flex items-center justify-center text-[#425335] shadow-sm">
            <Focus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-normal text-[#1a2217] tracking-tight flex items-center gap-2">
              <span>Single Close-Up Face Scanner</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-clinical font-semibold bg-[#f4f6f1] text-[#425335] border border-[#cbd7c1]">
                DermaNova Spatial Protocol
              </span>
            </h3>
            <p className="text-xs text-[#6b7764] font-mono-clinical">
              One focused photo of your face or concern zone is all our AI needs to pinpoint 11+ conditions
            </p>
          </div>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isLoading}
          className="px-4 py-2 rounded-full bg-[#faf9f5] hover:bg-white border border-[#ded9cd] text-[#1a2217] text-xs font-mono-clinical font-semibold flex items-center gap-1.5 transition shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#b85c3c]" />
          <span>Demo Case (Sample Face)</span>
        </button>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-2xl bg-[#fbf0eb] border border-[#f3d3c7] text-[#b85c3c] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden bg-neutral-900 border border-[#e6e2d8] flex items-center justify-center shadow-md group">
        {capturedImage ? (
          /* Preview Mode of Captured/Uploaded Photo */
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Patient skin scan preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e6e2d8] text-[#1a2217] text-xs font-mono-clinical flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#637852]" />
              <span>Photo Ready for AI Pinpoint Analysis</span>
            </div>

            <button
              onClick={handleRetake}
              disabled={isLoading}
              className="absolute top-3 right-3 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-[#e6e2d8] text-[#1a2217] text-xs font-mono-clinical font-semibold flex items-center gap-1.5 backdrop-blur-md transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        ) : useWebcam ? (
          /* Live Camera Stream */
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Close-Up Focus Reticle Guide */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-60 h-76 rounded-[44px] border-2 border-dashed border-[#637852] shadow-[0_0_35px_rgba(99,120,82,0.3)] transition-all animate-pulse-slow relative">
                {/* Corner crosshairs in crisp white */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
              </div>
            </div>

            {/* Dynamic prompt overlay */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#e6e2d8] text-[11px] font-mono-clinical text-[#1a2217] pointer-events-none flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#637852] animate-ping" />
              <span>Frame close-up of face or affected skin</span>
            </div>

            {/* In-view Camera Action Overlay */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
                className="w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#e6e2d8] text-[#1a2217] flex items-center justify-center backdrop-blur-md transition shadow-md"
                title="Flip to back camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-white hover:bg-neutral-100 p-1 shadow-2xl transition transform active:scale-95 flex items-center justify-center ring-4 ring-[#637852]/30"
              >
                <div className="w-full h-full rounded-full border-2 border-white bg-[#1c2417] flex items-center justify-center text-white font-bold">
                  <Camera className="w-6 h-6" />
                </div>
              </button>

              <button
                onClick={() => setUseWebcam(false)}
                className="w-11 h-11 rounded-full bg-white/90 hover:bg-white border border-[#e6e2d8] text-[#1a2217] flex items-center justify-center backdrop-blur-md transition shadow-md"
                title="Upload Photo File"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          /* File Upload View */
          <div className="text-center p-6 space-y-4 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-inner">
              <Upload className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif-luxury text-base font-normal text-white">
                Upload 1 Close-Up Photo
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                Select a clear, well-lit photo of your face or concern area showing acne, redness, or spots.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-full bg-white hover:bg-neutral-100 text-[#1a2217] font-mono-clinical font-semibold text-xs transition shadow-lg"
              >
                Choose Photo from Device
              </button>
              <button
                onClick={() => setUseWebcam(true)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-200 text-xs font-mono-clinical transition"
              >
                Switch back to Live Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#6b7764] font-mono-clinical">
          <ShieldCheck className="w-4 h-4 text-[#637852] shrink-0" />
          <span>Single close-up scan • AI will pinpoint exact disease areas</span>
        </div>

        <button
          onClick={handleStartAnalysis}
          disabled={!capturedImage || isLoading}
          className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-mono-clinical font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md ${
            capturedImage && !isLoading
              ? 'bg-[#1c2417] hover:bg-[#2d3b25] text-white cursor-pointer active:scale-95'
              : 'bg-[#f0ede6] text-[#8b9784] cursor-not-allowed border border-[#e6e2d8]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Detecting Lesion Coordinates...</span>
            </>
          ) : (
            <>
              <span>Analyze & Locate Skin Diseases</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
