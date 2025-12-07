// tailwind.config.cjs
module.exports = {
    content: [
        "./pages/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}", // optional if you ever use /app
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
