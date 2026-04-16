import React, { useState } from 'react';

const diseaseData = {
  acne: {
    name: 'Acne',
    desc: 'Pimples, blackheads, whiteheads',
    icon: '🔴',
    color: 'bg-red-50',
    borderColor: 'border-red-200',
    severity: 'medium',
    symptoms: ['Pimples and pustules', 'Blackheads and whiteheads', 'Oily skin', 'Scarring in severe cases'],
    causes: ['Excess oil production', 'Clogged hair follicles', 'Bacteria', 'Hormonal changes'],
    prevalence: '85% of people aged 12-24',
  },
  chickenpox: {
    name: 'Chickenpox',
    desc: 'Itchy blisters, fever, rash',
    icon: '🟡',
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    severity: 'medium',
    symptoms: ['Itchy, fluid-filled blisters', 'Fever and fatigue', 'Loss of appetite', 'Headache'],
    causes: ['Varicella-zoster virus', 'Highly contagious', 'Spread through air droplets', 'Direct contact with blisters'],
    prevalence: 'Common in childhood',
  },
  healthySkin: {
    name: 'Healthy Skin',
    desc: 'Normal, healthy appearance',
    icon: '💚',
    color: 'bg-green-50',
    borderColor: 'border-green-200',
    severity: 'none',
    symptoms: ['Even skin tone', 'Smooth texture', 'Good elasticity', 'No visible lesions'],
    causes: ['Good skincare routine', 'Healthy diet', 'Adequate hydration', 'Sun protection'],
    prevalence: 'Goal for everyone',
  },
  psoriasis: {
    name: 'Psoriasis',
    desc: 'Red patches, silvery scales',
    icon: '🟠',
    color: 'bg-orange-50',
    borderColor: 'border-orange-200',
    severity: 'high',
    symptoms: ['Red patches with silver scales', 'Dry, cracked skin', 'Itching and burning', 'Thickened nails'],
    causes: ['Autoimmune disorder', 'Genetic factors', 'Stress triggers', 'Environmental factors'],
    prevalence: '2-3% of population',
  },
  skinCancer: {
    name: 'Skin Cancer',
    desc: 'Changing moles, new growths',
    icon: '🔴',
    color: 'bg-red-50',
    borderColor: 'border-red-200',
    severity: 'high',
    symptoms: ['Changing moles', 'New skin growths', 'Sores that don\'t heal', 'Irregular borders'],
    causes: ['UV radiation exposure', 'Fair skin type', 'Family history', 'Weakened immune system'],
    prevalence: 'Most common cancer type',
  },
  vitiligo: {
    name: 'Vitiligo',
    desc: 'White patches, depigmentation',
    icon: '⚪',
    color: 'bg-gray-50',
    borderColor: 'border-gray-200',
    severity: 'low',
    symptoms: ['White patches on skin', 'Premature hair graying', 'Loss of color in tissues', 'Sensitivity to sun'],
    causes: ['Autoimmune condition', 'Genetic factors', 'Oxidative stress', 'Neural factors'],
    prevalence: '0.5-2% of population',
  },
};

const severityColors = {
  none: 'bg-green-100 text-green-800',
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const severityLabels = {
  none: 'No concern',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

function SupportedDiseases() {
  const [selectedDisease, setSelectedDisease] = useState(null);

  const diseases = [
    { key: 'acne' },
    { key: 'chickenpox' },
    { key: 'healthySkin' },
    { key: 'psoriasis' },
    { key: 'skinCancer' },
    { key: 'vitiligo' },
  ];

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Conditions We Can Detect
      </h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diseases.map((disease) => {
          const data = diseaseData[disease.key];
          return (
            <div
              key={disease.key}
              className={`${data.color} ${data.borderColor} border rounded-xl p-6 
                         hover:shadow-lg transition-all duration-300 hover:-translate-y-1
                         cursor-pointer group`}
              onClick={() => setSelectedDisease(disease.key)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {data.icon}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityColors[data.severity]}`}>
                  {severityLabels[data.severity]}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 text-lg">{data.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{data.desc}</p>
              <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 
                               flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedDisease(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${diseaseData[selectedDisease].color} p-6 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{diseaseData[selectedDisease].icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {diseaseData[selectedDisease].name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium 
                                    ${severityColors[diseaseData[selectedDisease].severity]}`}>
                      Severity: {severityLabels[diseaseData[selectedDisease].severity]}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDisease(null)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Symptoms
                </h4>
                <ul className="space-y-2">
                  {diseaseData[selectedDisease].symptoms.map((symptom, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Causes
                </h4>
                <ul className="space-y-2">
                  {diseaseData[selectedDisease].causes.map((cause, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Prevalence
                </h4>
                <p className="text-gray-600">{diseaseData[selectedDisease].prevalence}</p>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <button
                onClick={() => setSelectedDisease(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium 
                          text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportedDiseases;
