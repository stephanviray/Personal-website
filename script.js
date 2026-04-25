/* === STEPHAN VIRAY — 3D IMMERSIVE PORTFOLIO JS === */

history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// ===== CUSTOM CURSOR =====
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;
document.addEventListener('mousemove', e => {
    cursorX = e.clientX; cursorY = e.clientY;
    cursorDot.style.left = cursorX + 'px'; cursorDot.style.top = cursorY + 'px';
});
function animateRing() {
    ringX += (cursorX - ringX) * 0.12; ringY += (cursorY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a, button, [data-magnetic], .skill-tag, .graphic-card, .video-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// ===== LOADER =====
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
        setTimeout(() => document.getElementById('loader').classList.add('hidden'), 400);
    }
}
animateLoader();

// ===== THREE.JS — REALISTIC GALAXY WITH CUSTOM SHADERS =====
function init3DScene() {
    const canvas = document.getElementById('scene3d');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    // ── GENERATE STAR TEXTURE (procedural, circular glow) ──
    function createStarTexture(size, r, g, b) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.15, `rgba(${r},${g},${b},0.8)`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},0.25)`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},0.05)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    // ── GENERATE NEBULA TEXTURE (soft cloud) ──
    function createNebulaTexture(size, r, g, b, opacity) {
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        // Multiple soft blobs
        for (let i = 0; i < 8; i++) {
            const x = size * (0.2 + Math.random() * 0.6);
            const y = size * (0.2 + Math.random() * 0.6);
            const rad = size * (0.15 + Math.random() * 0.3);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
            const a = opacity * (0.3 + Math.random() * 0.7);
            grad.addColorStop(0, `rgba(${r},${g},${b},${a})`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.3})`);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    const starTexWhite = createStarTexture(64, 255, 245, 230);
    const starTexCoffee = createStarTexture(64, 200, 162, 101);
    const starTexMocha = createStarTexture(64, 166, 124, 66);
    const starTexGold = createStarTexture(64, 212, 165, 116);

    // ── BACKGROUND STAR FIELD (thousands of tiny stars) ──
    const bgStarCount = 2000;
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgStarCount * 3);
    const bgSizes = new Float32Array(bgStarCount);
    for (let i = 0; i < bgStarCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 80 + Math.random() * 120;
        bgPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        bgPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        bgPos[i*3+2] = r * Math.cos(phi);
        bgSizes[i] = 0.3 + Math.random() * 1.5;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('size', new THREE.BufferAttribute(bgSizes, 1));

    const bgStarMat = new THREE.PointsMaterial({
        map: starTexWhite, size: 0.35, transparent: true, opacity: 0.2,
        sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    scene.add(new THREE.Points(bgGeo, bgStarMat));

    // ── GALAXY SPIRAL (custom shader for circular glowing particles) ──
    const galaxyVertShader = `
        attribute float aSize;
        attribute float aRandom;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
            vColor = color;
            vec3 pos = position;
            float dist = length(pos.xz);
            float angle = atan(pos.z, pos.x);
            angle += uTime * 0.03 / (1.0 + dist * 0.1);
            pos.x = cos(angle) * dist;
            pos.z = sin(angle) * dist;
            pos.y += sin(uTime * 0.5 + aRandom * 6.28) * 0.15;
            vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPos;
            gl_PointSize = aSize * (200.0 / -mvPos.z);
            vAlpha = 0.35 - dist * 0.008;
        }
    `;
    const galaxyFragShader = `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            float glow = 0.03 / d - 0.06;
            glow = clamp(glow, 0.0, 1.0);
            float core = smoothstep(0.5, 0.05, d);
            float alpha = (glow * 0.15 + core * 0.25) * clamp(vAlpha, 0.0, 1.0);
            gl_FragColor = vec4(vColor, alpha);
        }
    `;

    const gCount = 6000;
    const gGeo = new THREE.BufferGeometry();
    const gPositions = new Float32Array(gCount * 3);
    const gColors = new Float32Array(gCount * 3);
    const gSizes = new Float32Array(gCount);
    const gRandoms = new Float32Array(gCount);
    const colIn = new THREE.Color(0xc8a265);
    const colMid = new THREE.Color(0xd4a574);
    const colOut = new THREE.Color(0x3d2b1a);

    for (let i = 0; i < gCount; i++) {
        const radius = Math.pow(Math.random(), 1.5) * 35;
        const branches = 5;
        const branchAngle = (i % branches) / branches * Math.PI * 2;
        const spin = radius * 0.6;
        const rPow = 3;
        const rx = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * radius;
        const ry = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * 0.08 * radius;
        const rz = Math.pow(Math.random(), rPow) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * radius;
        gPositions[i*3] = Math.cos(branchAngle + spin) * radius + rx;
        gPositions[i*3+1] = ry;
        gPositions[i*3+2] = Math.sin(branchAngle + spin) * radius + rz;
        const t = radius / 35;
        const c = t < 0.5 ? colIn.clone().lerp(colMid, t * 2) : colMid.clone().lerp(colOut, (t - 0.5) * 2);
        gColors[i*3] = c.r; gColors[i*3+1] = c.g; gColors[i*3+2] = c.b;
        gSizes[i] = (0.5 + Math.random() * 2.5) * (1 - t * 0.5);
        gRandoms[i] = Math.random();
    }
    gGeo.setAttribute('position', new THREE.BufferAttribute(gPositions, 3));
    gGeo.setAttribute('color', new THREE.BufferAttribute(gColors, 3));
    gGeo.setAttribute('aSize', new THREE.BufferAttribute(gSizes, 1));
    gGeo.setAttribute('aRandom', new THREE.BufferAttribute(gRandoms, 1));

    const galaxyMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: galaxyVertShader,
        fragmentShader: galaxyFragShader,
        vertexColors: true, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const galaxy = new THREE.Points(gGeo, galaxyMat);
    galaxy.rotation.x = Math.PI * 0.2;
    scene.add(galaxy);

    // ── NEBULA CLOUD PLANES ──
    const nebulae = [];
    const nebulaConfigs = [
        { r:200, g:162, b:101, size:30, x:5, y:1, z:-15, opacity:0.025 },
        { r:166, g:124, b:66, size:25, x:-8, y:-2, z:-20, opacity:0.018 },
        { r:212, g:165, b:116, size:20, x:10, y:3, z:-25, opacity:0.012 },
        { r:61, g:43, b:26, size:35, x:-3, y:-1, z:-30, opacity:0.02 },
        { r:139, g:90, b:43, size:22, x:12, y:-3, z:-18, opacity:0.01 },
    ];
    nebulaConfigs.forEach(n => {
        const tex = createNebulaTexture(512, n.r, n.g, n.b, n.opacity);
        const mat = new THREE.SpriteMaterial({
            map: tex, transparent: true, opacity: n.opacity,
            blending: THREE.AdditiveBlending, depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(n.size, n.size, 1);
        sprite.position.set(n.x, n.y, n.z);
        scene.add(sprite);
        nebulae.push(sprite);
    });

    // ── ACCENT STAR CLUSTERS (colored, different textures) ──
    function addStarCluster(tex, count, spread, basePos, size, opacity) {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i*3] = basePos.x + (Math.random()-0.5) * spread;
            pos[i*3+1] = basePos.y + (Math.random()-0.5) * spread;
            pos[i*3+2] = basePos.z + (Math.random()-0.5) * spread;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            map: tex, size, transparent: true, opacity,
            sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending
        });
        scene.add(new THREE.Points(geo, mat));
    }
    addStarCluster(starTexCoffee, 100, 20, {x:5,y:2,z:-10}, 0.4, 0.1);
    addStarCluster(starTexMocha, 80, 25, {x:-8,y:-1,z:-15}, 0.35, 0.08);
    addStarCluster(starTexGold, 80, 18, {x:3,y:-2,z:-20}, 0.35, 0.08);

    // ── FLOATING WIREFRAME GEOMETRIES ──
    const geoGroup = new THREE.Group();
    const wireMat = (color, op) => new THREE.MeshBasicMaterial({ wireframe:true, color, transparent:true, opacity:op });
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5,1), wireMat(0xc8a265, 0.04));
    ico.position.set(8,2,-10); geoGroup.add(ico);
    const tk = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5,0.4,64,8,2,3), wireMat(0xc8a265, 0.03));
    tk.position.set(-10,-3,-15); geoGroup.add(tk);
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(1.8,0), wireMat(0xa67c42, 0.04));
    oct.position.set(12,-4,-20); geoGroup.add(oct);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6,0.02,16,100), wireMat(0xc8a265, 0.04));
    ring.rotation.x = Math.PI/2.5; ring.position.set(0,0,-8); geoGroup.add(ring);
    const dod = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2,0), wireMat(0xd4a574, 0.03));
    dod.position.set(6,5,-18); geoGroup.add(dod);
    scene.add(geoGroup);

    // ── AMBIENT DUST ──
    const dustCount = 600;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
        dustPos[i*3] = (Math.random()-0.5)*60;
        dustPos[i*3+1] = (Math.random()-0.5)*60;
        dustPos[i*3+2] = (Math.random()-0.5)*60;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        map: starTexWhite, size: 0.1, transparent: true, opacity: 0.1,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ── CAMERA & ANIMATION ──
    camera.position.set(0, 2, 15);
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        const scrollY = window.scrollY;
        const scrollNorm = scrollY / (document.body.scrollHeight - window.innerHeight);

        galaxyMat.uniforms.uTime.value = t;
        galaxy.rotation.y = t * 0.008 + scrollNorm * Math.PI * 0.3;

        ico.rotation.y = t*0.12; ico.rotation.x = t*0.05;
        ico.position.y = 2 + Math.sin(t*0.5)*1.5;
        tk.rotation.y = t*0.08; tk.rotation.z = t*0.04;
        tk.position.y = -3 + Math.sin(t*0.3+1)*2;
        oct.rotation.y = t*0.1; oct.rotation.x = t*0.06;
        oct.position.y = -4 + Math.sin(t*0.4+2)*1.8;
        ring.rotation.z = t*0.02;
        dod.rotation.y = t*0.09; dod.rotation.x = t*0.07;
        dod.position.y = 5 + Math.sin(t*0.35+3)*1.2;

        nebulae.forEach((n, i) => {
            n.position.y += Math.sin(t * 0.15 + i) * 0.002;
            n.material.opacity = nebulaConfigs[i].opacity * (0.7 + Math.sin(t * 0.2 + i * 1.5) * 0.3);
        });

        dust.rotation.y = t * 0.005; dust.rotation.x = t * 0.002;

        const targetCamZ = 15 - scrollNorm * 10;
        const targetCamY = 2 - scrollNorm * 3;
        camera.position.z += (targetCamZ - camera.position.z) * 0.02;
        camera.position.y += (targetCamY - camera.position.y) * 0.02;
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.015;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.008;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
init3DScene();

