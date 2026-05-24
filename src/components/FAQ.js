import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://kalai4114-skin-server.hf.space';

function FAQ() {
  const { language, t } = useLanguage();
  const [faqData, setFaqData] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQ();
  }, [language]);

  const localizedFaqs = {
    ta: [
      { question: 'இந்த AI நோயறிதல் எவ்வளவு துல்லியம்?', answer: 'எங்கள் AI மாதிரி சுமார் 85-90% துல்லியத்தை அடைகிறது. இருப்பினும், சரியான மதிப்பீட்டிற்கு எப்போதும் ஒரு தோல் மருத்துவரை அணுகவும்.' },
      { question: 'எந்த வகையான தோல் நிலைகளை இது கண்டறியும்?', answer: 'தற்போது: முகப்பரு, சின்னம்மை, ஆரோக்கியமான தோல், சொரியாசிஸ், தோல் புற்றுநோய் மற்றும் வெண்குஷ்டம்.' },
      { question: 'இந்த பயன்பாடு நோயறிதலை வழங்குமா?', answer: 'இல்லை. நோயறிதல் அம்சங்கள் நீக்கப்பட்டுள்ளன. கல்வி உள்ளடக்கம் மற்றும் அருகிலுள்ள தோல் மருத்துவர் தேடலுக்காக இந்த பயன்பாட்டைப் பயன்படுத்தவும்.' },
    ],
    hi: [
      { question: 'यह AI निदान कितना सटीक है?', answer: 'हमारा AI मॉडल लगभग 85-90% सटीकता प्राप्त करता है। हालांकि, उचित मूल्यांकन के लिए हमेशा त्वचा विशेषज्ञ से सलाह लें।' },
      { question: 'यह किन त्वचा स्थितियों का पता लगा सकता है?', answer: 'वर्तमान में: मुंहासे, चिकनपॉक्स, स्वस्थ त्वचा, सोरायसिस, त्वचा कैंसर, और विटिलिगो।' },
      { question: 'क्या यह ऐप निदान प्रदान करता है?', answer: 'नहीं। निदान सुविधाएँ हटा दी गई हैं। इस ऐप का उपयोग शैक्षिक सामग्री और पास के त्वचा विशेषज्ञ खोज के लिए करें।' },
    ],
  };

  const fetchFAQ = async () => {
    if (language !== 'en' && localizedFaqs[language]) {
      setFaqData(localizedFaqs[language]);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/faq`);
      setFaqData(response.data.faq);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      // Fallback FAQ data
      setFaqData([
        {
          question: t('faqFallbackQ1'),
          answer: t('faqFallbackA1')
        },
        {
          question: t('faqFallbackQ2'),
          answer: t('faqFallbackA2')
        },
        {
          question: t('faqFallbackQ3'),
          answer: t('faqFallbackA3')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {t('frequentlyAskedQuestions')}
      </h3>

      <div className="space-y-3">
        {faqData.map((item, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-purple-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-purple-50 transition-colors"
            >
              <span className="font-medium text-gray-800 pr-4">{item.question}</span>
              <svg 
                className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 py-4 bg-white border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {t('proTipsForBestResults')}
        </h4>
        <ul className="text-sm text-purple-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            {t('faqTip1')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            {t('faqTip2')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            {t('faqTip3')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-1">•</span>
            {t('faqTip4')}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FAQ;
