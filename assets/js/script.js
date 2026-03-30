/* ═══════════════════════════════════════════════════════════════
   RETRO CUPHEAD STYLE - Minimal JavaScript
   Clean, simple interactions
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Subtle hover sound effect simulation via visual feedback
    const cards = document.querySelectorAll('.project-card, .contact-btn, .nav-link');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.15s ease';
        });
    });

    // Typewriter effect for tagline on scroll
    const tagline = document.querySelector('.tagline');
    if (tagline) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tagline.style.animation = 'none';
                    tagline.offsetHeight; // Trigger reflow
                    tagline.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(tagline);
    }

    // Add slight parallax to character illustration
    const character = document.querySelector('.main-character');
    if (character) {
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            character.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    // Console easter egg
    console.log('%c★ SEBASTIAN GBUDJE ★', 'font-size: 20px; font-family: Georgia, serif; font-weight: bold;');
    console.log('%cAlways Building.', 'font-size: 14px; font-style: italic; color: #e8a435;');
    console.log('%c─────────────────────', 'color: #1a1a1a;');
    console.log('Thanks for checking out my portfolio!');
    console.log('GitHub: https://github.com/gbudjeakp');
    console.log('Songram: https://songram.app');
});