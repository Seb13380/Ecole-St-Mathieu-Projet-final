module.exports = {
    content: [
        "./src/views/**/*.{twig,html}",
        "./public/assets/**/*.{js,html}",
        "./src/**/*.twig",
        "./tailwind-classes.html"
    ],
    plugins: [
        require('daisyui'),
    ],
    safelist: [
        'px-8',
        'mx-8',
        'py-8',
        'my-8',
        'px-4',
        'mx-4',
        'py-4',
        'my-4',
        'mx-auto',
        'my-auto',
        'max-w-6xl',
        'max-w-7xl',
        'gap-4',
        'gap-6',
        'rounded-lg',
        'md:px-8',
        'lg:px-8',
        'md:mx-8',
        'lg:mx-8'
    ]
}
