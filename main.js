import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

// Performance settings
const PERFORMANCE = {
    shadowMapSize: 512,
    pixelRatio: Math.min(window.devicePixelRatio, 1.25),
    antialias: window.devicePixelRatio <= 1.25,
    powerPreference: "high-performance"
};

// Language translations - UPDATED
const translations = {
    tr: {
        // Controls
        controls: 'Işık Kontrolleri',
        ouroboros: 'Uzaylı Ouroboros',
        skull: 'Kurukafa',
        hourglass: 'Kum Saati',
        galaxy: 'Galaksi',
        global: 'Genel Işık',
        
        // Navigation
        contact: 'morieris.',
        about: 'vives.',
        projects: 'memento',
        
        // Window titles
        contactTitle: 'Solus morieris',
        aboutTitle: 'Solus vives',
        projectsTitle: 'Memento, mori debes',
        
        // Window content
        contactContent: 'Yalnız öleceksin.<br><br>Zamanın kumu akarken, her an seni sona yaklaştırıyor.',
        aboutContent: 'Yalnız yaşayacaksın.<br><br>DNA\'nın sarmalında kodlanmış hayat, senin hikayeni yazıyor.',
        projectsContent: 'Unutma, ölmelisin.<br><br>Evrenin sonsuzluğunda, varlığın sadece bir an.',
        
        // Music player
        nowPlaying: 'ŞİMDİ ÇALIYOR',
        lyrics: 'Şarkı Sözleri',
        lyricsTitle: 'You Must Die - Şarkı Sözleri',
        
        // Mouse guide
        mouseGuide: 'Mouse Kullanımı',
        leftClick: 'Sol Tık:',
        leftClickDesc: 'Tıklama/Döndürme',
        rightClick: 'Sağ Tık:',
        rightClickDesc: 'Merkez Değiştirme',
        scroll: 'Scroll:',
        scrollDesc: 'Yakınlaştır/Uzaklaştır'
    },
    en: {
        // Controls
        controls: 'Light Controls',
        ouroboros: 'Alien Ouroboros',
        skull: 'Skull',
        hourglass: 'Hourglass',
        galaxy: 'Galaxy',
        global: 'Global Light',
        
        // Navigation
        contact: 'morieris.',
        about: 'vives.',
        projects: 'memento',
        
        // Window titles
        contactTitle: 'Solus morieris',
        aboutTitle: 'Solus vives',
        projectsTitle: 'Memento, mori debes',
        
        // Window content
        contactContent: 'You will die alone.<br><br>As the sands of time flow, each moment brings you closer to the end.',
        aboutContent: 'You will live alone.<br><br>Life, encoded in the helix of DNA, writes your story.',
        projectsContent: 'Remember, you must die.<br><br>In the infinity of the universe, your existence is just a moment.',
        
        // Music player
        nowPlaying: 'NOW PLAYING',
        lyrics: 'Lyrics',
        lyricsTitle: 'You Must Die - Lyrics',
        
        // Mouse guide
        mouseGuide: 'Mouse Controls',
        leftClick: 'Left Click:',
        leftClickDesc: 'Click/Rotate',
        rightClick: 'Right Click:',
        rightClickDesc: 'Change of Center',
        scroll: 'Scroll:',
        scrollDesc: 'Zoom In/Out'
    }
};

let currentLang = 'tr';

// Navigation configuration
const NAV_RADIUS = 350;

// POSITIONS AND SETTINGS
const POSITIONS = {
    DNA: { x: 2, y: 0.4, z: -1.1 },
    HOURGLASS: { x: 2, y: 0.3, z: 1.5 },
    GALAXY: { x: 1, y: -1.5, z: 0.5 }
};

const ROTATIONS = {
    DNA: { x: Math.PI / 2, y: 0, z: 0.1 },
    HOURGLASS: { x: -0.2, y: 0, z: 0.1 },
    GALAXY: { x: -0.3, y: 10, z: 0 }
};

