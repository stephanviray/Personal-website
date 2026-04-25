/* === STEPHAN VIRAY — PREMIUM PORTFOLIO JS === */

// ===== SCROLL TO TOP ON REFRESH =====
history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursorDot.style.left = cursorX + 'px';
    cursorDot.style.top = cursorY + 'px';
});

function animateRing() {
    ringX += (cursorX - ringX) * 0.12;
    ringY += (cursorY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();

// Hover detection for cursor
document.querySelectorAll('a, button, [data-magnetic], .skill-tag, .graphic-card, .video-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== LOADER WITH COUNTER =====
const loaderCounter = document.getElementById('loader-counter');
const loaderFill = document.getElementById('loader-fill');
let count = 0;

function animateLoader() {
    if (count < 100) {
        count += Math.floor(Math.random() * 3) + 1;
        if (count > 100) count = 100;
        loaderCounter.textContent = count;
        loaderFill.style.width = count + '%';
        setTimeout(animateLoader, 15 + Math.random() * 20);
    } else {
        loaderCounter.textContent = '100';
        loaderFill.style.width = '100%';
        setTimeout(() => {
            document.getElementById('loader').classList.add('hidden');
        }, 400);
    }
}
animateLoader();

// ===== THREE.JS — CONSTELLATION PARTICLE FIELD =====
function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particles
    const particleCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 30;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        pSizes[i] = Math.random() * 2 + 0.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
        size: 1.5, color: 0xc9a84c, transparent: true, opacity: 0.35, sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({
        wireframe: true, color: 0xc9a84c, transparent: true, opacity: 0.04
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    // Ring
    const ringGeo = new THREE.TorusGeometry(5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xc9a84c, transparent: true, opacity: 0.06
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    camera.position.z = 12;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        ico.rotation.y = t * 0.08;
        ico.rotation.x = t * 0.03;
        ring.rotation.z = t * 0.02;
        particles.rotation.y = t * 0.012;
        particles.rotation.x = t * 0.004;
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.015;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.015;
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
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObs.observe(el));

// ===== HERO PARALLAX =====
(function() {
    const heroContent = document.querySelector('.hero-content');
    const scrollCue = document.getElementById('scroll-cue');
    const heroCanvas = document.getElementById('hero-canvas');
    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

    document.addEventListener('mousemove', e => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function lerpParallax() {
        mouseX += (targetMouseX - mouseX) * 0.04;
        mouseY += (targetMouseY - mouseY) * 0.04;
        const scrolled = window.scrollY;
        if (heroContent && scrolled < window.innerHeight) {
            const scrollFade = 1 - scrolled / (window.innerHeight * 0.5);
            heroContent.style.transform = `translateY(${scrolled * 0.25}px) translate3d(${mouseX * 10}px, ${mouseY * 6}px, 0)`;
            heroContent.style.opacity = Math.max(0, scrollFade);
        }
        if (scrollCue) scrollCue.style.opacity = Math.max(0, 1 - window.scrollY / 200);
        if (heroCanvas && scrolled < window.innerHeight) {
            heroCanvas.style.transform = `translate3d(${mouseX * 12}px, ${mouseY * 8}px, 0)`;
        }
        requestAnimationFrame(lerpParallax);
    }
    lerpParallax();
})();

// ===== MAGNETIC EFFECT =====
document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.4s var(--ease)';
        setTimeout(() => el.style.transition = '', 400);
    });
});

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose = document.getElementById('lb-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

let lbImages = [], lbIndex = 0;

document.querySelectorAll('.graphic-card').forEach((item, i) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.graphic-title');
    if (img) lbImages.push({ src: img.src, caption: cap ? cap.textContent : '' });
    item.addEventListener('click', () => { lbIndex = i; openLB(i); });
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
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; openLB(lbIndex); });
lbNext.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex + 1) % lbImages.length; openLB(lbIndex); });
document.addEventListener('keydown', e => {
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
    function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        window.scrollTo(0, startY + diff * easeOutExpo(progress));
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) smoothScrollTo(target.offsetTop - nav.offsetHeight - 16, 1200);
    });
});
