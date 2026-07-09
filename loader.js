import * as THREE from 'three';

// Create rotating loader animation
function createLoaderAnimation() {
    const canvas = document.getElementById('loaderCanvas');
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(200, 200);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    
    // Create rotating ring
    const geometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x888888,
        wireframe: true
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    
    // Create inner rotating element
    const innerGeometry = new THREE.OctahedronGeometry(1, 0);
    const innerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        wireframe: true
    });
    const inner = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(inner);
    
    function animate() {
        requestAnimationFrame(animate);
        torus.rotation.x += 0.01;
        torus.rotation.y += 0.01;
        inner.rotation.x -= 0.02;
        inner.rotation.z += 0.02;
        renderer.render(scene, camera);
    }
    
    animate();
}

// Update progress
window.updateLoaderProgress = function(progress) {
    const progressFill = document.querySelector('#loader .progress-fill');
    const progressText = document.querySelector('#loader .progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }
};

// Start loader animation
createLoaderAnimation();
