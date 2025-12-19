import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import ProgressBar from "../components/ProgressBar";
import Image from "next/image";
import ActivitySlider from "../components/ActivitySlider";
import LanguageSwitcher from "../components/LanguageSwitcher";
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

type Message = {
  name: string;
  message: string;
  created_at: string;
};

export default function Home() {
  const { t, language } = useLanguage();
  const donateRef = useRef<HTMLElement>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

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

  async function loadMessages() {
    try {
      const res = await fetch("/api/messages/list");
      const data = await res.json();
      console.log("Messages API response:", data); // Debug log
      if (data.success && data.data) {
        setMessages(data.data);
        console.log("Loaded messages:", data.data.length); // Debug log
      } else {
        console.log("No messages or API error:", data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  // Initial Data Load
  useEffect(() => {
    load();
    loadMessages();
  }, []);

  // Scroll to donate section
  const scrollToDonate = () => {
    donateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Show notification overlay
  const showNotificationOverlay = (message: string, type: "success" | "error") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };
  // Handle Form Submission via API
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (donorName.trim() && donorMessage.trim()) {
      try {
        const res = await fetch("/api/messages/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: donorName.trim(),
            message: donorMessage.trim(),
          }),
        });

        // Check if the request was successful
        if (res.ok) {
          showNotificationOverlay(t('notification.success'), "success");
          setDonorName("");    // Clear the input
          setDonorMessage(""); // Clear the input
          loadMessages();      // Reload the message list
        } else {
          showNotificationOverlay(t('notification.failed'), "error");
        }
      } catch (error) {
        console.error("Error submitting message:", error);
        showNotificationOverlay(t('notification.error'), "error");
      }
    } else {
      // Handle empty inputs
      showNotificationOverlay(t('notification.fillForm'), "error");
    }
  };
  return (
    <div className="min-h-screen bg-campaign-gradient text-white">
      <Head>
        <title>{`${t('hero.title.prefix')} ${t('hero.title.number')} ${t('hero.title.suffix')} - 5000 Bags for Kids Cambodia`}</title>
        <meta name="description" content="បរិច្ចាគដើម្បីស្នាមញញឹមកុមារ 🎒 មូលនិធិ ៥ ពាន់កាបូបនៃស្នាមញញឹម - សមាគមនិស្សិត បណ្ឌិត្យសភា CADT នៃ​ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍​ រៀប​ចំយុទ្ធនាការ​ជួយកុមារភៀសសឹក​ ដើម្បីទទួលការបរិច្ចាគ សៀវភៅអាន សម្លៀកបំពាក់កុមារ និងថវិកា។ Donate for children's smiles - Help us provide school bags, books, clothes and supplies to children in Cambodia." />
        <meta name="keywords" content="Cambodia,កាបូបនៃស្នាមញញឹម,charity, donation, school bags, education, children, kids, 5000 bags, កម្ពុជា, បរិច្ចាគ, កាបូបសិស្ស, CADT, CSA, ស្នាមញញឹម, កុមារ, សមាគមនិស្សិត" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.bagsofsmile.asia/" />
        <meta property="og:title" content={`${t('hero.title.prefix')} ${t('hero.title.number')} ${t('hero.title.suffix')}`} />
        <meta property="og:description" content="បរិច្ចាគដើម្បីស្នាមញញឹមកុមារ 🎒 មូលនិធិ ៥ ពាន់កាបូបនៃស្នាមញញឹម - សមាគមនិស្សិត បណ្ឌិត្យសភា CADT រៀប​ចំយុទ្ធនាការ​ជួយកុមារ ដោយទទួលបរិច្ចាគសៀវភៅអាន សម្លៀកបំពាក់កុមារ និងថវិកា។" />
        <meta property="og:image" content="https://www.bagsofsmile.asia/images/metaimage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="1000 Bags for Kids Cambodia Campaign" />
        <meta property="article:publisher" content="https://www.facebook.com/CADT.sa" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.bagsofsmile.asia/" />
        <meta property="twitter:title" content={`${t('hero.title.prefix')} ${t('hero.title.number')} ${t('hero.title.suffix')}`} />
        <meta property="twitter:description" content="បរិច្ចាគដើម្បីស្នាមញញឹមកុមារ 🎒 មូលនិធិ ៥ ពាន់កាបូបនៃស្នាមញញឹម - Donate for children's smiles - Help provide school bags, books, and clothes to children in Cambodia." />
        <meta property="twitter:image" content="https://www.bagsofsmile.asia/images/metaimage.png" />
        <meta property="twitter:image:alt" content="1000 Bags for Kids Cambodia Campaign" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://www.bagsofsmile.asia/" />
      </Head>
      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-8">
        <button
          onClick={scrollToDonate}
          className="hidden md:block bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-lg"
        >
          {language === 'km' ? 'បរិច្ចាគទៅកុមារ' : 'Donate'}
        </button>
        <LanguageSwitcher />
      </div>

      {/* Notification Overlay */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-2xl transform transition-all ${notificationType === "success"
              ? "bg-green-500"
              : "bg-red-500"
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {notificationType === "success" ? "✅" : "❌"}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative w-full h-[520px] sm:h-[640px] md:h-[720px] overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
        <div className="absolute inset-0 flex items-start sm:items-end px-6 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
          <div className="max-w-3xl mx-auto w-full text-white pt-6 sm:pt-0 hero-inner">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {titleParts.prefix ? (
                <span className="text-altGreen align-bottom">
                  {titleParts.prefix}
                </span>
              ) : null}
              {titleParts.numeral ? (
                <span className={`inline-block ml-2 mr-2 align-bottom text-white ${language === 'km' ? 'text-6xl md:text-7xl' : 'text-3xl md:text-5xl'}`}>
                  {titleParts.numeral}
                </span>
              ) : null}
              {titleParts.rest ? (
                <span className="text-white align-bottom">
                  {titleParts.rest}
                </span>
              ) : null}
            </h1>
            <div className="mt-2 flex items-end gap-3">
              <div className="w-[216px] sm:w-[336px] md:w-[432px] lg:w-[576px] xl:w-[768px] shrink-0">
                <Image
                  src="/images/bag.png"
                  width={768}
                  height={384}
                  alt="bag"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-xl p-3 progress-space">
              <ProgressBar
                current={campaign?.current_bags ?? 0}
                goal={campaign?.goal ?? 5000}
                milestone={1000}
              />
              <div className="text-xs text-white/80 mt-2">
                {t('hero.lastUpdated')}{" "}
                {campaign?.last_updated
                  ? new Date(campaign.last_updated).toLocaleString()
                  : "—"}
              </div>
            </div>
            {/* Mobile Donate Button - Below progress bar */}
            <div className="flex md:hidden items-center justify-center mt-4">
              <button
                onClick={scrollToDonate}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-md transition-colors shadow-lg"
              >
                {language === 'km' ? 'បរិច្ចាគទៅកុមារ' : 'Donate'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto p-4">
        {/* About Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue">
            {t('about.title')}
          </h2>
          <p
            className="text-base md:text-lg text-darkBlue font-semibold p-4 rounded-l-md"
            style={{
              background:
                "linear-gradient(90deg, rgba(248,141,42,0.95) 0%, rgba(248,141,42,0.12) 100%)",
            }}
          >
            {t('about.description')}
          </p>
        </section>

        {/* Needed Items Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue">
            {t('itemsNeed.title')}
          </h2>
          <ul className="space-y-3">
            {[
              t('itemsNeed.clothes'),
              t('itemsNeed.snacks'),
              t('itemsNeed.books'),
              t('itemsNeed.stationery'),
              t('itemsNeed.toys'),
            ].map((it, idx) => {
              const icons = ["👕", "🍪", "📚", "✏️", "🧸"];
              const icon = icons[idx % icons.length];
              return (
                <li
                  key={idx}
                  className="rounded-l-md p-3 text-white flex items-center gap-3 text-lg font-bold"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(248,141,42,0.95) 0%, rgba(248,141,42,0.12) 100%)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl text-darkBlue">
                    {icon}
                  </div>
                  <div className="flex-1 font-bold">{it}</div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Location Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue">
            {t('location.title')}
          </h2>
          <div className="mb-2">
            <div className="inline-flex items-center gap-3">
              <div className="w-7 sm:w-8">
                <Image
                  src="/images/location.png"
                  width={32}
                  height={32}
                  alt="location"
                  className="w-full h-auto"
                />
              </div>
              <div className="text-left">
                <div className="text-darkBlue">
                  <span className="font-bold">Makerspace,</span>
                  <span className="ml-1"> {t('location.makerspace')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl">
            <div className="w-full h-56 sm:h-72 md:h-96 rounded overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9252.395867734647!2d104.90335279186975!3d11.655537444160784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310953bad45e4ee1%3A0x6c33cb023d508017!2sCADT%20-%20Innovation%20Center!5e0!3m2!1sen!2skh!4v1765611277548!5m2!1sen!2skh"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CADT - Innovation Center"
              />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={"https://www.google.com/maps/dir//CADT+-+Innovation+Center,+2nd+Bridge+Prek+Leap,+National+Road+Number+6,+Phnom+Penh,+12252/@11.6541735,104.9089508,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x310953bad45e4ee1:0x6c33cb023d508017!2m2!1d104.9114229!2d11.654289?hl=en&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md shadow-sm"
              >
                Get Directions
              </a>
            </div>
          </div>
          {/* New second location - Public Service Center */}
          <div className="mb-2 mt-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-7 sm:w-8">
                <Image
                  src="/images/location.png"
                  width={32}
                  height={32}
                  alt="location"
                  className="w-full h-auto"
                />
              </div>
              <div className="text-left">
                <div className="text-darkBlue">
                  <span className="font-bold">{t('location.publicService')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl">
            <div className="w-full h-56 sm:h-72 md:h-96 rounded overflow-hidden border border-gray-200 shadow-sm">
              <iframe
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1103.1314627474608!2d104.9175312!3d11.5752534!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31095142eadcf8db%3A0xbd4e32a5eccddfb7!2sMinistry%20of%20Post%20and%20Telecommunications!5e1!3m2!1sen!2skh!4v1765644331160!5m2!1sen!2skh"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ministry of Post and Telecommunications"
              />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <a
                href={"https://www.google.com/maps/dir//Ministry+of+Post+and+Telecommunications,+Builing+13+Preah+Monivong+Blvd+(93),+Phnom+Penh/@11.5752534,104.9175312,253m/data=!3m1!1e3!4m16!1m7!3m6!1s0x31095142eadcf8db:0xbd4e32a5eccddfb7!2sMinistry+of+Post+and+Telecommunications!8m2!3d11.5752627!4d104.9173786!16s%2Fg%2F1yfdrw680!4m7!1m0!1m5!1m1!1s0x31095142eadcf8db:0xbd4e32a5eccddfb7!2m2!1d104.9173786!2d11.5752627?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3M0gBUAM%3D"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md shadow-sm"
              >
                {t('location.directions')}
              </a>
            </div>
          </div>
        </section>

        {/* Donate Section (QR Codes) */}
        <section ref={donateRef} className="mt-6 p-4 text-center animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue flex items-center justify-center gap-2 donate-header">
            <span className="align-bottom">{t('qr.title.prefix')}</span>
            <div className="w-10 md:w-14 lg:w-16 shrink-0">
              <Image
                src="/images/khqr.png"
                width={64}
                height={64}
                alt="khqr"
                className="w-full h-auto"
              />
            </div>
            <span className="align-bottom donate-last">{t('qr.title.suffix')}</span>
          </h2>

          <div className="mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 py-4">
            {/* USD QR */}
            <div className="flex flex-col items-center w-full">
              <div className="w-44 sm:w-72">
                <Image
                  src="/images/qr_usd.png"
                  width={300}
                  height={300}
                  alt="qr-usd"
                  className="w-full h-auto"
                />
              </div>
            </div>
            {/* KHR QR */}
            <div className="flex flex-col items-center w-full">
              <div className="w-44 sm:w-72">
                <Image
                  src="/images/qr_khr.png"
                  width={300}
                  height={300}
                  alt="qr-khr"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* International Donation Section */}
        <section className="international_donation mt-6 p-4 animate-fadeUp">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-darkBlue">
              {t('international.title')}
            </h2>
            <p className="text-base md:text-lg text-darkBlue font-semibold mb-6 p-4 rounded-lg"
              style={{
                background: "linear-gradient(90deg, rgba(248,141,42,0.95) 0%, rgba(248,141,42,0.12) 100%)",
              }}
            >
              {t('international.description')}
            </p>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-md shadow-lg transition-colors"
            >
              <span>🌍</span>
              <span>{t('international.button')}</span>
            </a>
          </div>
        </section>

        {/* Message to Kids Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white text-center">
            {t('message.title')}
          </h2>
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSubmitMessage}
              className="bg-white/10 rounded-lg p-6 backdrop-blur-sm"
            >
              <div className="mb-4">
                <label
                  htmlFor="donorName"
                  className="block text-white font-semibold mb-2"
                >
                  {t('message.yourName')}
                </label>
                <input
                  type="text"
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white text-darkBlue focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={t('message.yourNamePlaceholder')}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="donorMessage"
                  className="block text-white font-semibold mb-2"
                >
                  {t('message.messageToKids')}
                </label>
                <textarea
                  id="donorMessage"
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white text-darkBlue focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder={t('message.messagePlaceholder')}
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-md transition-colors"
              >
                {t('message.sendButton')}
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-3xl font-bold mb-4 text-white text-center">
                {t('message.fromDonors')}
              </h3>
              {messages.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border-l-4 border-primary"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white">
                          💝 {msg.name}
                        </span>
                        <span className="text-xs text-white/70">
                          {new Date(msg.created_at).toLocaleDateString(
                            "km-KH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-white/90 italic">"{msg.message}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                  <p className="text-white/70">
                    {t('message.noMessages')}
                  </p>
                  {t('message.noMessagesEn') && (
                    <p className="text-white/70 text-sm mt-2">
                      {t('message.noMessagesEn')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Activity Slider */}
        <ActivitySlider />

        {/* Footer Logos */}
        <section className="mt-6 p-4 animate-fadeUp">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-full sm:w-3/4 flex items-end sm:justify-start">
              <div className="w-full max-w-[380px]">
                <Image
                  src="/images/cadt.png"
                  width={380}
                  height={80}
                  alt="cadt"
                />
              </div>
            </div>
            <div className="w-full sm:w-1/4 flex flex-col items-start justify-center">
              <div className="text-sm text-white/90 mb-2 text-left">
                {t('footer.organizedBy')}
              </div>
              <div className="w-full max-w-[140px]">
                <Image
                  src="/images/csa.png"
                  width={140}
                  height={56}
                  alt="csa"
                />
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-white/60 mt-6 pb-10" />
      </main>
    </div>
  );
}