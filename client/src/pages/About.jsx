import React from 'react';
import { Code, Zap, Smartphone, Moon, Sparkles, Target, Rocket, Shield, Heart, GraduationCap, Github } from 'lucide-react';

const About = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-20 pb-20 animate-fadeIn">
            {/* ── Hero Section ────────────────────────────── */}
            <section className="relative py-20 text-center overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-500/10" />
                <div className="space-y-4 relative z-10">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.5em] animate-pulse-slow">
                        Pioneering Healthcare Safety
                    </p>
                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                        The <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-cyan-400">Mission</span>
                    </h1>
                </div>
                <div className="max-w-2xl mx-auto mt-8 px-4">
                    <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-blue-500 mx-auto rounded-full mb-8" />
                    <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                        "Engineering a world where medication errors are history through artificial intelligence and proactive safety ecosystems."
                    </p>
                </div>
            </section>

            {/* ── Developer Spotlight ──────────────────────── */}
            <section className="relative px-4">
                <div className="glass-card rounded-[3rem] p-1 md:p-12 border-indigo-500/10 overflow-hidden relative group">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-700" />

                    <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-5 space-y-8">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/50 mb-6">
                                    <GraduationCap size={48} strokeWidth={1.5} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-900 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                                    <Code size={20} className="text-indigo-600" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">The Developer</h2>
                                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Mohammed Meraj Uddin</p>
                                <p className="text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                                    <Target size={14} /> First-Year Engineering Student
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href="https://merajuddin.lovable.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary !py-2 !px-4 text-xs inline-block"
                                >
                                    VIEW PORTFOLIO
                                </a>
                                <a
                                    href="https://github.com/jawaduddin470-coder-github"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-2 inline-block"
                                >
                                    <Github size={14} /> GITHUB
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-6 text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            <p className="first-letter:text-5xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-3 first-letter:float-left">
                                Dedication to engineering digital solutions that solve critical human problems is at the core of my work.
                                Medsafe AI is my flagship project, born from a desire to merge healthcare safety with cutting-edge software engineering.
                            </p>
                            <p className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5 backdrop-blur-sm shadow-sm italic">
                                "This platform represents a journey of intense learning—from mastering the fundamentals to implementing production-grade architectures like Firebase Cloud Messaging and AI-driven analysis."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Core Philosophy ──────────────────────────── */}
            <section className="px-4 grid md:grid-cols-2 gap-8">
                <div className="glass-card p-10 rounded-[2.5rem] border-blue-500/10 relative group hover:-translate-y-2 transition-all duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Sparkles size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase italic tracking-tight">The Platform</h3>
                    <p className="text-gray-700 dark:text-gray-400 font-medium leading-relaxed mb-6">
                        <span className="text-indigo-600 dark:text-white font-black tracking-widest uppercase text-xs">Medsafe AI</span> is more than just a reminder app.
                        It's a comprehensive safety ecosystem designed to audit medication regimens for lethal interactions and dosage conflicts.
                    </p>
                    <p className="text-gray-600 dark:text-gray-500 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                        <Shield size={16} className="text-indigo-500" /> Engineering Safety
                    </p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border-indigo-500/10 relative group hover:-translate-y-2 transition-all duration-500">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Heart size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase italic tracking-tight">Current Impact</h3>
                    <p className="text-gray-700 dark:text-gray-400 font-medium leading-relaxed mb-6">
                        By leveraging generative AI and systematic cross-referencing, we aim to eliminate preventable medication errors—a major cause of global health incidents.
                        We empower users with knowledge for high-level medical discussions.
                    </p>
                    <p className="text-gray-600 dark:text-gray-500 text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
                        <Zap size={16} className="text-indigo-500" /> Actionable Intelligence
                    </p>
                </div>
            </section>

            {/* ── Key Objectives ────────────────────────────── */}
            <section className="px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Core Objectives</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Strategic roadmap for safety</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ObjectiveBox
                        icon={<Target size={24} />}
                        title="Global Awareness"
                        text="Creating an accessible platform that raises awareness about medication safety."
                    />
                    <ObjectiveBox
                        icon={<Shield size={24} />}
                        title="Interaction Audit"
                        text="Providing educational information about lethal drug-to-drug interactions."
                    />
                    <ObjectiveBox
                        icon={<Zap size={24} />}
                        title="AI Integration"
                        text="Leveraging LLMs for common medication safety questions and dosage analysis."
                    />
                    <ObjectiveBox
                        icon={<Smartphone size={24} />}
                        title="Accessibility"
                        text="Modern, responsive interface that works flawlessly across all mobile devices."
                    />
                    <ObjectiveBox
                        icon={<Rocket size={24} />}
                        title="Production Ready"
                        text="Built with industry-standard practices, ensuring performance and scalability."
                    />
                    <ObjectiveBox
                        icon={<GraduationCap size={24} />}
                        title="User Empowerment"
                        text="Empowering individuals with the data required for informed medical decisions."
                    />
                </div>
            </section>

            {/* ── Roadmap Timeline ──────────────────────────── */}
            <section className="px-4 relative">
                <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-12 border-indigo-500/10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 flex items-center gap-4 uppercase italic tracking-tight">
                        <Rocket className="text-indigo-500" size={32} /> Future Enhancements
                    </h2>
                    <div className="space-y-8 relative">
                        {/* Timeline Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-indigo-500/20" />

                        <TimelineItem label="Advanced AI Analysis" text="Deep machine learning for personalized risk prediction." />
                        <TimelineItem label="Database Integration" text="Real-time synchronization with global pharmacy databases." />
                        <TimelineItem label="Mobile Natives" text="Dedicated iOS and Android applications with native performance." />
                        <TimelineItem label="Global Scale" text="Multi-language support and international drug labeling." />
                        <TimelineItem label="Vitals Sync" text="Integration with wearable devices for real-time health monitoring." />
                    </div>
                </div>
            </section>

            {/* ── Closing Note ─────────────────────────────── */}
            <section className="text-center py-20 px-4 space-y-6">
                <p className="text-2xl text-gray-600 dark:text-gray-400 font-medium italic max-w-2xl mx-auto">
                    "This project is a continuous learning journey. I'm dedicated to evolving its intelligence every single day."
                </p>
                <div className="space-y-1">
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase italic tracking-tight">Mohammed Meraj Uddin</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em]">Engineering Student & Developer</p>
                </div>
            </section>
        </div>
    );
};

const ObjectiveBox = ({ icon, title, text }) => (
    <div className="p-8 rounded-[2.5rem] bg-indigo-50/30 dark:bg-white/5 border border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 group hover:-translate-y-1">
        <div className="text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform origin-left">{icon}</div>
        <h3 className="font-black text-gray-900 dark:text-white text-lg mb-3 uppercase italic tracking-tight">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed">{text}</p>
    </div>
);

const TimelineItem = ({ label, text }) => (
    <div className="relative pl-10 group">
        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-100 dark:border-indigo-500/30 group-hover:border-indigo-500 transition-colors z-10" />
        <div>
            <h4 className="font-black text-gray-900 dark:text-white uppercase italic tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{label}</h4>
            <p className="text-gray-600 dark:text-gray-500 font-medium text-sm">{text}</p>
        </div>
    </div>
);

export default About;
