import { createContext, useContext, useState } from 'react';
import translations from '../../locales/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

    const toggleLanguage = () => {
        const next = language === 'en' ? 'uk' : 'en';
        setLanguage(next);
        localStorage.setItem('language', next);
    };

    const t = (key) => translations[language][key] || key;

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);