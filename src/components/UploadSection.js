import React, { useRef, useState } from 'react';

function UploadSection({ onImageSelected, disabled }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    onImageSelected(file);
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

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Upload or Capture Image</h3>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-2 border-dashed border-blue-300 rounded-xl p-6 bg-blue-50/40 text-center"
      >
        <p className="text-gray-700 mb-3">Drop a skin image here or choose a file.</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          Choose Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {preview && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Selected image preview</p>
          <img src={preview} alt="Selected" className="w-full max-h-64 object-contain rounded-lg border border-gray-200" />
        </div>
      )}
    </section>
  );
}

export default UploadSection;
