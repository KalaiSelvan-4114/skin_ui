import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_API_URL || 'https://kalai4114-skin-server.hf.space';

function ChatbotAnalysis({ imageResult, onFinalResult }) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allQuestions = useMemo(() => {
    const primary = questions.primary_questions || [];
    const additional = questions.additional_questions || [];
    return [...primary, ...additional];
  }, [questions]);

  const questionTextMap = {
    'Do you see sharply white patches?': 'chatQuestionWhitePatches',
    'Are the patches increasing over time?': 'chatQuestionPatchesIncreasing',
    'Are patches present symmetrically?': 'chatQuestionPatchesSymmetrically',
    'Do you have oily skin on the affected area?': 'chatQuestionOilySkin',
    'Do you have itchy fluid-filled blisters?': 'chatQuestionItchyBlisters',
    'Are there thick scaly patches?': 'chatQuestionThickScalyPatches',
    'Is the affected area red and inflamed?': 'chatQuestionRedInflamed',
    'Do you have itching or burning?': 'chatQuestionItchingBurning',
    'Do you have fever along with the rash?': 'chatQuestionFeverRash',
    'Are there changing moles or new growths?': 'chatQuestionChangingMoles',
    'Do you notice blackheads or whiteheads?': 'chatQuestionBlackheadsWhiteheads',
    'Is there hair loss in the affected area?': 'chatQuestionHairLoss',
  };

  const translateQuestion = (question) => {
    if (!question) return '';
    const key = questionTextMap[question.trim()];
    return key ? t(key) : question;
  };

  const fetchQuestions = async () => {
    if (!imageResult?.prediction?.class) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/chatbot/get-questions`, {
        predicted_disease: imageResult.prediction.class,
      });
      setQuestions(res.data);
    } catch (e) {
      setError(t('failedToLoadQuestions'));
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (q, response) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: {
        question_id: q.id,
        symptom: q.symptom,
        response,
        related_disease: q.related_disease || imageResult?.prediction?.class,
        invert: !!q.invert,
      },
    }));
  };

  const submitFinal = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Check if all answers are "no"
      const answerValues = Object.values(answers);
      const allNo = answerValues.length > 0 && answerValues.every(a => a.response === 'no');
      
      console.log('Submitting with answers:', answerValues);
      console.log('All answers are no:', allNo);
      
      if (allNo) {
        // Use EfficientNet B3 fallback when all answers are "no"
        console.log('Using EfficientNet B3 fallback');
        const res = await axios.post(`${API_URL}/api/efficientnet-fallback`, {
          image: imageResult.images?.original,
        });
        console.log('Fallback response:', res.data);
        onFinalResult(res.data);
      } else {
        // Use standard chatbot final prediction
        console.log('Using standard chatbot final prediction');
        const payload = {
          image_prediction: {
            prediction: imageResult.prediction.class,
            confidence: imageResult.prediction.confidence,
            probabilities: imageResult.probabilities,
          },
          answered_questions: answerValues,
        };
        const res = await axios.post(`${API_URL}/api/chatbot/final-prediction`, payload);
        console.log('Chatbot response:', res.data);
        onFinalResult(res.data);
      }
    } catch (e) {
      setError(`${t('failedToComputeFinalDecision')}: ${e.response?.data?.error || e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!imageResult) return null;

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-amber-300 shadow-2xl p-8 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-lg shadow-lg">
          3
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{t('symptomAssessment')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('answerQuestionsToRefineDiagnosis')}</p>
        </div>
        <span className="ml-auto text-xs font-bold px-4 py-2 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
          {t('step3Of5')}
        </span>
      </div>

      {allQuestions.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-700 text-lg font-medium mb-6">
            {t('helpRefineDiagnosis')}
          </p>
          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto"
          >
            <span className="text-xl">❓</span>
            {loading ? t('loadingQuestions') : t('startAssessment')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <span className="font-bold">💡 {t('tipAnswerQuestions')}</span>
            </p>
          </div>

          {allQuestions.map((q, idx) => (
            <div key={q.id} className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-amber-300 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex-shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-gray-800 font-semibold text-lg flex-1">{translateQuestion(q.question)}</p>
              </div>
              <div className="flex gap-3 ml-10">
                <button
                  onClick={() => setAnswer(q, 'yes')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                    answers[q.id]?.response === 'yes' 
                      ? 'bg-green-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-green-50 hover:border-green-300'
                  }`}
                >
                  ✓ {t('yes')}
                </button>
                <button
                  onClick={() => setAnswer(q, 'no')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                    answers[q.id]?.response === 'no' 
                      ? 'bg-red-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-red-50 hover:border-red-300'
                  }`}
                >
                  ✕ {t('no')}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={submitFinal}
            disabled={submitting}
            className="w-full mt-8 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin">⚙️</span>
                {t('computingFinalDiagnosis')}
              </>
            ) : (
              <>
                <span>✓</span>
                {t('getFinalDiagnosis')}
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
    </section>
  );
}

export default ChatbotAnalysis;
