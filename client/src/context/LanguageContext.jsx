import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'hi', name: 'हिंदी', dir: 'ltr' },
    { code: 'ur', name: 'اردو', dir: 'rtl' },
    { code: 'te', name: 'తెలుగు', dir: 'ltr' },
];

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('medsure_lang') || 'en';
    });

    // Apply language direction and lang attribute to <html>
    useEffect(() => {
        const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', langConfig.dir);
        localStorage.setItem('medsure_lang', lang);
    }, [lang]);

    /**
     * Translate a key. Falls back to English if key missing in selected language.
     */
    const t = useCallback((key, vars = {}) => {
        const dict = translations[lang] || translations['en'];
        let text = dict[key] ?? translations['en'][key] ?? key;

        if (typeof text !== 'string') return key;

        Object.keys(vars).forEach(k => {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
        });

        return text;
    }, [lang]);

    const changeLanguage = useCallback((code) => {
        console.log("changeLanguage called with:", code);
        const found = SUPPORTED_LANGUAGES.find(l => l.code === code);
        console.log("Found language config:", found);
        if (found) {
            console.log("Setting lang state to:", code);
            setLang(code);
        } else {
            console.error("Language code not found in SUPPORTED_LANGUAGES:", code);
        }
    }, []);

    const currentLang = useMemo(() =>
        SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0],
        [lang]);

    const value = useMemo(() => ({
        lang,
        t,
        changeLanguage,
        currentLang,
        SUPPORTED_LANGUAGES
    }), [lang, t, changeLanguage, currentLang]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
};

export default LanguageContext;
