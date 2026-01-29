/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#2563EB", // Clinical Blue
                secondary: "#14B8A6", // Teal
                accent: "#F59E0B", // Amber
                background: "#F9FAFB", // Soft White
                surface: "#FFFFFF",
                text: "#1F2937", // Gray-800
                muted: "#6B7280", // Gray-500
            },
            fontFamily: {
                heading: ['Inter', 'sans-serif'],
                body: ['Roboto', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