const SCALES = {
    DNA: 1.8,
    HOURGLASS: 0.9,
    GALAXY: 6,
    OUROBOROS: 18,
    SKULL: 9
};

const ANIMATIONS = {
    OUROBOROS: { enabled: true, axis: 'x', speed: 0.005 },
    SKULL: { enabled: false, axis: 'y', speed: 0.003 },
    DNA: { enabled: true, axis: 'y', speed: 0.01 },
    HOURGLASS: { enabled: true, axis: 'z', speed: 0.008 },
    GALAXY: { 
        enabled: true, 
        axis: 'all',
        speedX: 0.003,
        speedY: 0.002,
        speedZ: 0.001
    }
};

// Material brightness
const BRIGHTNESS = {
    OUROBOROS: 1,
    SKULL: 1,
    DNA: 1,
    HOURGLASS: 1,
    GALAXY: 1,
    GLOBAL: 1
};

// Variables
let scene, camera, renderer, controls;
let ouroboros, dna, hourglass, galaxy;
let galaxyContainer;
let skullClosed, skullHalf, skullWide;
let currentSkull = null;
const CRITICAL_MODEL_COUNT = 2;
let criticalModelsLoaded = 0;
let currentSection = null;
let isZoomedIn = false;
let isGalaxyWindowOpen = false;
let deferredLoadsScheduled = false;

// Original materials storage
const originalMaterials = new WeakMap();
const gltfLoader = new GLTFLoader();
const modelLoadPromises = new Map();

// Animation cleanup
let currentAnimations = [];

// Animation frame ID for performance
let animationFrameId;

init();

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
        camera.position.set(0, 0, 35);
    camera.lookAt(0, 0, 0);
    
    // Renderer with performance settings
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: PERFORMANCE.antialias,
        alpha: false,
        powerPreference: PERFORMANCE.powerPreference
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(PERFORMANCE.pixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    
    // Controls - ZOOM ENABLED
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.2;
    
    // Setup
    setupLights();
    updateNavButtonPositions();
    loadModels();
    setupUI();
    setupBrightnessControls();
    setupLanguageSwitcher();
    setupMouseGuide();
    
    // Window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(onWindowResize, 200);
    });
    
    // Start animation
    animate();
}

function setupLights() {
    // Simplified lighting for performance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = PERFORMANCE.shadowMapSize;
    keyLight.shadow.mapSize.height = PERFORMANCE.shadowMapSize;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.6);
    fillLight.position.set(-10, 5, -5);
    scene.add(fillLight);
}

function cleanupCurrentAnimations() {
    currentAnimations.forEach(anim => {
        if (anim && anim.kill) {
            anim.kill();
        }
    });
    currentAnimations = [];
}

function loadOnce(key, executor) {
    if (!modelLoadPromises.has(key)) {
        const task = executor().catch((error) => {
            modelLoadPromises.delete(key);
            throw error;
        });
        modelLoadPromises.set(key, task);
    }
    
    return modelLoadPromises.get(key);
}

function loadGLTF(path) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(path, resolve, undefined, reject);
    });
}

function updateCriticalProgress() {
    criticalModelsLoaded += 1;
    const progress = Math.min((criticalModelsLoaded / CRITICAL_MODEL_COUNT) * 100, 100);
    
    if (window.updateLoaderProgress) {
        window.updateLoaderProgress(progress);
    }
}

function revealScene() {
    const loader = document.getElementById('loader');
    if (!loader || loader.classList.contains('hidden')) {
        return;
    }
    
    setTimeout(() => {
        loader.classList.add('hidden');
        renderer.shadowMap.needsUpdate = true;
    }, 200);
}

function scheduleDeferredModelLoads() {
    if (deferredLoadsScheduled) {
        return;
    }
    
    deferredLoadsScheduled = true;
    const loadDeferredModels = () => {
        loadOtherModels();
        loadSkullModel('models/skull_half_wide.glb', 'half');
        loadSkullModel('models/skull_wide.glb', 'wide');
    };
    
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadDeferredModels, { timeout: 1500 });
        return;
    }
    
    setTimeout(loadDeferredModels, 400);
}

