import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footerAboutTitle')}</h4>
            <p className="text-gray-400 text-sm">{t('footerAboutText')}</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footerDisclaimerTitle')}</h4>
            <p className="text-gray-400 text-sm">{t('footerDisclaimerText')}</p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">{t('footerTechnologyTitle')}</h4>
            <div className="flex flex-wrap gap-2">
              {['Flask', 'React', 'Tailwind', 'OpenStreetMap'].map((tech) => (
                <span 
                  key={tech}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          {t('footerCopyright')}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
