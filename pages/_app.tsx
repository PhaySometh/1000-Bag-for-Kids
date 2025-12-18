import "../styles/globals.css";
import type { AppProps } from "next/app";
import { LanguageProvider } from "../contexts/LanguageContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <div className="font-sans">
        <Component {...pageProps} />
      </div>
    </LanguageProvider>
  );
}
