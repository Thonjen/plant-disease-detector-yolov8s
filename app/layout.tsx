import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant Disease Detector | AI-Powered Plant Health Analysis",
  description: "Revolutionary AI-powered plant disease detection using Popular technology YOLOv8s models. Detect diseases in crops and rice with exceptional accuracy - all processed directly in your browser. Privacy-first, real-time analysis with instant results.",
  keywords: "plant disease detection, AI agriculture, YOLOv8s, crop health, rice disease, plant pathology, agricultural technology, computer vision, machine learning",
  authors: [{ name: "Plant Disease Detector Team" }],
  creator: "Plant Disease Detector",
  publisher: "Plant Disease Detector",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Plant Disease Detector | AI-Powered Plant Health Analysis",
    description: "Revolutionary AI-powered plant disease detection using Popular technology YOLOv8s models. Privacy-first, real-time analysis with instant results.",
    type: "website",
    locale: "en_US",
    siteName: "Plant Disease Detector",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plant Disease Detector | AI-Powered Plant Health Analysis",
    description: "Revolutionary AI-powered plant disease detection using Popular technology YOLOv8s models.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#059669' },
    { media: '(prefers-color-scheme: dark)', color: '#047857' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Plant Disease Detector" />
        <meta name="application-name" content="Plant Disease Detector" />
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="mask-icon" href="/favicon.svg" color="#059669" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50`}
      >
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl"
            style={{
              animation: 'pulse-slow 4s ease-in-out infinite'
            }}
          ></div>
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"
            style={{
              animation: 'pulse-slow 4s ease-in-out infinite 2s'
            }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 rounded-full blur-3xl"
            style={{
              transform: 'translate(-50%, -50%)',
              animation: 'float 6s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