function loadModels() {
    setTimeout(() => {
        revealScene();
    }, 800);

    const criticalLoads = [
        loadOuroboros().finally(() => {
            updateCriticalProgress();
        }),
        loadSkullModel('models/skull_closed.glb', 'closed').finally(() => {
            updateCriticalProgress();
        })
    ];
    
    Promise.allSettled(criticalLoads).finally(() => {
        revealScene();
        scheduleDeferredModelLoads();
    });
}

function loadOuroboros() {
    return loadOnce('ouroboros', async () => {
        const gltf = await loadGLTF('models/oroborus.glb');
        ouroboros = gltf.scene;
        setupModel(ouroboros, SCALES.OUROBOROS);
        scene.add(ouroboros);
        updateNavButtonPositions();
        return ouroboros;
    }).catch((error) => {
        console.error('Error loading Ouroboros:', error);
        return null;
    });
}

function setupModel(model, scale) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    model.position.sub(center);
    const modelScale = scale / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(modelScale);
    
    // Optimize materials
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.filter(Boolean).forEach((material) => {
                if (!originalMaterials.has(material)) {
                    originalMaterials.set(material, {
                        color: material.color ? material.color.clone() : null,
                        emissive: material.emissive ? material.emissive.clone() : null,
                        emissiveIntensity: material.emissiveIntensity ?? 0
                    });
                }
                
                if ('metalness' in material) {
                    material.metalness = Math.min(material.metalness, 0.5);
                }
                
                if ('roughness' in material) {
                    material.roughness = Math.max(material.roughness, 0.5);
                }
            });
        }
    });
}

function loadSkullModel(path, type) {
    return loadOnce(`skull:${type}`, async () => {
        const gltf = await loadGLTF(path);
        const skull = gltf.scene;
        setupModel(skull, SCALES.SKULL);
        skull.rotation.y = Math.PI / 2;
        skull.position.z = 0.5;
        
        if (type === 'closed') {
            skullClosed = skull;
            currentSkull = skullClosed;
            scene.add(skullClosed);
        } else if (type === 'half') {
            skullHalf = skull;
            skullHalf.visible = false;
            scene.add(skullHalf);
        } else if (type === 'wide') {
            skullWide = skull;
            skullWide.visible = false;
            scene.add(skullWide);
        }
        
        return skull;
    }).catch((error) => {
        console.error(`Error loading ${type} skull:`, error);
        return null;
    });
}

function loadOtherModels() {
    loadDNA();
    loadHourglass();
    loadGalaxy();
}

function loadDNA() {
    return loadOnce('dna', async () => {
        const gltf = await loadGLTF('models/dna.glb');
        dna = gltf.scene;
        setupModel(dna, SCALES.DNA);
        dna.position.set(POSITIONS.DNA.x, POSITIONS.DNA.y, POSITIONS.DNA.z);
        dna.rotation.set(ROTATIONS.DNA.x, ROTATIONS.DNA.y, ROTATIONS.DNA.z);
        scene.add(dna);
        return dna;
    }).catch((error) => {
        console.error('Error loading DNA:', error);
        return null;
    });
}

function loadHourglass() {
    return loadOnce('hourglass', async () => {
        const gltf = await loadGLTF('models/sand_clock.glb');
        hourglass = gltf.scene;
        setupModel(hourglass, SCALES.HOURGLASS);
        hourglass.position.set(POSITIONS.HOURGLASS.x, POSITIONS.HOURGLASS.y, POSITIONS.HOURGLASS.z);
        hourglass.rotation.set(ROTATIONS.HOURGLASS.x, ROTATIONS.HOURGLASS.y, ROTATIONS.HOURGLASS.z);
        scene.add(hourglass);
        return hourglass;
    }).catch((error) => {
        console.error('Error loading Hourglass:', error);
        return null;
    });
}

