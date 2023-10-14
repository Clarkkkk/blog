function withOpacity(variableName) {
    return ({ opacityValue }) => {
        if (opacityValue !== undefined) {
            return `rgba(var(${variableName}), ${opacityValue})`
        }
        return `rgb(var(${variableName}))`
    }
}

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        // Remove the following screen breakpoint or add other breakpoints
        // if one breakpoint is not enough for you
        screens: {
            sm: '640px'
        },

        extend: {
            colors: {
                'skin-base': withOpacity('--color-text-base'),
                'skin-accent': withOpacity('--color-accent'),
                'skin-fill': withOpacity('--color-fill'),
                'skin-card': withOpacity('--color-card'),
                'skin-card-muted': withOpacity('--color-card-muted'),
                'skin-line': withOpacity('--color-border')
            },
            textUnderlineOffset: {
                5: '5px'
            }
        }
    },
    plugins: [require('@tailwindcss/typography')]
}
