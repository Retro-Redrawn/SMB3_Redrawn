class AudioPlayer {
    updateTrackInfo() {
        this.trackTitleElement.textContent = this.trackTitle;
        this.trackArtistElement.textContent = this.trackArtist;
        
        // Get elements within this player's container
        const trackInfo = this.element.querySelector('.track-info');
        const container = this.element.querySelector('.track-info-container');
        
        // Wait for next frame to ensure text width is calculated
        requestAnimationFrame(() => {
            // Force reflow to ensure accurate measurements
            void trackInfo.offsetWidth;
            
            // Check if content needs to scroll
            const contentWidth = trackInfo.offsetWidth;
            const containerWidth = container.offsetWidth;
            
            if (contentWidth > containerWidth) {
                trackInfo.classList.add('scrolling');
            } else {
                trackInfo.classList.remove('scrolling');
            }
        });
    }

    constructor(element) {
        if (!element) throw new Error('Player element is required');
        
        this.element = element;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        
        this.introBuffer = null;
        this.loopBuffer = null;
        this.currentSource = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.isIntroPlaying = false;
        
        // Get player number from HTML data attribute, default to 0 if not specified
        this.playerNum = parseInt(element.dataset.playerNum || '0', 10);
        
        // Get elements within this player's container
        this.playPauseBtn = element.querySelector('.control-btn[data-control="play-pause"]');
        this.restartBtn = element.querySelector('.control-btn[data-control="restart"]');
        this.progressBar = element.querySelector('.progress');
        this.timeDisplay = element.querySelector('.time-display');
        this.progressContainer = element.querySelector('.progress-bar');
        this.trackTitleElement = element.querySelector('.track-title');
        this.trackArtistElement = element.querySelector('.track-artist');
        
        // Track information
        this.trackTitle = AUDIO_TRACKS[this.playerNum].title;
        this.trackArtist = AUDIO_TRACKS[this.playerNum].artist;
        
        this.setupEventListeners();
        this.loadAudio();
        this.updateTrackInfo();
    }
    
    async loadAudio() {
        try {
            // Always load the main loop audio
            const loopResponse = await fetch(AUDIO_TRACKS[this.playerNum].audio);
            const loopArrayBuffer = await loopResponse.arrayBuffer();
            this.loopBuffer = await this.audioContext.decodeAudioData(loopArrayBuffer);
            
            // Try to load intro if it exists
            if (AUDIO_TRACKS[this.playerNum].audio_intro) {
                try {
                    const introResponse = await fetch(AUDIO_TRACKS[this.playerNum].audio_intro);
                    const introArrayBuffer = await introResponse.arrayBuffer();
                    this.introBuffer = await this.audioContext.decodeAudioData(introArrayBuffer);
                } catch (introError) {
                    console.log('No intro audio available, using loop only');
                    this.introBuffer = null;
                }
            }
            
            // Only auto-play if data-autoplay is true
            if (this.element.dataset.autoplay === 'true') {
                this.play();
            }
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }
    
    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.restartBtn.addEventListener('click', () => this.restart());
        
        this.progressContainer.addEventListener('click', (e) => {
            const rect = this.progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.seek(pos);
        });
        
        // Update progress bar
        setInterval(() => this.updateProgress(), 50);
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    play() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const offset = this.pauseTime;
        const currentBuffer = this.isIntroPlaying ? this.introBuffer : this.loopBuffer;
        
        // Ensure offset is within valid range
        if (offset >= (currentBuffer?.duration || 0)) {
            this.pauseTime = 0;
        }
        
        // If we have an intro and we're either playing it or starting fresh
        if (this.introBuffer && (this.isIntroPlaying || this.pauseTime === 0)) {
            this.playIntro(this.isIntroPlaying ? this.pauseTime : 0);
        } else {
            // No intro or continuing with loop
            this.playLoop(this.pauseTime);
        }
        
        this.startTime = this.audioContext.currentTime - this.pauseTime;
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<span class="material-icons">pause</span>';
    }
    
    stopCurrentSource() {
        if (this.currentSource) {
            try {
                this.currentSource.onended = null; // Remove the event listener
                this.currentSource.stop();
                this.currentSource.disconnect();
            } catch (e) {
                // Ignore errors if source was already stopped
            }
            this.currentSource = null;
        }
    }

    playIntro(offset = 0) {
        this.stopCurrentSource();
        
        // If seeking very close to the end, just skip to loop
        if (offset >= this.introBuffer.duration - 0.1) {
            this.isIntroPlaying = false;
            this.startTime = this.audioContext.currentTime;
            this.pauseTime = 0;
            this.playLoop(0);
            return;
        }

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.introBuffer;
        this.currentSource.connect(this.gainNode);
        
        this.isIntroPlaying = true;
        this.currentSource.start(0, offset);
        
        // When intro ends, start the loop
        this.currentSource.onended = () => {
            if (this.isPlaying) {  // Only transition if still playing
                this.stopCurrentSource(); // Clean up before starting loop
                this.isIntroPlaying = false;
                this.startTime = this.audioContext.currentTime; // Reset time for loop
                this.pauseTime = 0;
                this.playLoop(0);
            }
        };
    }
    
    playLoop(offset = 0) {
        this.stopCurrentSource();
        
        // If seeking very close to the end, wrap to beginning
        offset = offset % this.loopBuffer.duration;
        
        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.loopBuffer;
        this.currentSource.loop = true;
        this.currentSource.connect(this.gainNode);
        
        this.currentSource.start(0, offset);
    }
    
    pause() {
        if (this.currentSource) {
            const currentTime = this.audioContext.currentTime - this.startTime;
            const currentBuffer = this.isIntroPlaying ? this.introBuffer : this.loopBuffer;
            
            // Calculate correct pause time within the current buffer
            this.pauseTime = currentTime % currentBuffer.duration;
            
            this.stopCurrentSource();
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        }
    }
    
    restart() {
        this.pauseTime = 0;
        this.isIntroPlaying = false;
        this.play();
    }
    
    seek(pos) {
        const currentBuffer = this.isIntroPlaying ? this.introBuffer : this.loopBuffer;
        // Calculate pause time based on the current section's duration
        this.pauseTime = pos * currentBuffer.duration;
        
        if (this.isIntroPlaying && this.introBuffer && this.pauseTime >= this.introBuffer.duration) {
            // If we're in intro and seek past it, switch to loop
            this.isIntroPlaying = false;
            this.pauseTime = 0;
        }
        
        if (this.isPlaying) {
            this.play();
        } else {
            // Update visuals even when paused
            this.updateProgressVisuals(this.pauseTime);
        }
    }
    
    updateProgressVisuals(time) {
        const currentBuffer = this.isIntroPlaying ? this.introBuffer : this.loopBuffer;
        if (!currentBuffer) return;
        
        // Show progress relative to current section only
        const progress = (time / currentBuffer.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Update time display
        const timeInSeconds = Math.floor(time);
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        if (!this.isPlaying) return;
        
        const currentTime = this.audioContext.currentTime - this.startTime;
        let effectiveTime;
        
        if (this.isIntroPlaying && this.introBuffer) {
            effectiveTime = currentTime;
            if (effectiveTime >= this.introBuffer.duration) {
                this.isIntroPlaying = false;
                effectiveTime = 0;
            }
        } else {
            effectiveTime = currentTime % this.loopBuffer.duration;
        }
        
        this.updateProgressVisuals(effectiveTime);
    }
}

// Initialize all audio players when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Initialize all players on the page
    const playerElements = document.querySelectorAll('.custom-player');
    window.audioPlayers = Array.from(playerElements).map(element => new AudioPlayer(element));
});
