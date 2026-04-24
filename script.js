/* ============================================
   STEPHAN VIRAY — PORTFOLIO JS
   Coffee-Tech Inspired — Dark/Warm Zones
   ============================================ */

// ===== SCROLL TO TOP ON REFRESH =====
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ===== LOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1200);
});

// ===== THREE.JS — AMBIENT PARTICLE FIELD =====
function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Sparse floating particles
    const particleCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 24;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
        size: 1.8,
        color: 0xd46a43,
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Wireframe torus knot
    const torusGeo = new THREE.TorusKnotGeometry(3, 0.8, 100, 16);
    const torusMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xffffff,
        transparent: true,
        opacity: 0.06
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    camera.position.z = 10;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        torus.rotation.y = t * 0.05;
        torus.rotation.x = t * 0.02;

        particles.rotation.y = t * 0.015;
        particles.rotation.x = t * 0.005;

        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.012;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.012;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
initHero3D();

// ===== NAV =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

function updateActiveLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
        const top = sec.offsetTop;
        const h = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + h) {
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
        }
    });
}

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

// Observe all reveal variants
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger').forEach(el => revealObs.observe(el));

// ===== HORIZONTAL PARALLAX TEXT =====
const parallaxTexts = document.querySelectorAll('.parallax-text[data-parallax-speed]');
let scrollTicking = false;

function updateParallaxText() {
    const scrolled = window.scrollY;
    parallaxTexts.forEach(el => {
        const section = el.parentElement;
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const offset = (sectionCenter - viewCenter) * parseFloat(el.dataset.parallaxSpeed);
        el.style.transform = `translateX(${offset}px)`;
    });
}

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            updateParallaxText();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// ===== PARALLAX =====
(function() {
    const heroContent = document.querySelector('.hero-content');
    const scrollCue = document.getElementById('scroll-cue');
    const heroCanvas = document.getElementById('hero-canvas');

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function lerpParallax() {
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;

        const scrolled = window.scrollY;

        if (heroContent && scrolled < window.innerHeight) {
            const scrollFade = 1 - scrolled / (window.innerHeight * 0.5);
            const scrollY = scrolled * 0.25;
            heroContent.style.transform = `translateY(${scrollY}px) translate3d(${mouseX * 10}px, ${mouseY * 6}px, 0)`;
            heroContent.style.opacity = Math.max(0, scrollFade);
        }

        if (scrollCue) {
            scrollCue.style.opacity = Math.max(0, 1 - window.scrollY / 200);
        }

        if (heroCanvas && scrolled < window.innerHeight) {
            heroCanvas.style.transform = `translate3d(${mouseX * 12}px, ${mouseY * 8}px, 0)`;
        }

        requestAnimationFrame(lerpParallax);
    }
    lerpParallax();
})();

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose = document.getElementById('lb-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

let lbImages = [];
let lbIndex = 0;

document.querySelectorAll('.graphic-card').forEach((item, i) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.graphic-title');
    if (img) {
        lbImages.push({ src: img.src, caption: cap ? cap.textContent : '' });
    }
    item.addEventListener('click', () => {
        lbIndex = i;
        openLB(i);
    });
});

function openLB(i) {
    lbImg.src = lbImages[i].src;
    lbCaption.textContent = lbImages[i].caption;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLB() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lbClose.addEventListener('click', closeLB);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLB(); });
lbPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
    openLB(lbIndex);
});
lbNext.addEventListener('click', (e) => {
    e.stopPropagation();
    lbIndex = (lbIndex + 1) % lbImages.length;
    openLB(lbIndex);
});
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});

// ===== SMOOTH SCROLL =====
function smoothScrollTo(targetY, duration = 1000) {
    const startY = window.scrollY;
    const diff = targetY - startY;
    let start = null;

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easedProgress = easeOutExpo(progress);
        window.scrollTo(0, startY + diff * easedProgress);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            const targetY = target.offsetTop - nav.offsetHeight - 16;
            smoothScrollTo(targetY, 1200);
        }
    });
});
