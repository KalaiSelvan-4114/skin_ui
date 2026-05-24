import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.png" alt="Derma Assist" className="w-12 h-12 object-contain rounded-md shadow" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t('appName')}</h1>
              <p className="text-xs text-gray-500">{t('poweredBy')}</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('home')}
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('faq')}
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t('about')}
              </a>
            </nav>
            <LanguageSelector />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col gap-3">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors py-2">
                {t('home')}
              </a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors py-2">
                {t('faq')}
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors py-2">
                {t('about')}
              </a>
              <div className="pt-2">
                <LanguageSelector />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
