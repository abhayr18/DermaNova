'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  FlipHorizontal,
  Sun,
  Eye,
  Sliders,
  Check
} from 'lucide-react';

interface CaptureUploadScreenProps {
  onImageSelected: (image: string | File) => void;
  onUseSampleImage: () => void;
  isLoading?: boolean;
}

export const CaptureUploadScreen: React.FC<CaptureUploadScreenProps> = ({
  onImageSelected,
  onUseSampleImage,
  isLoading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize webcam when enabled
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
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
            setCameraPermissionGranted(true);
          }
        } else {
          setCameraError('Camera access is not supported on this browser.');
          setUseWebcam(false);
        }
      } catch (err: any) {
        console.warn('Webcam stream error:', err);
        setCameraPermissionGranted(false);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Please allow access in browser settings or upload a file directly.'
            : 'Camera could not be accessed. Please upload a photo from your device.'
        );
        setUseWebcam(false);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [useWebcam, facingMode]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 15MB limit. Please choose a smaller photo.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPEG, PNG, or WebP photograph.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setUseWebcam(false);
  };

  // Capture frame from webcam
  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 960;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSelectedImage(dataUrl);
    setSelectedFile(null);
    setUseWebcam(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    if (!consentGiven) {
      setErrorMessage('Please confirm your consent for photo processing before proceeding.');
      return;
    }
    if (selectedFile) {
      onImageSelected(selectedFile);
    } else {
      onImageSelected(selectedImage);
    }
  };

  const handleDemoTrigger = () => {
    setSelectedImage('/editorial_skin_portrait.jpg');
    setSelectedFile(null);
    setConsentGiven(true);
    setUseWebcam(false);
    onUseSampleImage();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* Heading & Subtitle */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#527665] font-semibold">
          Facial Photo Capture
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#252923] font-normal tracking-tight">
          Let's take a closer look at your skin.
        </h1>
        <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
          Position your face evenly under natural daylight. Our vision model assesses visible skin patterns without altering your facial data.
        </p>
      </div>

      {/* Main Capture Box */}
      <div className="rounded-3xl bg-white border border-[#E8E8E1] p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#fff5f5] border border-[#fed7d7] text-[#9b2c2c] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="underline font-mono">
              Dismiss
            </button>
          </div>
        )}

        {cameraError && (
          <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[#E8E8E1] text-[#777D76] text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-[#527665] shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Central Capture/Preview Viewport */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[460px] rounded-2xl overflow-hidden bg-[#FAF9F6] border-2 border-dashed border-[#E8E8E1] flex flex-col items-center justify-center">
          
          {/* STATE A: Selected Image Preview */}
          {selectedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/5">
              <img
                src={selectedImage}
                alt="Selected Face Preview"
                className="w-full h-full object-contain"
              />

              {/* Facial Alignment Overlay Over Image */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[65%] sm:w-[55%] h-[80%] sm:h-[75%] border border-[#527665]/40 rounded-[48%] border-dashed flex flex-col justify-between py-6 sm:py-8 px-4">
                  {/* Eye Level Line */}
                  <div className="w-full border-t border-[#527665]/30 relative">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#527665] bg-white/80 px-1 rounded">
                      Eye Level
                    </span>
                  </div>
                  {/* Chin Level Line */}
                  <div className="w-1/2 mx-auto border-t border-[#527665]/30 relative">
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#527665] bg-white/80 px-1 rounded">
                      Chin
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready Tag */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E8E8E1] text-xs font-mono text-[#304D40] flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#527665]" />
                <span>Photo Loaded & Framed</span>
              </div>

              {/* Quick Actions (Replace / Remove) */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-[#252923] border border-[#E8E8E1] text-xs font-mono transition shadow-sm"
                >
                  Remove Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-[#252923] border border-[#E8E8E1] text-xs font-mono transition shadow-sm"
                >
                  Replace Photo
                </button>
              </div>
            </div>
          ) : useWebcam ? (
            /* STATE B: Live Webcam Stream with Alignment Guide */
            <div className="relative w-full h-full bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Facial Alignment Guide (Oval + Chin + Eye Guide) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[65%] sm:w-[55%] h-[80%] sm:h-[75%] border-2 border-white/60 rounded-[48%] flex flex-col justify-between py-8 sm:py-10 px-4">
                  <div className="w-full border-t border-white/40 relative">
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">
                      Position Eyes Here
                    </span>
                  </div>
                  <div className="w-1/3 mx-auto border-t border-white/40 relative">
                    <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white bg-black/40 px-1.5 py-0.5 rounded">
                      Chin
                    </span>
                  </div>
                </div>
              </div>

              {/* Webcam Controls */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between z-20">
                <button
                  type="button"
                  onClick={() => setUseWebcam(false)}
                  className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-mono transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={captureWebcamSnapshot}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#FAF9F6] text-[#252923] text-xs font-mono font-bold flex items-center gap-2 shadow-lg active:scale-95 transition"
                >
                  <Camera className="w-4 h-4 text-[#527665]" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
                  }
                  className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white transition"
                  title="Flip camera"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STATE C: Empty / Initial Prompt */
            <div className="text-center p-6 space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-3xl bg-[#E8EFE9] text-[#304D40] flex items-center justify-center mx-auto shadow-sm">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-[#252923]">
                  Ready for your skin capture
                </h3>
                <p className="text-xs text-[#777D76]">
                  Upload an existing photo from your device or use your webcam with our facial alignment guide.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#304D40] hover:bg-[#253d33] text-white font-mono text-xs font-medium flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUseWebcam(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F6] border border-[#E8E8E1] text-[#252923] font-mono text-xs font-medium flex items-center justify-center gap-2 transition"
                >
                  <Camera className="w-4 h-4 text-[#527665]" />
                  <span>Use Camera</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoTrigger}
                  className="text-[11px] font-mono text-[#527665] hover:underline"
                >
                  Or test with high-resolution Sample Face Portrait ➔
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Photo Quality Guidance Checklist */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F6] border border-[#E8E8E1] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#304D40] font-semibold">
            <Sun className="w-4 h-4 text-[#527665]" />
            Photo Quality Guidance Checklist
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-[#777D76]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>Face clearly visible & centered</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>Neutral, even natural daylight</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>No beauty filters or smoothing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>Remove sunglasses & clear bangs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>Clean, neutral background</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#527665] shrink-0" />
              <span>JPEG, PNG, WebP up to 15MB</span>
            </div>
          </div>
        </div>

        {/* Consent & Privacy Checkbox */}
        <div className="p-4 rounded-2xl border border-[#E8E8E1] bg-white space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-[#E8E8E1] text-[#527665] focus:ring-[#527665]"
            />
            <div className="space-y-0.5 text-xs text-[#252923]">
              <span className="font-mono font-medium">
                Biometric Analysis Consent & Privacy Confirmation
              </span>
              <p className="text-[11px] text-[#777D76] leading-relaxed">
                I agree to have my facial photograph analyzed for visible skin concerns in accordance with DermaNova's Privacy Policy. Photos are processed strictly to generate my skin analysis and routine, and can be deleted at any time.
              </p>
            </div>
          </label>
        </div>

        {/* Action Button: Analyze My Skin */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-[11px] font-mono text-[#777D76] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#527665]" />
            <span>Encrypted Biometric Processing • Zero Advertising Data Sharing</span>
          </div>

          <button
            type="button"
            disabled={!selectedImage || !consentGiven || isLoading}
            onClick={handleAnalyze}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#304D40] hover:bg-[#253d33] disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition shadow-[0_4px_16px_rgba(48,77,64,0.18)]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Photo...</span>
              </>
            ) : (
              <>
                <span>Analyze My Skin</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