function loadGalaxy() {
    return loadOnce('galaxy', async () => {
        const gltf = await loadGLTF('models/need_some_space.glb');
        galaxyContainer = new THREE.Group();
        galaxy = gltf.scene;
        setupModel(galaxy, SCALES.GALAXY);
        galaxyContainer.add(galaxy);
        galaxyContainer.position.set(POSITIONS.GALAXY.x, POSITIONS.GALAXY.y, POSITIONS.GALAXY.z);
        galaxyContainer.scale.setScalar(0.01);
        scene.add(galaxyContainer);
        return galaxyContainer;
    }).catch((error) => {
        console.error('Error loading Galaxy:', error);
        return null;
    });
}

function ensureProjectAssets() {
    return Promise.allSettled([
        loadGalaxy(),
        loadSkullModel('models/skull_closed.glb', 'closed'),
        loadSkullModel('models/skull_half_wide.glb', 'half'),
        loadSkullModel('models/skull_wide.glb', 'wide')
    ]);
}

function updateNavButtonPositions() {
    const navButtons = document.querySelectorAll('.nav-button');
    const angleStep = 360 / navButtons.length;
    
    navButtons.forEach((button, index) => {
        const angle = (index * angleStep - 90) * Math.PI / 180;
        const x = Math.cos(angle) * NAV_RADIUS;
        const y = Math.sin(angle) * NAV_RADIUS;
        
        button.style.left = `calc(50% + ${x}px - 30px)`;
        button.style.top = `calc(50% + ${y}px - 30px)`;
    });
}

function setupUI() {
    const navButtons = document.querySelectorAll('.nav-button');
    const windowClose = document.getElementById('windowClose');
    const toggleControls = document.getElementById('toggleControls');
    const controlsContent = document.getElementById('controlsContent');
    
    // Navigation button clicks
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            
            if (currentSection && currentSection !== section) {
                document.getElementById('infoWindow').classList.remove('active');
                if (isZoomedIn && section !== 'projects') {
                    resetCamera();
                }
            }
            
            currentSection = section;
            showInfoWindow(section);
            cleanupCurrentAnimations();
            
            renderer.shadowMap.needsUpdate = true;
            
            if (section === 'contact') {
                loadHourglass();
                animateCameraToHourglass();
            } else if (section === 'about') {
                loadDNA();
                animateCameraToDNA();
            } else if (section === 'projects') {
                isGalaxyWindowOpen = true;
                ensureProjectAssets().then(() => {
                    if (currentSection === 'projects' && isGalaxyWindowOpen) {
                        animateSkullJawAndCameraToGalaxy();
                    }
                });
            }
        });
    });
    
    // Toggle brightness controls
    toggleControls.addEventListener('click', () => {
        const controls = document.getElementById('brightnessControls');
        controls.style.display = 'none';
        setTimeout(() => {
            controls.style.display = '';
        }, 100);
    });
    
    // Close window - UPDATED FOR GALAXY ANIMATION
    windowClose.addEventListener('click', () => {
        document.getElementById('infoWindow').classList.remove('active');
        
        // Special handling for galaxy window
        if (currentSection === 'projects' && isGalaxyWindowOpen) {
            isGalaxyWindowOpen = false;
            animateGalaxyBackToMouth();
        } else if (isZoomedIn) {
            resetCamera();
        }
        
        currentSection = null;
    });
    
    // ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('infoWindow').classList.remove('active');
            document.getElementById('lyricsWindow').classList.remove('active');
            
            // Special handling for galaxy window
            if (currentSection === 'projects' && isGalaxyWindowOpen) {
                isGalaxyWindowOpen = false;
                animateGalaxyBackToMouth();
            } else if (isZoomedIn) {
                resetCamera();
            }
            currentSection = null;
        }
    });
}

