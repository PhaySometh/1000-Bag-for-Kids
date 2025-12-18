import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'km' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations: Record<Language, Record<string, string>> = {
    km: {
        // Hero section
        'hero.title.prefix': 'មូលនិធិ',
        'hero.title.number': '៥ពាន់',
        'hero.title.suffix': 'កាបូបនៃស្នាមញញឹម',
        'hero.goal': 'គោលដៅរបស់ពួកយើង',
        'hero.bags': 'កាបូប',
        'hero.lastUpdated': 'កែប្រែចុងក្រោយ​:',

        // About section
        'about.title': 'អំពីមូលនិធិ',
        'about.description': `បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT), Makerspace និងសមាគមនិស្សិតមានសេចក្ដីរំភើបដែលបានចូលរួមរៀបចំ មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម ដែលយើងមានគោលបំណងរួម ក្នុងការបរិច្ចាគដើម្បីផ្តល់ស្នាមញញឹមដល់ កុមារា កុមារីតូចៗ ជាកាបូបផ្ទុកដោយសម្ភារសិក្សា អាហារ សំលៀកបំពាក់ជាដើមដែលកំពុងត្រូវការជំនួយ។ ហើយអ្វីដែលកាន់តែរំភើបជាងនេះគឺ សិស្សច្បង សិស្សប្អូន និងមិត្តភក្តិរួមជំនាន់ទាំងអស់ ក៏អាចក្លាយជាផ្នែកមួយនៃការចូលរួមរៀបចំ មូលនិធិនេះផងដែរ។ ការចូលរួមរបស់និស្សិតទាំងអស់ មិនថាការចូលរួមជាកម្លាំង ការបរិច្ចាគជាថវិការ​ អាហារ ឬជាសម្ភារៈប្រើប្រាស់នានាក្ដី ពិតជាបានបង្ហាញនូវការរួបរួមគ្នា សាមគ្គីគ្នា និងបង្ហាញនូវស្មារតីស្នេហាជាតិដោយយកចិត្តទុកដាក់នៅក្នុងគ្រាដ៏លំបាកនេះ។`,

        // Donation items section
        'donationItems.title': 'សម្ភារៈតម្រូវការបរិច្ចាគ',
        'donationItems.clothes': 'អាវរងារ និងសម្លៀកបំពាក់ផ្សេងៗ',
        'donationItems.snacks': 'ភេសជ្ជៈនំចំណី',
        'donationItems.books': 'សៀវភៅសម្រាប់អាន',
        'donationItems.stationery': 'សម្ភារៈសម្រាប់សរសេរ និងគូរ',
        'donationItems.toys': 'សម្ភារៈក្មេងលេង',

        // Activities section
        'activities': 'សកម្មភាពខ្លះៗរបស់យើង',

        // Location section
        'location.title': 'ទីតាំងទទួលបរិច្ចាគ៖',
        'location.makerspace': 'Innovation Center - CADT',
        'location.publicService': 'មជ្ឈមណ្ឌលផ្ដល់សេវាសាធារណៈ (Public Service Center) របស់ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍',
        'location.directions': 'Get Directions',

        // QR section
        'qr.title.prefix': 'អាចបរិច្ចាគតាមរយៈ',
        'qr.title.suffix': 'ខាងក្រោមនេះ',

        // Message section
        'message.title': 'សរសេរសារជូនកុមារ',
        'message.yourName': 'ឈ្មោះរបស់អ្នក (Your Name)',
        'message.yourNamePlaceholder': 'បញ្ចូលឈ្មោះរបស់អ្នក',
        'message.messageToKids': 'សារទៅកុមារា (Message to Kids)',
        'message.messagePlaceholder': 'សរសេរសារលើកទឹកចិត្តទៅកុមារ...',
        'message.sendButton': 'បញ្ជូនសារ (Send Message)',
        'message.fromDonors': 'សារពីអ្នកបរិច្ចាគ (Messages from Donors)',
        'message.noMessages': 'មិនទាន់មានសារនៅឡើយទេ។ សូមក្លាយជាអ្នកដំបូងក្នុងការផ្ញើសារលើកទឹកចិត្តទៅកុមារៗ!',
        'message.noMessagesEn': '(No messages yet. Be the first to send an encouraging message to the kids!)',

        // Items that need section
        'itemsNeed.title': 'សម្ភារៈតម្រូវការបរិច្ចាគ',
        'itemsNeed.clothes': 'អាវរងារ និង សំលៀកបំពាក់ផ្សេងៗ',
        'itemsNeed.snacks': 'ភេសជ្ជៈនំចំណី',
        'itemsNeed.books': 'សៀវភៅសម្រាប់អាន',
        'itemsNeed.stationery': 'សម្ភារៈសម្រាប់សរសេរ និងគូរ',
        'itemsNeed.toys': 'សម្ភារៈក្មេងលេង',

        // Notifications
        'notification.success': 'សារត្រូវបានបញ្ជូនដោយជោគជ័យ! (Message sent successfully!)',
        'notification.failed': 'បរាជ័យក្នុងការបញ្ជូនសារ (Failed to send message)',
        'notification.error': 'មានបញ្ហាក្នុងការបញ្ជូនសារ (Error sending message)',
        'notification.fillForm': 'សូមបំពេញឈ្មោះ និងសាររបស់អ្នក (Please fill in your name and message)',

        // Footer
        'footer.organizedBy': 'រៀបចំដោយ៖',
    },
    en: {
        // Hero section
        'hero.title.prefix': 'Foundation of',
        'hero.title.number': '5000',
        'hero.title.suffix': 'Bags of Smiles',
        'hero.goal': 'Our Goal',
        'hero.bags': 'Bags',
        'hero.lastUpdated': 'Last updated:',

        // About section
        'about.title': 'About the Foundation',
        'about.description': `The Cambodia Academy of Digital Technology (CADT), Makerspace, and Student Association are excited to organize the 5000 Bags of Smiles Foundation. We aim to bring smiles to children by donating bags filled with school supplies, food, clothing, and other essentials to those in need. What makes this even more exciting is that students and friends can also be part of organizing this foundation. The participation of all students, whether through volunteer work, donations of funds, food, or various supplies, truly demonstrates unity, solidarity, and patriotic spirit by caring during these difficult times.`,

        // Donation items section
        'donationItems.title': 'Needed Donation Items',
        'donationItems.clothes': 'Clothes and various apparel',
        'donationItems.snacks': 'Beverages and snacks',
        'donationItems.books': 'Books for reading',
        'donationItems.stationery': 'Writing and drawing supplies',
        'donationItems.toys': 'Toys and playthings',

        // Activities section
        'activities': 'Our Activities',

        // Location section
        'location.title': 'Donation Locations:',
        'location.makerspace': 'Innovation Center - CADT',
        'location.publicService': 'Public Service Center of the Ministry of Posts and Telecommunications',
        'location.directions': 'Get Directions',

        // QR section
        'qr.title.prefix': 'You can donate via',
        'qr.title.suffix': 'below',

        // Message section
        'message.title': 'Write a Message to the Kids',
        'message.yourName': 'Your Name',
        'message.yourNamePlaceholder': 'Enter your name',
        'message.messageToKids': 'Message to Kids',
        'message.messagePlaceholder': 'Write an encouraging message to the kids...',
        'message.sendButton': 'Send Message',
        'message.fromDonors': 'Messages from Donors',
        'message.noMessages': 'No messages yet. Be the first to send an encouraging message to the kids!',
        'message.noMessagesEn': '',

        // Notifications
        'notification.success': 'Message sent successfully!',
        'notification.failed': 'Failed to send message',
        'notification.error': 'Error sending message',
        'notification.fillForm': 'Please fill in your name and message',

        // Footer
        'footer.organizedBy': 'Organized by:',

        // Items that need section
        'itemsNeed.title': 'Needed Donation Items',
        'itemsNeed.clothes': 'Clothes and various apparel',
        'itemsNeed.snacks': 'Beverages and snacks',
        'itemsNeed.books': 'Books for reading',
        'itemsNeed.stationery': 'Writing and drawing supplies',
        'itemsNeed.toys': 'Toys and playthings',
    },
};

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [language, setLanguageState] = useState<Language>('km');

    // Load language preference from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && (savedLanguage === 'km' || savedLanguage === 'en')) {
            setLanguageState(savedLanguage);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
