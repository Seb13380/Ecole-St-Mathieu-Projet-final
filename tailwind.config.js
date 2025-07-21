module.exports = {
    content: [
        "./src/views/**/*.{twig,html}",
        "./public/**/*.{js,html}",
        "./src/**/*.{js,twig}",
        "./**/*.{html,twig,js}"
    ],
    plugins: [
        require('daisyui'),
    ],
}