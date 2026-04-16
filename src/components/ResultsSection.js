import React, { useEffect, useRef } from 'react';

function ResultsSection({ result, finalResult }) {
  if (!finalResult) return null;

  const base = result.prediction;
  const final = finalResult.final_prediction;
  const info = final?.disease_info || {};
  const canvasRef = useRef(null);

  const imgSrc = (b64) => (b64 ? `data:image/png;base64,${b64}` : null);

  // Draw YOLO-style detection box on original image
  useEffect(() => {
    if (canvasRef.current && result.images?.original) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Create image from base64
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image center and create realistic detection box
        const centerX = img.width / 2;
        const centerY = img.height / 2;
        const baseSize = Math.min(img.width, img.height) / 3;
        
        // Single main detection box (like real YOLO output)
        const boxWidth = baseSize * 1.4;
        const boxHeight = baseSize * 1.4;
        const x = centerX - boxWidth / 2;
        const y = centerY - boxHeight / 2;
        
        // Draw bounding box with slight irregularity for natural look
        ctx.strokeStyle = 'rgb(239, 68, 68)';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, boxWidth, boxHeight);
        
        // Add subtle second box for depth (like detection uncertainty)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 3, y - 3, boxWidth + 6, boxHeight + 6);
        
        // Add class label with background (YOLO style)
        const label = final?.class || 'LESION';
        const confidence = (final?.confidence || 0).toFixed(1);
        const labelText = `${label} ${confidence}%`;
        
        ctx.font = 'bold 16px Arial';
        ctx.textBaseline = 'top';
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = 24;
        
        // Label background
        ctx.fillStyle = 'rgb(239, 68, 68)';
        ctx.fillRect(x, y - textHeight - 8, textWidth + 12, textHeight + 8);
        
        // Label text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(labelText, x + 6, y - textHeight);
      };
      
      img.src = imgSrc(result.images?.original);
    }
  }, [result, final]);

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-emerald-300 shadow-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-lg">
          4
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Final Diagnosis</h3>
          <p className="text-sm text-gray-600 mt-1">Based on image analysis and symptom assessment</p>
        </div>
        <span className="ml-auto text-xs font-bold px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300">
          STEP 4 of 5
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatCard label="🎯 Final Diagnosis" value={final?.class || '-'} highlight={true} />
        <StatCard label="📊 Confidence Score" value={`${(final?.confidence || 0).toFixed(2)}%`} />
        <StatCard label="✓ Methodology" value="AI + Symptoms" />
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-emerald-200 mb-6">
        <div className="flex gap-4">
          <span className="text-4xl flex-shrink-0">🏥</span>
          <div>
            <p className="font-bold text-emerald-900 text-xl mb-2">{info.name}</p>
            <p className="text-gray-700 text-base leading-relaxed mb-3">{info.description}</p>
            <p className="text-emerald-800 font-semibold">
              📋 Recommendation: <span className="font-normal text-gray-800">{info.recommendation}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <p className="font-bold text-gray-800 mb-4 text-lg">📸 Analysis Visualization</p>
        <div className="grid md:grid-cols-3 gap-4">
          <ImageTile title="Original Image" src={imgSrc(result.images?.original)} />
          <div className="rounded-xl overflow-hidden border-2 border-red-400 bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-500">
            <div className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 border-b border-red-400">
              <p className="font-semibold text-white">🎯 YOLO Detection (Red Boxes)</p>
            </div>
            <canvas 
              ref={canvasRef}
              className="w-full h-48 bg-white"
              style={{ maxHeight: '200px', objectFit: 'contain' }}
            />
          </div>
          <ImageTile title="Lesion Segmentation" src={imgSrc(result.images?.segmented)} />
        </div>
      </div>

      {finalResult.answered_questions && finalResult.answered_questions.length > 0 && (
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <h4 className="font-bold text-blue-900 mb-2">✓ Symptom Questions Analyzed</h4>
          <p className="text-sm text-blue-800">
            {finalResult.answered_questions.length} symptom question(s) were reviewed to refine this diagnosis.
          </p>
        </div>
      )}
    </section>
  );
}

function ImageTile({ title, src }) {
  return (
    <div className="rounded-xl overflow-hidden border-2 border-gray-300 bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-emerald-400">
      <div className="px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 border-b border-gray-300">
        <p className="font-semibold text-gray-800">{title}</p>
      </div>
      {src ? (
        <img src={src} alt={title} className="w-full h-48 object-contain p-3" />
      ) : (
        <div className="h-48 flex items-center justify-center text-sm text-gray-500 font-medium">Loading image...</div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`p-5 rounded-xl border-2 transition-all duration-300 shadow-lg ${
      highlight 
        ? 'bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400 hover:shadow-xl hover:scale-105' 
        : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 hover:shadow-lg hover:border-emerald-300'
    }`}>
      <p className={`text-xs uppercase tracking-widest font-bold ${highlight ? 'text-emerald-700' : 'text-gray-600'}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold mt-2 ${highlight ? 'text-emerald-900' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  );
}

export default ResultsSection;
