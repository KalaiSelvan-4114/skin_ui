import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SupportedDiseases from './components/SupportedDiseases';
import FindDoctorInline from './components/FindDoctorInline';
import ImageInputSection from './components/ImageInputSection';
import ResultsSection from './components/ResultsSection';
import ChatbotAnalysis from './components/ChatbotAnalysis';
import { useLanguage } from './context/LanguageContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://kalai4114-skin-server.hf.space';

function App() {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onImageSelected = (file) => {
    setSelectedImage(file);
    setImageResult(null);
    setFinalResult(null);
    setError('');
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError(t('pleaseUploadImageFirst'));
      return;
    }

    setLoading(true);
    setError('');
    setFinalResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      const res = await axios.post(`${API_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageResult(res.data);
    } catch (e) {
      const msg = e?.response?.data?.error || t('imageAnalysisFailed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16 py-8">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-sm">
              <span className="text-lg">🔬</span>
              <span className="text-sm font-semibold text-blue-300">{t('heroBadge')}</span>
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
            {t('heroTitle')}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-2">
            {t('heroSubtitle')}
          </p>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            {t('heroDetail')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <ImageInputSection onImageSelected={onImageSelected} disabled={loading} />
        </div>

        <div className="max-w-2xl mx-auto mb-8 text-center">
          <button
            onClick={analyzeImage}
            disabled={loading || !selectedImage}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⚙️</span>
                  {t('analyzingBtn')}
                </>
              ) : (
                <>
                  <span>🚀</span>
                  {t('analyzeImage')}
                </>
              )}
            </span>
          </button>
          {error && <p className="text-sm text-red-400 mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">{error}</p>}
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Show ChatBot Q&A first, then Results + Doctors */}
          {!finalResult && imageResult && <ChatbotAnalysis imageResult={imageResult} onFinalResult={setFinalResult} />}
          
          {finalResult && (
            <>
              <ResultsSection result={imageResult} finalResult={finalResult} />
              <FindDoctorInline finalResult={finalResult} />
            </>
          )}
        </div>

        <div className="mb-10">
          <SupportedDiseases />
        </div>

        <div className="mt-16" id="faq">
          <FAQ />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
