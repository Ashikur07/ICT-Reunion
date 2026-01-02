'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // ১. চেক করা অ্যাপটি অলরেডি ইন্সটল করা আছে কি না
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // ২. iOS ডিভাইস ডিটেক্ট করা
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // ৩. Android/Chrome এর জন্য install prompt ইভেন্ট ধরে রাখা
    const handler = (e) => {
      e.preventDefault(); // অটোমেটিক ব্যানার বন্ধ করা
      setDeferredPrompt(e); // ইভেন্টটা সেইভ করে রাখা
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // ইন্সটল প্রম্পট শো করা
    deferredPrompt.prompt();

    // ইউজার কি চয়েস দিল তা চেক করা
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);

    // প্রম্পট ক্লিয়ার করা (একবারই ব্যবহার করা যায়)
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-blue-600 font-bold flex items-center gap-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </Link>

      {/* Logo Area */}
      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 mb-6 animate-bounce">
         <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Install App</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
        Install <span className="font-bold text-blue-600">ICT Reunion</span> for better experience and offline access.
      </p>

      {/* Condition 1: App Already Installed */}
      {isStandalone ? (
         <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-200 shadow-sm">
            ✅ App is already installed!
         </div>
      ) : (
        <>
          {/* Condition 2: Android/Desktop (Show Install Button) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full max-w-xs py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Click to Install
            </button>
          )}

          {/* Condition 3: iOS (Show Manual Instructions) */}
          {isIOS && (
            <div className="bg-white p-5 rounded-2xl text-left text-sm text-gray-600 border border-gray-200 shadow-sm max-w-xs mx-auto">
              <p className="font-bold text-gray-800 mb-3 text-center border-b pb-2">iOS Installation:</p>
              <ol className="space-y-3">
                <li className="flex items-center gap-2">
                  1. Tap the <span className="text-blue-600 text-xl">share</span> button.
                </li>
                <li className="flex items-center gap-2">
                  2. Scroll down & tap <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">Add to Home Screen</span>.
                </li>
                <li className="flex items-center gap-2">
                  3. Tap <span className="font-bold text-blue-600">Add</span> at top right.
                </li>
              </ol>
            </div>
          )}

          {/* Condition 4: No Prompt available (Maybe plain desktop chrome without PWA trigger) */}
          {!deferredPrompt && !isIOS && (
             <div className="text-xs text-gray-400 mt-4 bg-gray-100 p-3 rounded-lg">
                If the install button doesn't appear, please check your browser settings or use the browser menu (⋮) &rarr; "Install App".
             </div>
          )}
        </>
      )}

    </div>
  );
}