import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

type Campaign = {
    title: string;
    subtitle: string;
    current_bags: number;
    goal: number;
    donation_items: string[];
    location_url?: string;
    embed_url?: string;
    qr_url?: string;
    school_name?: string;
    last_updated?: string;
};

export default function Overlay() {
    const { t, language } = useLanguage();
    const [campaign, setCampaign] = useState<Campaign | null>(null);

    // compute parts for title: prefix (text before numeral), numeral, and rest (after numeral)
    const titleParts = (() => {
        const title = `${t('hero.title.prefix')} ${t('hero.title.number')} ${t('hero.title.suffix')}`;
        try {
            const parts = title.match(/\p{N}+|[^\p{N}]+/gu) || [title];
            const index = parts.findIndex((p) => /^\p{N}+$/u.test(p));
            if (index >= 0) {
                const prefix = parts.slice(0, index).join("").trim();
                const numeral = parts[index];
                const rest = parts.slice(index + 1).join("").trim();
                return { prefix, numeral, rest };
            }
            return { prefix: title, numeral: "", rest: "" };
        } catch (err) {
            return { prefix: title, numeral: "", rest: "" };
        }
    })();

    async function load() {
        try {
            const res = await fetch("/api/campaign/get");
            const data = await res.json();
            setCampaign(data);
        } catch (error) {
            console.error("Error loading campaign:", error);
        }
    }

    // Initial Data Load
    useEffect(() => {
        load();
        // Auto-refresh every 30 seconds for OBS
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
                <div className="text-white">
                    {/* <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-center">
                        {titleParts.prefix ? (
                            <span className="text-altGreen align-bottom">
                                {titleParts.prefix}
                            </span>
                        ) : null}
                        {titleParts.numeral ? (
                            <span className={`inline-block ml-2 mr-2 align-bottom text-white ${language === 'km' ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl'}`}>
                                {titleParts.numeral}
                            </span>
                        ) : null}
                        {titleParts.rest ? (
                            <span className="text-white align-bottom">
                                {titleParts.rest}
                            </span>
                        ) : null}
                    </h1> */}

                    {/* <div className="flex justify-center mb-6">
                        <div className="w-[400px] md:w-[600px] lg:w-[768px]">
                            <Image
                                src="/images/bag.png"
                                width={768}
                                height={384}
                                alt="bag"
                                className="w-full h-auto"
                            />
                        </div>
                    </div> */}

                    <div className="w-full bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/30">
                        <ProgressBar
                            current={campaign?.current_bags ?? 0}
                            goal={campaign?.goal ?? 5000}
                            milestone={1000}
                        />
                        <div className="text-sm text-white/90 mt-3 text-center">
                            {t('hero.lastUpdated')}{" "}
                            {campaign?.last_updated
                                ? new Date(campaign.last_updated).toLocaleString()
                                : "—"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
