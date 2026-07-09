// Custom cursor - FASTER RESPONSE
const cursorTrail = document.querySelector('.cursor-trail');
const cursorDot = document.querySelector('.cursor-dot');

let mouseX = 0;
let mouseY = 0;

// Update cursor position - IMMEDIATE
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update both immediately - NO SMOOTHING
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    
    cursorTrail.style.left = mouseX - 10 + 'px';
    cursorTrail.style.top = mouseY - 10 + 'px';
});

// Hover effects
document.addEventListener('mouseover', (e) => {
    if (e.target.matches('button, a, input, .nav-button, .window-close, .lang-btn, .toggle-controls, .player-btn, .player-minimize, .volume-btn, .window-minimize, .album-art-container, .album-zoom-close, .instagram-link, .guide-minimize')) {
        cursorTrail.style.transform = 'scale(1.5)';
        cursorTrail.style.borderColor = '#ffffff';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.matches('button, a, input, .nav-button, .window-close, .lang-btn, .toggle-controls, .player-btn, .player-minimize, .volume-btn, .window-minimize, .album-art-container, .album-zoom-close, .instagram-link, .guide-minimize')) {
        cursorTrail.style.transform = 'scale(1)';
        cursorTrail.style.borderColor = '#888888';
    }
});

// Click effect
document.addEventListener('mousedown', () => {
    cursorTrail.style.transform = 'scale(0.8)';
});

document.addEventListener('mouseup', () => {
    cursorTrail.style.transform = 'scale(1)';
});

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursorTrail.style.opacity = '0';
    cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursorTrail.style.opacity = '1';
    cursorDot.style.opacity = '1';
});