/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0B0F19',
                surface: '#1A2033',
                primary: '#6366F1',
                secondary: '#A855F7',
                accent: '#10B981',
                textMain: '#F8FAFC',
                textMuted: '#94A3B8'
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
            }
        },
    },
    plugins: [],
}
