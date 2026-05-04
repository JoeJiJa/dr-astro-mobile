import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Zap, Moon, Trophy } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const nav = window.navigator as Navigator & { standalone?: boolean };
        return window.matchMedia('(display-mode: standalone)').matches ||
            nav.standalone ||
            (typeof document !== 'undefined' && document.referrer.includes('android-app://'));
    });

    useEffect(() => {
        const isDismissed = localStorage.getItem('dr_astro_install_dismissed');
        if (isStandalone || isDismissed) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setTimeout(() => setIsIOS(ios), 0);

        // Listen for the install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        const handleAppInstalled = () => {
            setIsVisible(false);
            localStorage.setItem('dr_astro_install_dismissed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // iOS Visibility Logic (show after 3 seconds for better UX)
        let timer: NodeJS.Timeout;
        if (ios) {
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            if (timer) clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            (deferredPrompt as unknown as { prompt: () => void }).prompt();
            const { outcome } = await (deferredPrompt as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setIsVisible(false);
                localStorage.setItem('dr_astro_install_dismissed', 'true');
            }
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('dr_astro_install_dismissed', 'true');
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 p-4">
            <div className="max-w-xl w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden text-center group">

                {/* Visual Flair */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-full transition-all z-10"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center gap-8 relative z-10">
                    <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20 transform rotate-6 hover:rotate-0 transition-transform duration-500 overflow-hidden relative border border-white/10">
                        <Image src="/app-logo.jpg" alt="Logo" fill className="object-cover" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
                            Experience <span className="text-red-600">Dr. Astro</span>
                        </h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                            Install the application to get the full medical intelligence experience on your device.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full py-4">
                        {[
                            { icon: <Zap size={18} />, label: "Faster Load" },
                            { icon: <Moon size={18} />, label: "Offline Mode" },
                            { icon: <Trophy size={18} />, label: "Full Screen" }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                                <div className="text-red-500">{item.icon}</div>
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="w-full space-y-4">
                        {isIOS ? (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-6 text-sm text-red-800 dark:text-red-300 space-y-4">
                                <p className="font-bold text-base">Installation for iPhone/iPad:</p>
                                <div className="flex flex-col gap-3 text-left">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                                        <p>Tap the <strong>Share</strong> button (box with upward arrow) in the browser toolbar.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                                        <p>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstallClick}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xl py-5 rounded-[1.5rem] transition-all shadow-xl shadow-red-600/30 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Download size={24} /> Install Dr. Astro App
                            </button>
                        )}
                        <button
                            onClick={handleDismiss}
                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-medium transition-colors"
                        >
                            Later, I&apos;ll stick to the browser
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
