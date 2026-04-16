import React, { useEffect, useRef, useState } from 'react';

function CameraCapture({ onImageSelected, disabled }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStreaming(true);
    } catch (e) {
      setError('Camera access failed. Please allow camera permission or use upload.');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreaming(false);
  };

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
      onImageSelected(file);
    }, 'image/png');
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Camera Capture (Optional)</h3>

      {!streaming ? (
        <button
          disabled={disabled}
          onClick={startCamera}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
        >
          Start Camera
        </button>
      ) : (
        <div className="space-y-3">
          <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-lg border border-gray-200" />
          <div className="flex gap-2">
            <button onClick={capture} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Capture
            </button>
            <button onClick={stopCamera} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300">
              Stop
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}

export default CameraCapture;
