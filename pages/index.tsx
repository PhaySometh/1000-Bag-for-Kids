import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import Image from "next/image";
import ActivitySlider from "../components/ActivitySlider";

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
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");

  // compute parts for title: prefix (text before numeral), numeral, and rest (after numeral)
  const titleParts = (() => {
    const defaultTitle = "មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម";
    const t = campaign?.title ?? defaultTitle;
    try {
      const parts = t.match(/\p{N}+|[^\p{N}]+/gu) || [t];
      const index = parts.findIndex((p) => /^\p{N}+$/u.test(p));
      if (index >= 0) {
        const prefix = parts.slice(0, index).join("").trim();
        const numeral = parts[index];
        const rest = parts.slice(index + 1).join("").trim();
        return { prefix, numeral, rest };
      }
      return { prefix: t, numeral: "", rest: "" };
    } catch (err) {
      return { prefix: t, numeral: "", rest: "" };
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
          showNotificationOverlay("សារត្រូវបានបញ្ជូនដោយជោគជ័យ! (Message sent successfully!)", "success");
          setDonorName("");    // Clear the input
          setDonorMessage(""); // Clear the input
          loadMessages();      // Reload the message list
        } else {
          showNotificationOverlay("បរាជ័យក្នុងការបញ្ជូនសារ (Failed to send message)", "error");
        }
      } catch (error) {
        console.error("Error submitting message:", error);
        showNotificationOverlay("មានបញ្ហាក្នុងការបញ្ជូនសារ (Error sending message)", "error");
      }
    } else {
      // Handle empty inputs
      showNotificationOverlay("សូមបំពេញឈ្មោះ និងសាររបស់អ្នក (Please fill in your name and message)", "error");
    }
  };
  return (
    <div className="min-h-screen bg-campaign-gradient text-white">
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
                <span className="inline-block ml-2 mr-2 text-6xl md:text-7xl align-bottom text-white">
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
                កែប្រែចុងក្រោយ​:{" "}
                {campaign?.last_updated
                  ? new Date(campaign.last_updated).toLocaleString()
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto p-4">
        {/* About Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue">
            អំពីមូលនិធិ
          </h2>
          <p
            className="text-base md:text-lg text-darkBlue font-semibold p-4 rounded-l-md"
            style={{
              background:
                "linear-gradient(90deg, rgba(248,141,42,0.95) 0%, rgba(248,141,42,0.12) 100%)",
            }}
          >
            បណ្ឌិត្យសភាបច្ចេកវិទ្យាឌីជីថលកម្ពុជា (CADT), Makerspace
            និងសមាគមនិស្សិតមានសេចក្ដីរំភើបដែលបានចូលរួមរៀបចំ
            មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម ដែលយើងមានគោលបំណងរួម
            ក្នុងការបរិច្ចាគដើម្បីផ្តល់ស្នាមញញឹមដល់ កុមារា កុមារីតូចៗ
            ជាកាបូបផ្ទុកដោយសម្ភារសិក្សា អាហារ
            សំលៀកបំពាក់ជាដើមដែលកំពុងត្រូវការជំនួយ។ ហើយអ្វីដែលកាន់តែរំភើបជាងនេះគឺ
            សិស្សច្បង សិស្សប្អូន និងមិត្តភក្តិរួមជំនាន់ទាំងអស់
            ក៏អាចក្លាយជាផ្នែកមួយនៃការចូលរួមរៀបចំ មូលនិធិនេះផងដែរ។
            ការចូលរួមរបស់និស្សិតទាំងអស់ មិនថាការចូលរួមជាកម្លាំង
            ការបរិច្ចាគជាថវិការ​ អាហារ ឬជាសម្ភារៈប្រើប្រាស់នានាក្ដី
            ពិតជាបានបង្ហាញនូវការរួបរួមគ្នា សាមគ្គីគ្នា
            និងបង្ហាញនូវស្មារតីស្នេហាជាតិដោយយកចិត្តទុកដាក់នៅក្នុងគ្រាដ៏លំបាកនេះ។
          </p>
        </section>

        {/* Needed Items Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue">
            សម្ភារៈតម្រូវការបរិច្ចាគ
          </h2>
          <ul className="space-y-3">
            {(
              campaign?.donation_items ?? [
                "អាវរងារ និងសម្លៀកបំពាក់ផ្សេងៗ",
                "ភេសជ្ជៈនំចំណី",
                "សៀវភៅសម្រាប់អាន",
                "សម្ភារៈសម្រាប់សរសេរ និងគូរ",
                "សម្ភារៈក្មេងលេង",
              ]
            ).map((it, idx) => {
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
            ទីតាំងទទួលបរិច្ចាគ៖
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
                  <span className="ml-1"> Innovation Center - CADT</span>
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
                  <span className="font-bold">មជ្ឈមណ្ឌលផ្ដល់សេវាសាធារណៈ</span>
                  <span className="ml-1">
                    {" "}
                    (Public Service Center) របស់ក្រសួងប្រៃសណីយ៍ និងទូរគមនាគមន៍
                  </span>
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
                Get Directions
              </a>
            </div>
          </div>
        </section>

        {/* Donate Section (QR Codes) */}
        <section className="mt-6 p-4 text-center animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-darkBlue flex items-center justify-center gap-2 donate-header">
            <span className="align-bottom">អាចបរិច្ចាគតាមរយៈ</span>
            <div className="w-10 md:w-14 lg:w-16 shrink-0">
              <Image
                src="/images/khqr.png"
                width={64}
                height={64}
                alt="khqr"
                className="w-full h-auto"
              />
            </div>
            <span className="align-bottom donate-last">ខាងក្រោមនេះ</span>
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

        {/* Message to Kids Section */}
        <section className="mt-6 p-4 animate-fadeUp">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-darkBlue text-center">
            សរសេរសារជូនកុមារ
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
                  ឈ្មោះរបស់អ្នក (Your Name)
                </label>
                <input
                  type="text"
                  id="donorName"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white text-darkBlue focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="បញ្ចូលឈ្មោះរបស់អ្នក"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="donorMessage"
                  className="block text-white font-semibold mb-2"
                >
                  សារទៅកុមារា (Message to Kids)
                </label>
                <textarea
                  id="donorMessage"
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-white text-darkBlue focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="សរសេរសារលើកទឹកចិត្តទៅកុមារ..."
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-md transition-colors"
              >
                បញ្ជូនសារ (Send Message)
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-darkBlue text-center">
                សារពីអ្នកបរិច្ចាគ (Messages from Donors)
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
                    មិនទាន់មានសារនៅឡើយទេ។
                    សូមក្លាយជាអ្នកដំបូងក្នុងការផ្ញើសារលើកទឹកចិត្តទៅកុមារៗ!
                  </p>
                  <p className="text-white/70 text-sm mt-2">
                    (No messages yet. Be the first to send an encouraging
                    message to the kids!)
                  </p>
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
                រៀបចំដោយ៖
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