// Debounced brightness update
let brightnessTimeout;
function setupBrightnessControls() {
    ['Ouroboros', 'Skull', 'DNA', 'Hourglass', 'Galaxy'].forEach(objName => {
        const slider = document.getElementById(`brightness${objName}`);
        const valueSpan = slider.nextElementSibling;
        
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            valueSpan.textContent = `${value}%`;
            BRIGHTNESS[objName.toUpperCase()] = value / 100;
            
            clearTimeout(brightnessTimeout);
            brightnessTimeout = setTimeout(updateMaterialBrightness, 50);
        });
    });
    
    const globalSlider = document.getElementById('brightnessGlobal');
    const globalValueSpan = globalSlider.nextElementSibling;
    
    globalSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        globalValueSpan.textContent = `${value}%`;
        BRIGHTNESS.GLOBAL = value / 100;
        
        clearTimeout(brightnessTimeout);
        brightnessTimeout = setTimeout(updateMaterialBrightness, 50);
    });
}

function setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateLanguage();
            
            // Update info window if open
            if (currentSection && document.getElementById('infoWindow').classList.contains('active')) {
                showInfoWindow(currentSection);
            }
        });
    });
}

function setupMouseGuide() {
    const guideMinimize = document.getElementById('guideMinimize');
    const mouseGuide = document.getElementById('mouseGuide');
    
    if (guideMinimize) {
        guideMinimize.addEventListener('click', () => {
            mouseGuide.classList.toggle('minimized');
            guideMinimize.textContent = mouseGuide.classList.contains('minimized') ? '□' : '−';
        });
    }
}

function updateLanguage() {
    // Update all elements with data-lang attribute
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
    
    // Update music player now playing text
    const nowPlaying = document.querySelector('.now-playing');
    if (nowPlaying) {
        nowPlaying.textContent = translations[currentLang].nowPlaying;
    }
    
    // Update lyrics button
    const lyricsBtn = document.getElementById('lyricsBtn');
    if (lyricsBtn) {
        lyricsBtn.textContent = translations[currentLang].lyrics;
    }
}

function showInfoWindow(section) {
    const window = document.getElementById('infoWindow');
    const title = document.getElementById('windowTitle');
    const content = document.getElementById('windowContent');
    
    const sections = {
        contact: {
            title: translations[currentLang].contactTitle,
            content: `<p style="font-size: 1.2rem; line-height: 1.8; text-align: center;">${translations[currentLang].contactContent}</p>`
        },
        about: {
            title: translations[currentLang].aboutTitle,
            content: `<p style="font-size: 1.2rem; line-height: 1.8; text-align: center;">${translations[currentLang].aboutContent}</p>`
        },
        projects: {
            title: translations[currentLang].projectsTitle,
            content: `<p style="font-size: 1.2rem; line-height: 1.8; text-align: center;">${translations[currentLang].projectsContent}</p>`
        }
    };
    
    title.textContent = sections[section].title;
    content.innerHTML = sections[section].content;
    window.classList.add('active');
}

function updateMaterialBrightness() {
    const updateObjectBrightness = (object, brightnessKey) => {
        if (!object) return;
        
        object.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.filter(Boolean).forEach((material) => {
                    const original = originalMaterials.get(material);
                    if (!original) {
                        return;
                    }
                    
                    if (material.color && original.color) {
                        material.color.copy(original.color);
                        material.color.multiplyScalar(BRIGHTNESS[brightnessKey] * BRIGHTNESS.GLOBAL);
                    }
                    
                    if (material.emissive && original.emissive) {
                        material.emissive.copy(original.emissive);
                        material.emissiveIntensity = original.emissiveIntensity * BRIGHTNESS[brightnessKey] * BRIGHTNESS.GLOBAL;
                    }
                    
                    material.needsUpdate = true;
                });
            }
        });
    };
    
    updateObjectBrightness(ouroboros, 'OUROBOROS');
    updateObjectBrightness(currentSkull, 'SKULL');
    updateObjectBrightness(dna, 'DNA');
    updateObjectBrightness(hourglass, 'HOURGLASS');
    updateObjectBrightness(galaxyContainer, 'GALAXY');
}

