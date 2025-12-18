import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg">
                <button
                    onClick={() => setLanguage('km')}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${language === 'km'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-darkBlue hover:bg-gray-100'
                        }`}
                >
                    ខ្មែរ
                </button>
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${language === 'en'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-darkBlue hover:bg-gray-100'
                        }`}
                >
                    EN
                </button>
            </div>
        </div>
    );
}
