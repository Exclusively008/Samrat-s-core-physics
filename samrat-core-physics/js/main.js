// ============================================
// SAMRAT CORE PHYSICS - Main JavaScript
// ============================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initLoading();
    initNavbar();
    initTheme();
    initScrollToTop();
    initHeroParticles();
    initScrollAnimations();
    initClassTabs();
    initAttendanceFilters();
    initAOS();
    
    // Load default batches
    if (typeof renderBatches === 'function') {
        renderBatches('Class 9');
    }
});

// ========== LOADING SCREEN ==========
function initLoading() {
    window.addEventListener('load', () => {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
            }, 800);
        }
    });
}

// ========== NAVIGATION ==========
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const links = navLinks?.querySelectorAll('a');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        
        // Active link based on scroll position
        if (links) {
            const sections = document.querySelectorAll('section[id]');
            let current = '';
            sections.forEach(section => {
                const top = section.offsetTop - 100;
                const bottom = top + section.offsetHeight;
                if (window.scrollY >= top && window.scrollY < bottom) {
                    current = section.id;
                }
            });
            
            links.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Hamburger menu
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks?.classList.toggle('active');
    });
    
    // Close menu on link click
    links?.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });
}

// ========== THEME TOGGLE ==========
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const icon = toggle?.querySelector('i');
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (icon) {
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    toggle?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// ========== SCROLL TO TOP ==========
function initScrollToTop() {
    const button = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button?.classList.add('visible');
        } else {
            button?.classList.remove('visible');
        }
    });
    
    button?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== HERO PARTICLES ==========
function initHeroParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 20}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        particle.style.width = `${2 + Math.random() * 4}px`;
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ========== AOS INIT ==========
function initAOS() {
    if (window.AOS) {
        window.AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
