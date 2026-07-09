// Advanced Music Player with Album Art
document.addEventListener('DOMContentLoaded', function() {
    const player = document.getElementById('musicPlayer');
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const minimizeBtn = document.getElementById('playerMinimize');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeBtn = document.getElementById('volumeBtn');
    const waveformCanvas = document.getElementById('waveform');
    const waveformCtx = waveformCanvas.getContext('2d');
    const albumArt = document.getElementById('albumArt');
    
    let isProgressDragging = false;
    let previousVolume = 0.5;
    
    // Initialize
    audio.volume = 0.5;
    drawStaticWaveform();
    
    // Album art error handling
    albumArt.addEventListener('error', () => {
        albumArt.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMkEyQTJBIi8+CjxwYXRoIGQ9Ik02MCA5MEMzMi4zODU4IDkwIDEwIDY3LjYxNDIgMTAgNDBDMTAgMTIuMzg1OCAzMi4zODU4IC0xMCA2MCAtMTBDODcuNjE0MiAtMTAgMTEwIDEyLjM4NTggMTEwIDQwQzExMCA2Ny42MTQyIDg3LjYxNDIgOTAgNjAgOTBaIiBmaWxsPSIjMUExQTFBIi8+CjxwYXRoIGQ9Ik02MCA3MEMzOC45NTQzIDcwIDIyIDUzLjA0NTcgMjIgMzJDMjIgMTAuOTU0MyAzOC45NTQzIC02IDYwIC02QzgxLjA0NTcgLTYgOTggMTAuOTU0MyA5OCAzMkM5OCA1My4wNDU3IDgxLjA0NTcgNzAgNjAgNzBaIiBmaWxsPSIjODg4ODg4Ii8+Cjwvc3ZnPg==';
    });
    
    // Play/Pause
    playBtn.addEventListener('click', () => {
        audio.play().then(() => {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            animateWaveform();
            rotateAlbumArt(true);
        }).catch(err => {
            console.error('Playback error:', err);
            audio.load();
            setTimeout(() => {
                audio.play().catch(e => {
                    alert('Müzik dosyası bulunamadı veya oynatılamadı.');
                });
            }, 100);
        });
    });
    
    pauseBtn.addEventListener('click', () => {
        audio.pause();
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'flex';
        rotateAlbumArt(false);
    });
    
    restartBtn.addEventListener('click', () => {
        audio.currentTime = 0;
        if (!audio.paused) {
            audio.play();
        }
    });
    
    // Album art rotation
    let rotationAnimation;
    function rotateAlbumArt(play) {
        if (play) {
            let rotation = 0;
            rotationAnimation = setInterval(() => {
                rotation += 0.5;
                albumArt.style.transform = `rotate(${rotation}deg)`;
            }, 50);
        } else {
            clearInterval(rotationAnimation);
        }
    }
    
    // Time update
    audio.addEventListener('loadedmetadata', () => {
        updateTimeDisplay();
    });
    
    audio.addEventListener('timeupdate', () => {
        if (!isProgressDragging && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            updateTimeDisplay();
        }
    });
    
    function updateTimeDisplay() {
        const currentTime = formatTime(audio.currentTime);
        const totalTime = formatTime(audio.duration || 0);
        document.querySelector('.time-current').textContent = currentTime;
        document.querySelector('.time-total').textContent = totalTime;
    }
    
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }
    
    // Progress bar interaction
    progressBar.addEventListener('mousedown', (e) => {
        isProgressDragging = true;
        updateProgress(e);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isProgressDragging) {
            updateProgress(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isProgressDragging = false;
    });
    
    progressBar.addEventListener('click', (e) => {
        if (!isProgressDragging) {
            updateProgress(e);
        }
    });
    
    function updateProgress(e) {
        if (audio.duration) {
            const rect = progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audio.currentTime = percent * audio.duration;
            progressFill.style.width = `${percent * 100}%`;
        }
    }
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value / 100;
        audio.volume = value;
        updateVolumeIcon(value);
        document.querySelector('.volume-value').textContent = `${Math.round(value * 100)}%`;
    });
    
    volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
            previousVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
        } else {
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume * 100;
        }
        updateVolumeIcon(audio.volume);
        document.querySelector('.volume-value').textContent = `${Math.round(audio.volume * 100)}%`;
    });
    
    function updateVolumeIcon(volume) {
        const svg = volumeBtn.querySelector('svg');
        if (volume === 0) {
            svg.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else if (volume < 0.5) {
            svg.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
        } else {
            svg.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }
    
    // Minimize/Maximize
    minimizeBtn.addEventListener('click', () => {
        player.classList.toggle('minimized');
        minimizeBtn.textContent = player.classList.contains('minimized') ? '□' : '−';
    });
    
    // Waveform visualization
    function drawStaticWaveform() {
        const width = waveformCanvas.width;
        const height = waveformCanvas.height;
        const barWidth = 3;
        const barGap = 2;
        const barCount = Math.floor(width / (barWidth + barGap));
        
        waveformCtx.clearRect(0, 0, width, height);
        waveformCtx.fillStyle = 'rgba(136, 136, 136, 0.3)';
        
        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + barGap);
            const barHeight = Math.random() * height * 0.7 + height * 0.1;
            const y = (height - barHeight) / 2;
            waveformCtx.fillRect(x, y, barWidth, barHeight);
        }
    }
    
    let animationId;
    function animateWaveform() {
        if (audio.paused) {
            cancelAnimationFrame(animationId);
            drawStaticWaveform();
            return;
        }
        
        const width = waveformCanvas.width;
        const height = waveformCanvas.height;
        const barWidth = 3;
        const barGap = 2;
        const barCount = Math.floor(width / (barWidth + barGap));
        
        waveformCtx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + barGap);
            const barHeight = Math.sin(Date.now() * 0.001 + i * 0.5) * height * 0.3 + height * 0.4;
            const y = (height - barHeight) / 2;
            
            const progress = audio.currentTime / audio.duration;
            const barProgress = i / barCount;
            
            if (barProgress <= progress) {
                waveformCtx.fillStyle = 'rgba(170, 170, 170, 0.8)';
            } else {
                waveformCtx.fillStyle = 'rgba(136, 136, 136, 0.3)';
            }
            
            waveformCtx.fillRect(x, y, barWidth, barHeight);
        }
        
        animationId = requestAnimationFrame(animateWaveform);
    }
    
    // Audio events
    audio.addEventListener('ended', () => {
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'flex';
        progressFill.style.width = '0%';
        cancelAnimationFrame(animationId);
        drawStaticWaveform();
        rotateAlbumArt(false);
    });
    
    audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        console.log('Trying to load audio file from:', audio.src);
    });
    
    // Album Art Zoom Feature
    const albumArtContainer = document.querySelector('.album-art-container');
    const albumZoomModal = document.getElementById('albumZoomModal');
    const albumZoomClose = document.getElementById('albumZoomClose');
    const albumZoomImg = document.getElementById('albumZoomImg');
    
    // Open zoom modal
    albumArtContainer.addEventListener('click', () => {
        albumZoomModal.classList.add('active');
        // Sync image source
        albumZoomImg.src = albumArt.src;
    });
    
    // Close zoom modal
    albumZoomClose.addEventListener('click', () => {
        albumZoomModal.classList.remove('active');
    });
    
    // Close on background click
    albumZoomModal.addEventListener('click', (e) => {
        if (e.target === albumZoomModal) {
            albumZoomModal.classList.remove('active');
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && albumZoomModal.classList.contains('active')) {
            albumZoomModal.classList.remove('active');
        }
    });
    
    // LYRICS FUNCTIONALITY - FIXED
    const lyricsBtn = document.getElementById('lyricsBtn');
    const lyricsWindow = document.getElementById('lyricsWindow');
    const lyricsClose = document.getElementById('lyricsClose');
    const lyricsMinimize = document.getElementById('lyricsMinimize');
    
    // Open lyrics window
    if (lyricsBtn) {
        lyricsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            lyricsWindow.classList.add('active');
        });
    }
    
    // Close lyrics window
    if (lyricsClose) {
        lyricsClose.addEventListener('click', () => {
            lyricsWindow.classList.remove('active');
        });
    }
    
    // Minimize lyrics window
    if (lyricsMinimize) {
        lyricsMinimize.addEventListener('click', () => {
            lyricsWindow.classList.toggle('minimized');
            lyricsMinimize.textContent = lyricsWindow.classList.contains('minimized') ? '□' : '−';
        });
    }
    
    // Close lyrics on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lyricsWindow.classList.contains('active')) {
            lyricsWindow.classList.remove('active');
        }
    });
});