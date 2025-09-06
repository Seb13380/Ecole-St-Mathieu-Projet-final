/**
 * Script de gestion du menu mobile responsive
 * École Saint-Mathieu
 */

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileDropdowns = document.querySelectorAll('.mobile-dropdown');

    let isMenuOpen = false;

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('translate-x-full');
        mobileMenu.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
        isMenuOpen = true;
        if (mobileMenuClose) setTimeout(() => mobileMenuClose.focus(), 250);
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.style.overflow = '';
        isMenuOpen = false;
        // Force close all dropdowns
        mobileDropdowns.forEach(dropdown => {
            const content = dropdown.querySelector('.mobile-dropdown-content');
            const arrow = dropdown.querySelector('.mobile-dropdown-btn svg');
            if (content) {
                content.classList.add('hidden');
                content.dataset.open = 'false';
            }
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    }

    function toggleMobileDropdown(dropdown) {
        const content = dropdown.querySelector('.mobile-dropdown-content');
        const arrow = dropdown.querySelector('.mobile-dropdown-btn svg');
        if (!content) return;

        // Etat basé sur dataset, pas uniquement sur la classe 'hidden'
        const currentlyOpen = content.dataset.open === 'true';

        if (currentlyOpen) {
            // Fermer
            content.classList.add('hidden');
            content.dataset.open = 'false';
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        } else {
            // Ouvrir (fermer les autres d'abord)
            mobileDropdowns.forEach(d => {
                if (d !== dropdown) {
                    const c = d.querySelector('.mobile-dropdown-content');
                    const a = d.querySelector('.mobile-dropdown-btn svg');
                    if (c) {
                        c.classList.add('hidden');
                        c.dataset.open = 'false';
                    }
                    if (a) a.style.transform = 'rotate(0deg)';
                }
            });
            content.classList.remove('hidden');
            content.dataset.open = 'true';
            if (arrow) arrow.style.transform = 'rotate(180deg)';
        }
    }

    // Initialisation: forcer l'état fermé fiable
    mobileDropdowns.forEach(dropdown => {
        const content = dropdown.querySelector('.mobile-dropdown-content');
        const arrow = dropdown.querySelector('.mobile-dropdown-btn svg');
        if (content) {
            content.classList.add('hidden');
            content.dataset.open = 'false';
        }
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    });

    // Listeners
    mobileMenuButton?.addEventListener('click', e => { e.preventDefault(); openMobileMenu(); });
    mobileMenuClose?.addEventListener('click', e => { e.preventDefault(); closeMobileMenu(); });

    mobileDropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.mobile-dropdown-btn');
        button?.addEventListener('click', e => { e.preventDefault(); toggleMobileDropdown(dropdown); });
    });

    if (mobileMenu) {
        const menuLinks = mobileMenu.querySelectorAll('a:not(.mobile-dropdown-btn)');
        menuLinks.forEach(link => link.addEventListener('click', () => closeMobileMenu()));
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isMenuOpen) closeMobileMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768 && isMenuOpen) closeMobileMenu(); });
});