function animateCameraToHourglass() {
    isZoomedIn = true;
    controls.autoRotate = false;
    
    const targetPosition = {
        x: POSITIONS.HOURGLASS.x + 6,
        y: POSITIONS.HOURGLASS.y,
        z: POSITIONS.HOURGLASS.z + 8
    };
    
    const anim1 = gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2.5,
        ease: "power2.inOut"
    });
    
    const anim2 = gsap.to(controls.target, {
        x: POSITIONS.HOURGLASS.x,
        y: POSITIONS.HOURGLASS.y,
        z: POSITIONS.HOURGLASS.z,
        duration: 2.5,
        ease: "power2.inOut"
    });
    
    currentAnimations.push(anim1, anim2);
}

function animateCameraToDNA() {
    isZoomedIn = true;
    controls.autoRotate = false;
    
    const targetPosition = {
        x: POSITIONS.DNA.x + 6,
        y: POSITIONS.DNA.y,
        z: POSITIONS.DNA.z - 8
    };
    
    const anim1 = gsap.to(camera.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 2.5,
        ease: "power2.inOut"
    });
    
    const anim2 = gsap.to(controls.target, {
        x: POSITIONS.DNA.x,
        y: POSITIONS.DNA.y,
        z: POSITIONS.DNA.z,
        duration: 2.5,
        ease: "power2.inOut"
    });
    
    currentAnimations.push(anim1, anim2);
}

function animateSkullJawAndCameraToGalaxy() {
    isZoomedIn = true;
    controls.autoRotate = false;
    
    const jawFocusPosition = {
        x: 10,
        y: -2,
        z: 0
    };
    
    const anim1 = gsap.to(camera.position, {
        x: jawFocusPosition.x,
        y: jawFocusPosition.y,
        z: jawFocusPosition.z,
        duration: 2,
        ease: "power2.inOut",
        onComplete: () => {
            if (galaxyContainer) {
                const galaxyMove = gsap.to(galaxyContainer.position, {
                    x: 8,
                    y: -2,
                    z: 0,
                    duration: 2,
                    ease: "power2.out"
                });
                currentAnimations.push(galaxyMove);
                
                const galaxyAnim1 = gsap.to(galaxyContainer.scale, {
                    x: 0.2,
                    y: 0.2,
                    z: 0.2,
                    duration: 0.6,
                    ease: "power2.out"
                });
                currentAnimations.push(galaxyAnim1);
            }
            
            setTimeout(() => {
                if (skullClosed && skullHalf) {
                    skullClosed.visible = false;
                    skullHalf.visible = true;
                    currentSkull = skullHalf;
                    
                    if (galaxyContainer) {
                        const galaxyAnim2 = gsap.to(galaxyContainer.scale, {
                            x: 0.3,
                            y: 0.3,
                            z: 0.3,
                            duration: 0.6,
                            ease: "power2.out"
                        });
                        currentAnimations.push(galaxyAnim2);
                    }
                }
                
                setTimeout(() => {
                    if (skullHalf && skullWide) {
                        skullHalf.visible = false;
                        skullWide.visible = true;
                        currentSkull = skullWide;
                        
                        if (galaxyContainer) {
                            const galaxyAnim3 = gsap.to(galaxyContainer.scale, {
                                x: 0.4,
                                y: 0.4,
                                z: 0.4,
                                duration: 0.6,
                                ease: "power2.out"
                            });
                            currentAnimations.push(galaxyAnim3);
                        }
                        
                        if (galaxy && ANIMATIONS.GALAXY.enabled) {
                            ANIMATIONS.GALAXY.speedX = 0.01;
                            ANIMATIONS.GALAXY.speedY = 0.008;
                            ANIMATIONS.GALAXY.speedZ = 0.006;
                        }
                    }
                }, 600);
            }, 300);
        }
    });
    
    const anim2 = gsap.to(controls.target, {
        x: 0,
        y: -2,
        z: 0,
        duration: 2,
        ease: "power2.inOut"
    });
    
    currentAnimations.push(anim1, anim2);
}

