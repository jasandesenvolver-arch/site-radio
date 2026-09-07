/**
 * RÁDIO STUDIO FM & MIX DIGITAL 2026 - CONTROLLER & AUDIO CORE
 */
(function () {
    'use strict';

    // State
    let currentIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let currentVolume = 0.8;
    let aveeEngine = null;

    // Audio Object
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'none';
    audio.volume = currentVolume;

    // DOM References
    const btnMainPlay = document.getElementById('btnMainPlay');
    const mainPlayIcon = document.getElementById('mainPlayIcon');
    const btnPrevStation = document.getElementById('btnPrevStation');
    const btnNextStation = document.getElementById('btnNextStation');
    const btnVolumeMute = document.getElementById('btnVolumeMute');
    const volIcon = document.getElementById('volIcon');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeProgress = document.getElementById('volumeProgress');
    const volumeNum = document.getElementById('volumeNum');

    const currentStationTitle = document.getElementById('currentStationTitle');
    const currentStationGenre = document.getElementById('currentStationGenre');
    const currentTrackName = document.getElementById('currentTrackName');
    const coverDisc = document.getElementById('coverDisc');
    const stationsGrid = document.getElementById('stationsGrid');
    const genreFilters = document.getElementById('genreFilters');

    const miniBarPlayer = document.getElementById('miniBarPlayer');
    const miniTitle = document.getElementById('miniTitle');
    const miniGenre = document.getElementById('miniGenre');
    const miniBtnPlay = document.getElementById('miniBtnPlay');
    const miniPlayIcon = document.getElementById('miniPlayIcon');
    const miniBtnPrev = document.getElementById('miniBtnPrev');
    const miniBtnNext = document.getElementById('miniBtnNext');

    const spectrumTabs = document.getElementById('spectrumTabs');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnBassPulse = document.getElementById('btnBassPulse');
    const songRequestForm = document.getElementById('songRequestForm');
    const formFeedback = document.getElementById('formFeedback');

    // Initialize Avee Engine
    function initVisualizer() {
        aveeEngine = new AveeVisualizer('aveeCanvas', 'miniVisualizer');
    }

    // Render Stations Grid
    function renderStations(filter = 'all') {
        stationsGrid.innerHTML = '';
        const filtered = filter === 'all' ? STATIONS : STATIONS.filter(s => s.genre === filter);

        filtered.forEach((st) => {
            const actualIndex = STATIONS.findIndex(s => s.id === st.id);
            const isCurrent = actualIndex === currentIndex;
            const isFavorited = localStorage.getItem('fav_' + st.id) === 'true';

            const card = document.createElement('div');
            card.className = 'station-card' + (isCurrent && isPlaying ? ' playing' : '');
            card.dataset.index = actualIndex;

            card.innerHTML = `
                <div class="card-top">
                    <div class="card-icon-wrap" style="background: linear-gradient(135deg, ${st.color}, ${st.colorEnd});">
                        <i class="${st.icon}"></i>
                    </div>
                    <button class="card-fav-btn ${isFavorited ? 'favorited' : ''}" data-id="${st.id}" title="Favoritar">
                        <i class="fa-${isFavorited ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-info">
                    <div class="card-genre">${st.genreLabel}</div>
                    <h3>${st.name}</h3>
                    <p class="card-desc">${st.description}</p>
                </div>
                <div class="card-footer-action">
                    <span class="card-play-label">
                        <i class="fa-solid fa-signal"></i> 320k HD Audio
                    </span>
                    <div class="card-play-btn-circle">
                        <i class="fa-solid ${isCurrent && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </div>
                </div>
            `;

            // Card click to play
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-fav-btn')) return;
                loadAndPlayStation(actualIndex);
            });

            // Favorite toggle
            const favBtn = card.querySelector('.card-fav-btn');
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const favState = localStorage.getItem('fav_' + st.id) === 'true';
                localStorage.setItem('fav_' + st.id, (!favState).toString());
                renderStations(document.querySelector('.pill-btn.active').dataset.filter);
            });

            stationsGrid.appendChild(card);
        });
    }

    // Load & Play Station
    function loadAndPlayStation(index) {
        if (index < 0 || index >= STATIONS.length) return;
        currentIndex = index;
        const st = STATIONS[index];

        audio.src = st.url;
        currentStationTitle.textContent = st.name;
        currentStationGenre.innerHTML = '<i class="' + st.icon + '"></i> ' + st.genreLabel;
        currentTrackName.innerHTML = '<i class="fa-solid fa-headphones"></i> ' + st.track;
        updateMediaSession(st);

        miniTitle.textContent = st.name;
        miniGenre.textContent = st.genreLabel;

        playStream();
        renderStations(document.querySelector('.pill-btn.active').dataset.filter);
    }

    function playStream() {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayUI(true);
            aveeEngine.attachAudio(audio);
            aveeEngine.start();
        }).catch(() => {
            // Try fallback url
            const st = STATIONS[currentIndex];
            if (st.fallbackUrl && audio.src !== st.fallbackUrl) {
                audio.src = st.fallbackUrl;
                audio.play().then(() => {
                    isPlaying = true;
                    updatePlayUI(true);
                    aveeEngine.attachAudio(audio);
                    aveeEngine.start();
                }).catch(e => console.warn('Stream play error:', e));
            }
        });
    }

    function pauseStream() {
        audio.pause();
        isPlaying = false;
        updatePlayUI(false);
        aveeEngine.stop();
    }

    function togglePlay() {
        if (isPlaying) pauseStream();
        else {
            if (!audio.src) loadAndPlayStation(0);
            else playStream();
        }
    }

    function updatePlayUI(playing) {
        mainPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        miniPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (playing) {
            coverDisc.classList.add('spinning');
        } else {
            coverDisc.classList.remove('spinning');
        }
    }

    function nextStation() {
        const next = (currentIndex + 1) % STATIONS.length;
        loadAndPlayStation(next);
    }

    function prevStation() {
        const prev = (currentIndex - 1 + STATIONS.length) % STATIONS.length;
        loadAndPlayStation(prev);
    }

    function setVolume(val) {
        currentVolume = val / 100;
        audio.volume = isMuted ? 0 : currentVolume;
        volumeSlider.value = val;
        volumeProgress.style.width = val + '%';
        volumeNum.textContent = val + '%';
        updateVolIcon();
    }

    function toggleMute() {
        isMuted = !isMuted;
        audio.volume = isMuted ? 0 : currentVolume;
        updateVolIcon();
    }

    function updateVolIcon() {
        if (isMuted || audio.volume === 0) {
            volIcon.className = 'fa-solid fa-volume-xmark';
        } else if (audio.volume < 0.5) {
            volIcon.className = 'fa-solid fa-volume-low';
        } else {
            volIcon.className = 'fa-solid fa-volume-high';
        }
    }

    // Event Listeners
    btnMainPlay.addEventListener('click', togglePlay);
    miniBtnPlay.addEventListener('click', togglePlay);
    btnNextStation.addEventListener('click', nextStation);
    miniBtnNext.addEventListener('click', nextStation);
    btnPrevStation.addEventListener('click', prevStation);
    miniBtnPrev.addEventListener('click', prevStation);

    btnVolumeMute.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => setVolume(parseInt(e.target.value)));

    // Genre Filters
    genreFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        genreFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderStations(btn.dataset.filter);
    });

    // Spectrum Tabs Switcher
    spectrumTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.mode-tab');
        if (!tab) return;
        spectrumTabs.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        aveeEngine.mode = tab.dataset.mode;
    });

    // Palette Dots
    document.querySelectorAll('.dot-btn').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.dot-btn').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            aveeEngine.palette = dot.dataset.palette;
        });
    });

    // Bass Pulse Toggle
    btnBassPulse.addEventListener('click', () => {
        aveeEngine.bassPulseEnabled = !aveeEngine.bassPulseEnabled;
        btnBassPulse.classList.toggle('active', aveeEngine.bassPulseEnabled);
        btnBassPulse.textContent = aveeEngine.bassPulseEnabled ? 'LIGADO' : 'DESLIGADO';
    });

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {
        const stage = document.getElementById('visualizer-studio');
        if (!document.fullscreenElement) {
            stage.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });

    // Sticky Mini Player on Scroll
    window.addEventListener('scroll', () => {
        const hero = document.getElementById('hero-player');
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 0 && isPlaying) {
            miniBarPlayer.classList.add('visible');
        } else {
            miniBarPlayer.classList.remove('visible');
        }
    });

    // Song Request Form
    songRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reqName').value;
        const song = document.getElementById('reqSong').value;
        const recentList = document.getElementById('recentRequestsList');

        const newReq = document.createElement('div');
        newReq.className = 'req-item';
        newReq.innerHTML = '<i class="fa-solid fa-comment-dots"></i> <strong>' + name + ':</strong> ' + song + ' 🎵';
        recentList.prepend(newReq);

        formFeedback.style.color = '#00f2fe';
        formFeedback.textContent = '✅ Pedido enviado com sucesso para a programação da Studio FM!';
        songRequestForm.reset();

        setTimeout(() => { formFeedback.textContent = ''; }, 5000);
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextStation(); }
        if (e.code === 'ArrowLeft') { e.preventDefault(); prevStation(); }
        if (e.code === 'KeyM') { toggleMute(); }
    });

    
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then((reg) => {
                console.log('Studio FM Service Worker Ativo:', reg.scope);
            }).catch((err) => console.log('SW falhou:', err));
        });
    }

    // PWA Install Prompt Handler
    let deferredPrompt = null;
    const btnInstallApp = document.getElementById('btnInstallApp');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (btnInstallApp) btnInstallApp.style.display = 'inline-flex';
    });

    if (btnInstallApp) {
        btnInstallApp.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('App instalado pelo usuário!');
                }
                deferredPrompt = null;
            } else {
                alert('Para instalar o aplicativo:\n\n- No Chrome/Edge: Clique no ícone de instalar na barra de endereços (ou menu 3 pontos > Instalar Rádio Studio FM).\n- No Celular: Toque no menu do navegador e escolha "Adicionar à tela inicial" ou "Instalar aplicativo".');
            }
        });
    }

    // MediaSession API (Lockscreen audio controls & notifications)
    function updateMediaSession(st) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: st.name,
                artist: st.track || 'Rádio Studio FM Ao Vivo',
                album: 'Mix Digital 2026',
                artwork: [
                    { src: 'assets/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => playStream());
            navigator.mediaSession.setActionHandler('pause', () => pauseStream());
            navigator.mediaSession.setActionHandler('previoustrack', () => prevStation());
            navigator.mediaSession.setActionHandler('nexttrack', () => nextStation());
        }
    }

    // Boot
    initVisualizer();
    renderStations();
    loadAndPlayStation(0);

})();
