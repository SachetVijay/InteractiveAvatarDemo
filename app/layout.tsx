import "@/styles/globals.css";
import { Metadata } from "next";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "TLC Onboarding by Interactive Avatar",
    template: `%s - Interactive Avatar SDK Demo`,
  },
  icons: {
    icon: "/emblem.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head>
        {/* 📈 Add DataFast tracking script */}
        <script
          defer
          data-domain="onboardingtlc.vercel.app"
          data-website-id="6835a1cdec4acbfb145b71f9"
          src="https://datafa.st/js/script.js"
        />
      </head>
      <body className="min-h-screen bg-black text-white">
        <main className="relative flex flex-col h-screen w-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