// NEW FUNCTION - Animate galaxy back into mouth
function animateGalaxyBackToMouth() {
    cleanupCurrentAnimations();
    
    if (galaxyContainer) {
        // First shrink the galaxy
        const shrinkAnim = gsap.to(galaxyContainer.scale, {
            x: 0.01,
            y: 0.01,
            z: 0.01,
            duration: 1.5,
            ease: "power2.in"
        });
        currentAnimations.push(shrinkAnim);
        
        // Move galaxy back to mouth position
        const moveAnim = gsap.to(galaxyContainer.position, {
            x: 0,
            y: -2,
            z: 0,
            duration: 1.5,
            ease: "power2.in",
            onComplete: () => {
                // Close the jaw sequentially
                if (skullWide && skullHalf) {
                    skullWide.visible = false;
                    skullHalf.visible = true;
                    currentSkull = skullHalf;
                    
                    setTimeout(() => {
                        if (skullHalf && skullClosed) {
                            skullHalf.visible = false;
                            skullClosed.visible = true;
                            currentSkull = skullClosed;
                        }
                    }, 300);
                }
                
                // Reset galaxy position and rotation speed
                galaxyContainer.position.set(POSITIONS.GALAXY.x, POSITIONS.GALAXY.y, POSITIONS.GALAXY.z);
                if (ANIMATIONS.GALAXY.enabled) {
                    ANIMATIONS.GALAXY.speedX = 0.003;
                    ANIMATIONS.GALAXY.speedY = 0.002;
                    ANIMATIONS.GALAXY.speedZ = 0.001;
                }
                
                // Reset camera
                resetCamera();
            }
        });
        currentAnimations.push(moveAnim);
    }
}

function resetCamera() {
    isZoomedIn = false;
    controls.autoRotate = true;
    
    const resetAnim1 = gsap.to(camera.position, {
        x: 0, y: 0, z: 35,
        duration: 2,
        ease: "power2.inOut"
    });
    
    const resetAnim2 = gsap.to(controls.target, {
        x: 0, y: 0, z: 0,
        duration: 2,
        ease: "power2.inOut"
    });
    
    currentAnimations.push(resetAnim1, resetAnim2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Optimized animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    controls.update();
    
    // Animations
    if (ouroboros && ANIMATIONS.OUROBOROS.enabled) {
        ouroboros.rotation[ANIMATIONS.OUROBOROS.axis] += ANIMATIONS.OUROBOROS.speed;
        
        const nav = document.getElementById('ouroborosNav');
        if (nav) {
            nav.style.transform = `translate(-50%, -50%) rotate(${-ouroboros.rotation.x * 180 / Math.PI}deg)`;
        }
    }
    
    if (currentSkull && ANIMATIONS.SKULL.enabled) {
        currentSkull.rotation[ANIMATIONS.SKULL.axis] += ANIMATIONS.SKULL.speed;
    }
    
    if (dna && ANIMATIONS.DNA.enabled) {
        dna.rotation[ANIMATIONS.DNA.axis] += ANIMATIONS.DNA.speed;
    }
    
    if (hourglass && ANIMATIONS.HOURGLASS.enabled) {
        hourglass.rotation[ANIMATIONS.HOURGLASS.axis] += ANIMATIONS.HOURGLASS.speed;
    }
    
    if (galaxy && ANIMATIONS.GALAXY.enabled) {
        galaxy.rotation.x += ANIMATIONS.GALAXY.speedX;
        galaxy.rotation.y += ANIMATIONS.GALAXY.speedY;
        galaxy.rotation.z += ANIMATIONS.GALAXY.speedZ;
    }
    
    renderer.render(scene, camera);
}

// Initialize language on load
window.addEventListener('load', () => {
    updateLanguage();
});
