module.exports = {
    content: ["./public/**/*html", "./src/**/*.vue"],
    darkMode: 'media',
    theme: {
        extend: {},
    },
    variants: {
        extend: {}
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
