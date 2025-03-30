"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Navigation from "./components/Navigation";

// Font configuration
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata can't be used with "use client", so we'll set title in the document head
// instead of using the metadata export

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <title>ファイル マネージャー</title>
        <meta name="description" content="デスクトップファイル管理アプリケーション" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}>
        <div className="h-screen max-h-screen flex flex-col overflow-hidden">
          <Navigation />
          <main className="flex-grow overflow-auto">
            <div className="container mx-auto px-2 py-4 max-w-[780px]">
              {children}
            </div>
          </main>
          <footer className="py-2 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
            <p>© {new Date().getFullYear()} File Manager App</p>
          </footer>
        </div>
      </body>
    </html>
  );
}