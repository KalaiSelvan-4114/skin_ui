import React, { useEffect, useRef, useState } from 'react';
import { validateImage } from '../utils/imageValidation';

function ImageInputSection({ onImageSelected, disabled }) {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      console.log('Cleaning up camera...');
      stopCamera();
    };
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setValidating(true);
    
    try {
      const validationResult = await validateImage(file);
      setValidation(validationResult);
      
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      
      // Only allow proceeding if there are no errors
      if (validationResult.isValid) {
        onImageSelected(file);
      } else {
        // Show validation errors prominently
        const errorMessages = validationResult.errors.map(e => e.message).join(' | ');
        setError(`❌ Validation Failed: ${errorMessages || 'Image does not meet requirements'}`);
        
        // Auto-clear invalid image after 4 seconds so user can read the error
        setTimeout(() => {
          setPreview(null);
          setValidation(null);
        }, 4000);
      }
    } catch (err) {
      setError('Failed to validate image: ' + err.message);
      setValidation(null);
    } finally {
      setValidating(false);
    }
    stopCamera();
  };

  const onInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const startCamera = async () => {
    try {
      setError('');
      setCameraLoading(true);
      
      // Stop any existing stream first
      stopCamera();
      
      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      // First set streaming to true to render the video element
      setStreaming(true);
      
      // Wait a bit for the video element to mount
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream acquired:', stream);
      
      // Check if video ref is available now
      if (!videoRef.current) {
        console.error('Video ref not available after stream acquired');
        setStreaming(false);
        setCameraLoading(false);
        setError('❌ Camera initialization failed: Video element not found. Please refresh and try again.');
        return;
      }
      
      console.log('Setting srcObject...');
      videoRef.current.srcObject = stream;
      
      // Wait for the video to be ready to play
      let ready = false;
      let attempts = 0;
      
      while (!ready && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ready = true;
          console.log('Video is ready, readyState:', videoRef.current.readyState);
        }
        attempts++;
      }
      
      if (!ready) {
        throw new Error('Video stream failed to initialize - timeout');
      }
      
      // Now try to play
      console.log('Attempting to play video...');
      try {
        await videoRef.current.play();
        console.log('Video playing successfully');
      } catch (playErr) {
        console.warn('Play error (will retry):', playErr);
        // Try again after a delay
        await new Promise(resolve => setTimeout(resolve, 200));
        await videoRef.current.play();
      }
      
      setCameraLoading(false);
      setPreview(null);
      setValidation(null);
      setError('');
      console.log('Camera initialized successfully');
      
    } catch (e) {
      console.error('Camera error details:', e);
      setCameraLoading(false);
      setStreaming(false);
      
      let errorMsg = '❌ Camera Failed: ';
      if (e.name === 'NotAllowedError') {
        errorMsg += 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (e.name === 'NotFoundError') {
        errorMsg += 'No camera device found on this device.';
      } else if (e.name === 'NotReadableError') {
        errorMsg += 'Camera is already in use. Close other applications using the camera.';
      } else if (e.name === 'TypeError') {
        errorMsg += 'Camera not available or not properly configured.';
      } else if (e.message === 'Camera not supported in this browser') {
        errorMsg += 'Your browser does not support camera access. Try Chrome, Firefox, or Edge.';
      } else if (e.message.includes('timeout') || e.message.includes('initialize')) {
        errorMsg += 'Camera stream initialization failed. Please refresh the page and try again.';
      } else {
        errorMsg += e.message || 'Unknown error occurred.';
      }
      
      setError(errorMsg);
    }
  };

  const stopCamera = () => {
    try {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    } finally {
      setStreaming(false);
    }
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera reference error. Please refresh and try again.');
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Wait for valid video dimensions
      let attempts = 0;
      while ((video.videoWidth === 0 || video.videoHeight === 0) && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError('Camera stream not ready. Please wait and try again.');
        return;
      }
      
      console.log(`Capturing: ${video.videoWidth}x${video.videoHeight}`);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          setError('Failed to capture image. Please try again.');
          return;
        }
        console.log('Image captured successfully');
        const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
        handleFile(file);
        stopCamera();
      }, 'image/png', 0.95);
    } catch (err) {
      console.error('Capture error:', err);
      setError(`Failed to capture: ${err.message}`);
    }
  };

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">
          1
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Upload or Capture</h3>
          <p className="text-sm text-gray-600 mt-1">Choose an image to analyze</p>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="space-y-4">
        {/* If not streaming and no preview, show upload area */}
        {!streaming && !preview && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="border-2 border-dashed border-blue-300 rounded-2xl p-12 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 text-center hover:bg-blue-100/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📸</div>
            <p className="text-gray-700 font-semibold text-lg mb-2">
              Drop your skin image here
            </p>
            <p className="text-gray-500 text-sm mb-6">
              or use one of the buttons below
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                disabled={disabled || validating}
                onClick={() => fileRef.current?.click()}
                className="group/btn relative px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="text-xl">📁</span>
                Choose Image
              </button>
              <button
                type="button"
                disabled={disabled || validating || cameraLoading || streaming}
                onClick={startCamera}
                className="group/btn relative px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                {cameraLoading ? (
                  <>
                    <span className="text-xl animate-spin">⚙️</span>
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <span className="text-xl">📷</span>
                    Open Camera
                  </>
                )}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onInputChange}
              className="hidden"
              disabled={disabled || validating}
            />
          </div>
        )}

        {/* If streaming, show camera view */}
        {streaming && (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border-3 border-emerald-400 shadow-2xl bg-black">
              <video 
                ref={videoRef} 
                autoPlay={true}
                playsInline={true}
                muted={true}
                className="w-full max-h-96 bg-black rounded-2xl" 
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  height: 'auto',
                  objectFit: 'cover'
                }}
              />
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
                <span className="animate-pulse">●</span>
                LIVE
              </div>
            </div>
            
            {/* Loading indicator while stream initializes */}
            {!videoRef.current?.srcObject && (
              <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-300 rounded-xl">
                <div className="animate-spin text-2xl">⚙️</div>
                <p className="text-sm text-blue-700 font-semibold">Initializing camera...</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={capture} 
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                ✓ Capture Photo
              </button>
              <button 
                onClick={() => stopCamera()}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-bold hover:from-gray-400 hover:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}

        {/* If preview exists, show it with validation results */}
        {preview && (
          <div>
            {validating && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-300 rounded-xl flex items-center gap-3">
                <div className="animate-spin text-2xl">🔄</div>
                <p className="text-sm text-blue-700 font-semibold">Validating image quality...</p>
              </div>
            )}
            
            {/* Validation details hidden for valid images */}

            <div className="relative rounded-2xl overflow-visible border-2 shadow-xl bg-gray-100 mb-3 inline-block w-full"
              style={{
                borderColor: validation && !validation.isValid ? '#DC2626' : '#10B981'
              }}>
              <img src={preview} alt="Selected" className="w-full max-h-96 object-contain rounded-2xl" />
              
              {/* Close button - X in circle at top right */}
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setValidation(null);
                  setError('');
                }}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 font-bold text-xl border-2 border-white"
                title="Remove image"
              >
                ✕
              </button>
              
              {/* INVALID overlay */}
              {validation && !validating && !validation.isValid && (
                <div className="absolute inset-0 bg-red-600/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-7xl font-black text-white drop-shadow-lg mb-2" style={{textShadow: '0 4px 6px rgba(0,0,0,0.5)'}}>
                      ✕
                    </div>
                    <div className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-2xl drop-shadow-lg">
                      INVALID IMAGE
                    </div>
                    <p className="text-white font-bold mt-2 drop-shadow-lg text-sm">Please upload a valid image</p>
                  </div>
                </div>
              )}

              {validating && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-4xl animate-spin">⏳</div>
                </div>
              )}
            </div>

            {validation && validation.isValid && (
              <div className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold border-2 border-emerald-400">
                <span>✓</span>
                <span>Image Ready for Analysis</span>
              </div>
            )}

            {validation && !validation.isValid && (
              <div className="mb-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 text-sm font-bold border-2 border-red-500">
                <span>✕</span>
                <span>IMAGE REJECTED - Does not meet requirements</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border-4 border-red-600 rounded-xl backdrop-blur-sm shadow-lg">
            <p className="text-base font-bold text-red-800">
              {error}
            </p>
            {(error.includes('Camera') || error.includes('camera')) && (
              <p className="text-sm text-red-700 mt-3 font-semibold leading-relaxed">
                💡 <strong>Troubleshooting:</strong><br/>
                • Check camera permissions in browser settings<br/>
                • Try refreshing the page<br/>
                • Use Chrome, Firefox, or Edge browser<br/>
                • On mobile, enable full-screen and landscape mode<br/>
                • Close other apps using the camera
              </p>
            )}
            {error.includes('Validation Failed') && (
              <p className="text-xs text-red-600 mt-2 font-semibold">
                ⚡ You cannot proceed until a valid image is provided. Please select or capture a different image.
              </p>
            )}
          </div>
        )}

        {/* Show warning list if any exist */}
        
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}

export default ImageInputSection;
