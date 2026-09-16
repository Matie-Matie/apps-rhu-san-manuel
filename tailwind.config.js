import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    safelist: [
        // Status badges are composed dynamically: `badge badge-${status}`
        { pattern: /^badge-(validated|dispensed|cancelled)$/ },
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'system-ui',
                    'sans-serif',
                ],
            },

            colors: {
                /* ─── Dentlo-inspired palette (cool neutrals + blue primary) ─── */
                bg: '#F6F7FB',
                surface: {
                    DEFAULT: '#FFFFFF',
                    secondary: '#F2F4F8',
                },
                accent: {
                    50: '#FAFCF9',
                    100: '#EFF6EE',
                    200: '#D5E6D2',
                    300: '#B4D3AE',
                    400: '#86B87E',
                    500: '#589D4C',
                    600: '#4D8A43',
                    700: '#427639',
                    800: '#37612F',
                    900: '#2A4B24',
                    950: '#1C3218',
                },
                soil: {
                    50: '#F8F9FB',
                    100: '#F2F4F8',
                    200: '#ECECEC',
                    300: '#DADBDF',
                    400: '#A9ABB3',
                    500: '#7B7B7B',
                    600: '#5E5F66',
                    700: '#45464C',
                    800: '#2E2F33',
                    900: '#1E1E1E',
                },
                /* Status colors */
                success: {
                    DEFAULT: '#2EB85C',
                    light: '#E9F9EF',
                },
                warning: {
                    DEFAULT: '#F9B115',
                    light: '#FEF7E6',
                },
                error: {
                    DEFAULT: '#E55353',
                    light: '#FDEEEE',
                },
                info: {
                    DEFAULT: '#589D4C',
                    light: '#EFF6EE',
                },
            },

            borderRadius: {
                card: '20px',
                container: '28px',
                control: '10px',
                input: '12px',
                pill: '999px',
            },

            boxShadow: {
                card: '0 4px 20px rgba(0, 0, 0, 0.04)',
                'card-hover': '0 8px 28px rgba(0, 0, 0, 0.07)',
                modal: '0 24px 64px rgba(0, 0, 0, 0.16)',
                dropdown: '0 12px 32px rgba(0, 0, 0, 0.10)',
            },

            transitionTimingFunction: {
                'matie': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
        },
    },

    plugins: [forms],
};
