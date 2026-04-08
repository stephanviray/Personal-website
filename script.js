/* ============================================
   STEPHAN VIRAY — MINIMAL PORTFOLIO JS
   ============================================ */

// ===== LOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1000);
});

// ===== THREE.JS — SUBTLE WIREFRAME GEOMETRY =====
function initHero3D() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Create a sparse network of points and lines
    const groupCount = 3;
    const objects = [];

    // Large icosahedron wireframe
    const geo1 = new THREE.IcosahedronGeometry(4, 1);
    const mat1 = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x1a1a18,
        transparent: true,
        opacity: 0.6
    });
    const mesh1 = new THREE.Mesh(geo1, mat1);
    mesh1.position.set(0, 0, 0);
    scene.add(mesh1);
    objects.push(mesh1);

    // Smaller dodecahedron
    const geo2 = new THREE.DodecahedronGeometry(2.5, 0);
    const mat2 = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x1a1a18,
        transparent: true,
        opacity: 0.35
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    scene.add(mesh2);
    objects.push(mesh2);

    // Octahedron
    const geo3 = new THREE.OctahedronGeometry(1.5, 0);
    const mat3 = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x1a1a18,
        transparent: true,
        opacity: 0.25
    });
    const mesh3 = new THREE.Mesh(geo3, mat3);
    scene.add(mesh3);
    objects.push(mesh3);

    // Sparse particles
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 18;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
        size: 1.5,
        color: 0x1a1a18,
        transparent: true,
        opacity: 0.2,
        sizeAttenuation: true
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

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

        mesh1.rotation.y = t * 0.04;
        mesh1.rotation.x = t * 0.02;

        mesh2.rotation.y = -t * 0.06;
        mesh2.rotation.z = t * 0.03;

        mesh3.rotation.y = t * 0.08;
        mesh3.rotation.x = -t * 0.04;

        particles.rotation.y = t * 0.01;

        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.015;
        camera.position.y += (mouseY * 0.8 - camera.position.y) * 0.015;
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
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ===== PARALLAX =====
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    const scrollCue = document.getElementById('scroll-cue');

    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
        heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.6);
    }
    if (scrollCue) {
        scrollCue.style.opacity = 1 - scrolled / 250;
    }
});
// ===== PHOTO FILTERS & SLIDER =====
const filterBtns = document.querySelectorAll('.photo-filter');
const photoTrack = document.getElementById('gallery-photos');
const photoItems = document.querySelectorAll('#gallery-photos .gallery-item');

let visibleItems = Array.from(photoItems);
let originalOrder = Array.from(photoItems);
let autoSlideInterval;
let isAnimating = false;

function updateSliderCenter(shiftOffset = 0) {
    if (!photoTrack || visibleItems.length === 0) return;
    
    let itemsPerView = 3;
    if (window.innerWidth <= 900) itemsPerView = 2;
    if (window.innerWidth <= 600) itemsPerView = 1;
    
    const centerOffset = window.innerWidth <= 600 ? 0 : Math.floor(itemsPerView / 2);
    const targetCenter = centerOffset + shiftOffset;
    
    visibleItems.forEach((item, idx) => {
        if (idx === targetCenter) {
            item.classList.add('is-center');
        } else {
            item.classList.remove('is-center');
        }
    });
}

function nextSlide() {
    let itemsPerView = 3;
    if (window.innerWidth <= 900) itemsPerView = 2;
    if (window.innerWidth <= 600) itemsPerView = 1;

    // Don't scroll if we don't have enough items to loop seamlessly
    if (!photoTrack || visibleItems.length <= itemsPerView || isAnimating) return;
    isAnimating = true;
    
    photoTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    
    // Apply center styling to the upcoming center item before shifting
    updateSliderCenter(1);
    
    const gap = 16;
    const offset = visibleItems[0].offsetWidth + gap;
    photoTrack.style.transform = `translateX(-${offset}px)`;
    
    setTimeout(() => {
        // Snap back instantly
        photoTrack.style.transition = 'none';
        
        // Move the first element physically to the end of the track
        const firstItem = visibleItems.shift();
        photoTrack.appendChild(firstItem);
        visibleItems.push(firstItem);
        
        photoTrack.style.transform = `translateX(0px)`;
        
        // Reset state
        updateSliderCenter(0);
        isAnimating = false;
    }, 850); // wait slightly longer than CSS transition time
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 1500);
}

function stopAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
}

window.addEventListener('resize', () => {
    updateSliderCenter(0);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        // Reset to original DOM order so filters don't mangle item positions over time
        photoTrack.innerHTML = '';
        originalOrder.forEach(item => {
            photoTrack.appendChild(item);
            
            const cat = item.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
                item.classList.remove('filter-hidden');
            } else {
                item.classList.add('filter-hidden');
            }
        });
        
        photoTrack.style.transition = 'none';
        photoTrack.style.transform = `translateX(0px)`;
        
        visibleItems = originalOrder.filter(item => !item.classList.contains('filter-hidden'));
        updateSliderCenter(0);
        startAutoSlide();
    });
});

// Init
updateSliderCenter(0);
startAutoSlide();

const sliderContainer = document.querySelector('.photo-slider');
if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoSlide);
    sliderContainer.addEventListener('mouseleave', startAutoSlide);
}

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose = document.getElementById('lb-close');
const lbPrev = document.getElementById('lb-prev');
const lbNext = document.getElementById('lb-next');

let lbImages = [];
let lbIndex = 0;

document.querySelectorAll('.gallery-item:not(.gallery-add):not(.video-item)').forEach((item, i) => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.gallery-caption span:first-child');
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
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - nav.offsetHeight - 16,
                behavior: 'smooth'
            });
        }
    });
});


