import React from 'react';
import { Code, Zap, Smartphone, Moon, Sparkles, Target, Rocket } from 'lucide-react';

const About = () => {
    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            {/* Hero Section */}
            <section className="text-center space-y-4 py-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                    About This Project
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    A medication safety platform built by a first-year engineering student
                </p>
            </section>

            {/* Personal Introduction */}
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    <Code className="mr-3 text-primary dark:text-blue-400" size={28} />
                    About the Developer
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                        Hi! I'm <strong className="text-gray-900 dark:text-gray-100">Mohammed Meraj Uddin</strong>,
                        a first-year engineering student passionate about building technology that makes a difference.
                        This is my first real-world project, and I'm excited to share it with you!
                    </p>
                    <p className="leading-relaxed">
                        As a beginner in web development, I wanted to create something meaningful while learning
                        modern technologies. This project represents my journey from learning the basics to building
                        a fully functional, production-ready application.
                    </p>
                </div>
            </section>

            {/* Project Description */}
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    <Sparkles className="mr-3 text-teal-500" size={28} />
                    About MedSafe AI
                </h2>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                        <strong className="text-gray-900 dark:text-gray-100">MedSafe AI</strong> is a medication
                        safety awareness platform designed to help users understand potential risks in their medication
                        regimens. The platform provides educational insights about drug interactions, dosage conflicts,
                        and timing risks.
                    </p>
                    <p className="leading-relaxed">
                        This project addresses a real-world problem: medication errors are a leading cause of preventable
                        harm. While this platform is for educational purposes only and not a substitute for professional
                        medical advice, it aims to raise awareness and encourage users to have informed conversations
                        with their healthcare providers.
                    </p>
                </div>
            </section>

            {/* Key Features */}
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    <Zap className="mr-3 text-amber-500" size={28} />
                    Key Features
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <FeatureCard
                        icon={<Smartphone size={20} />}
                        title="Fully Responsive"
                        description="Works seamlessly on mobile, tablet, and desktop devices"
                    />
                    <FeatureCard
                        icon={<Moon size={20} />}
                        title="Dark/Light Theme"
                        description="Smooth theme switching with system preference detection"
                    />
                    <FeatureCard
                        icon={<Sparkles size={20} />}
                        title="Modern Animations"
                        description="Smooth page transitions and micro-interactions"
                    />
                    <FeatureCard
                        icon={<Code size={20} />}
                        title="Clean Code"
                        description="Modular, well-commented, and maintainable codebase"
                    />
                    <FeatureCard
                        icon={<Zap size={20} />}
                        title="AI Assistant"
                        description="Intelligent chatbot for medication safety awareness"
                    />
                    <FeatureCard
                        icon={<Target size={20} />}
                        title="Family Profiles"
                        description="Manage medication safety for your loved ones"
                    />
                </div>
            </section>

            {/* Aim & Objectives */}
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    <Target className="mr-3 text-purple-500" size={28} />
                    Aim & Objectives
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:translate-x-1 origin-left">Project Aim</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            To create an accessible, user-friendly platform that raises awareness about medication
                            safety and helps users make informed decisions about their health.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:translate-x-1 origin-left">Key Objectives</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                            <li>Provide educational information about medication interactions</li>
                            <li>Enable users to track medications for themselves and family members</li>
                            <li>Offer AI-powered assistance for common medication safety questions</li>
                            <li>Create a modern, accessible interface that works on all devices</li>
                            <li>Build a production-ready application following best practices</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Future Scope */}
            <section className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl shadow-soft border border-blue-100 dark:border-gray-600">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    <Rocket className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
                    Future Enhancements
                </h2>
                <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                        As I continue learning and growing as a developer, I plan to add:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Advanced AI-powered risk analysis using machine learning</li>
                        <li>Integration with pharmacy databases for real-time drug information</li>
                        <li>Medication reminder system with push notifications</li>
                        <li>Multi-language support for global accessibility</li>
                        <li>Mobile app versions for iOS and Android</li>
                        <li>Integration with wearable devices for health monitoring</li>
                        <li>Community features for sharing experiences (moderated)</li>
                    </ul>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:scale-[1.02] origin-left">
                    Technologies Used
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <TechBadge name="React" category="Frontend" />
                    <TechBadge name="Node.js" category="Backend" />
                    <TechBadge name="MongoDB" category="Database" />
                    <TechBadge name="Tailwind CSS" category="Styling" />
                    <TechBadge name="OpenAI API" category="AI" />
                    <TechBadge name="Express" category="Backend" />
                </div>
            </section>

            {/* Closing Note */}
            <section className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 italic">
                    "This project is a learning journey, and I'm continuously improving it.
                    Thank you for checking it out!"
                </p>
                <p className="text-gray-900 dark:text-gray-100 font-semibold mt-2">
                    - Mohammed Meraj Uddin
                </p>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
        <div className="text-primary dark:text-blue-400 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer hover:translate-x-1 origin-left">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

const TechBadge = ({ name, category }) => (
    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{category}</p>
    </div>
);

export default About;