// ===== NAV =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 40); updateActiveLink(); });
navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); navLinks.classList.toggle('open'); });
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => { navToggle.classList.remove('active'); navLinks.classList.remove('open'); });
});
function updateActiveLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
        const top = sec.offsetTop, h = sec.offsetHeight, id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + h) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
        }
    });
}

// ===== SCROLL REVEAL =====
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObs.observe(el));

// ===== 3D TILT EFFECT =====
document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height;
        el.style.transform = `perspective(800px) rotateX(${(y-0.5)*-10}deg) rotateY(${(x-0.5)*10}deg) scale3d(1.02,1.02,1.02)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(() => el.style.transition = '', 500);
    });
});

// ===== HERO PARALLAX =====
(function() {
    const heroContent = document.getElementById('hero-content');
    const scrollCue = document.getElementById('scroll-cue');
    let mX = 0, mY = 0, tX = 0, tY = 0;
    document.addEventListener('mousemove', e => { tX = (e.clientX/window.innerWidth-0.5)*2; tY = (e.clientY/window.innerHeight-0.5)*2; });
    function lp() {
        mX += (tX-mX)*0.04; mY += (tY-mY)*0.04;
        const s = window.scrollY;
        if (heroContent && s < window.innerHeight) {
            heroContent.style.transform = `perspective(1000px) translateY(${s*0.25}px) translate3d(${mX*15}px,${mY*10}px,0) rotateX(${mY*-2}deg) rotateY(${mX*2}deg)`;
            heroContent.style.opacity = Math.max(0, 1-s/(window.innerHeight*0.5));
        }
        if (scrollCue) scrollCue.style.opacity = Math.max(0, 1-window.scrollY/200);
        requestAnimationFrame(lp);
    }
    lp();
})();

// ===== MAGNETIC EFFECT =====
document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.2}px,${(e.clientY-r.top-r.height/2)*0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
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
    const img = item.querySelector('img'), cap = item.querySelector('.graphic-title');
    if (img) lbImages.push({ src: img.src, caption: cap ? cap.textContent : '' });
    item.addEventListener('click', () => { lbIndex = i; openLB(i); });
});
function openLB(i) { lbImg.src = lbImages[i].src; lbCaption.textContent = lbImages[i].caption; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; }
function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
lbClose.addEventListener('click', closeLB);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex-1+lbImages.length)%lbImages.length; openLB(lbIndex); });
lbNext.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex+1)%lbImages.length; openLB(lbIndex); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
});

// ===== SMOOTH SCROLL =====
function smoothScrollTo(ty, dur = 1000) {
    const sy = window.scrollY, d = ty - sy; let st = null;
    function ease(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10*t); }
    function step(ts) { if (!st) st = ts; const p = Math.min((ts-st)/dur, 1); window.scrollTo(0, sy+d*ease(p)); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) smoothScrollTo(t.offsetTop - nav.offsetHeight - 16, 1200);
    });
});
