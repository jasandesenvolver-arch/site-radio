/**
 * RÁDIO STUDIO FM & MIX DIGITAL 2026 - CORE PLAYER & AUDIO CONTROLLER
 */
(function () {
    'use strict';

    // State
    let currentStationList = [...STATIONS];
    let currentIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let currentVolume = 0.85;
    let aveeEngine = null;

    // AUDIO ELEMENT RESILIENTE (SEM audio.crossOrigin para não ser bloqueado por CORS!)
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = currentVolume;
    let backgroundRadioActive = false;

    // No Android o WebView pode pausar o áudio ao bloquear a tela. Quando isso
    // acontece, transferimos a transmissão para um serviço nativo em primeiro
    // plano, que mantém a rádio tocando fora do aplicativo.
    function backgroundRadioPlugin() {
        return window.Capacitor?.Plugins?.BackgroundRadio || null;
    }

    function armBackgroundRadio() {
        const plugin = backgroundRadioPlugin();
        const station = currentStationList[currentIndex];
        const streamUrl = audio.currentSrc || audio.src;
        if (!plugin || !station || !streamUrl) return;
        plugin.arm({ url: streamUrl, title: station.name || 'Rádio Studio FM' })
            .catch((error) => console.warn('Não foi possível preparar o áudio em segundo plano:', error));
    }

    function disarmBackgroundRadio() {
        backgroundRadioPlugin()?.disarm()
            .catch((error) => console.warn('Não foi possível encerrar o áudio em segundo plano:', error));
    }

    async function startBackgroundRadio() {
        const plugin = backgroundRadioPlugin();
        const station = currentStationList[currentIndex];
        const streamUrl = audio.currentSrc || audio.src;
        if (!plugin || !station || !streamUrl || !isPlaying || backgroundRadioActive) return;

        try {
            await plugin.start({ url: streamUrl, title: station.name || 'Rádio Studio FM' });
            backgroundRadioActive = true;
            audio.pause();
        } catch (error) {
            console.warn('Não foi possível iniciar o áudio em segundo plano:', error);
        }
    }

    async function stopBackgroundRadio({ resumeWebAudio = false } = {}) {
        const plugin = backgroundRadioPlugin();
        if (!backgroundRadioActive) return;
        backgroundRadioActive = false;

        try {
            await plugin?.stop();
        } catch (error) {
            console.warn('Não foi possível encerrar o áudio em segundo plano:', error);
        }

        if (resumeWebAudio && isPlaying) {
            audio.play().catch((error) => console.warn('Não foi possível retomar o áudio:', error));
        }
    }

    // DOM Elements
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
    const streamStatusBadge = document.getElementById('streamStatusBadge');

    const miniBarPlayer = document.getElementById('miniBarPlayer');
    const miniTitle = document.getElementById('miniTitle');
    const miniGenre = document.getElementById('miniGenre');
    const miniBtnPlay = document.getElementById('miniBtnPlay');
    const miniPlayIcon = document.getElementById('miniPlayIcon');
    const miniBtnPrev = document.getElementById('miniBtnPrev');
    const miniBtnNext = document.getElementById('miniBtnNext');

    const spectrumTabs = document.getElementById('spectrumTabs');
    const canvasViewport = document.getElementById('canvasViewport');
    const btnRandomSpectrum = document.getElementById('btnRandomSpectrum');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnBassPulse = document.getElementById('btnBassPulse');
    const radioSearchInput = document.getElementById('radioSearchInput');
    const btnSearchRadio = document.getElementById('btnSearchRadio');
    const searchStatusText = document.getElementById('searchStatusText');
    const genreFilters = document.getElementById('genreFilters');
    const songRequestForm = document.getElementById('songRequestForm');
    const recentRequestsList = document.getElementById('recentRequestsList');
    const formFeedback = document.getElementById('formFeedback');
    const headerLiveText = document.querySelector('.live-text');

    function createIcon(className) {
        const icon = document.createElement('i');
        icon.className = /^fa(?:-[a-z0-9]+)+$/i.test(className || '') ? className : 'fa-solid fa-radio';
        return icon;
    }

    function safeColor(value, fallback) {
        return /^#[0-9a-f]{3,8}$/i.test(value || '') ? value : fallback;
    }

    // Inicializa motor Avee Player
    function initVisualizer() {
        aveeEngine = new AveeVisualizer('aveeCanvas', 'miniVisualizer');
    }

    // Atualiza o crachá de status do streaming
    function setStreamStatus(status, text) {
        if (!streamStatusBadge) return;
        streamStatusBadge.className = 'status-indicator ' + status;
        streamStatusBadge.replaceChildren(Object.assign(document.createElement('span'), { className: 'status-dot' }), document.createTextNode(' ' + text));
        if (headerLiveText) headerLiveText.textContent = status === 'live' ? 'NO AR' : status === 'connecting' ? 'CONECTANDO' : 'PAUSADO';
    }

    // Renderiza os Cards de Rádios na Grade
    function renderStations(list = currentStationList) {
        stationsGrid.innerHTML = '';
        if (list.length === 0) {
            stationsGrid.innerHTML = '<div class="no-stations"><i class="fa-solid fa-satellite-dish"></i> Nenhuma rádio encontrada para essa busca. Tente outro termo.</div>';
            return;
        }

        list.forEach((st, idx) => {
            const isCurrent = idx === currentIndex && currentStationList === list;
            const isFavorited = localStorage.getItem('fav_' + (st.id || st.stationuuid)) === 'true';
            const color = safeColor(st.color, '#9d4edd');
            const colorEnd = safeColor(st.colorEnd, '#00f2fe');
            const genreName = st.genreLabel || st.tags || 'ONLINE FM';
            const iconClass = st.icon || 'fa-solid fa-radio';
            const stationTitle = st.name || 'Rádio Ao Vivo';
            const stationDesc = st.description || (st.country ? 'Emissora de ' + st.country : 'Streaming de áudio digital 24h.');

            const card = document.createElement('div');
            card.className = 'station-card' + (isCurrent && isPlaying ? ' playing' : '');
            card.dataset.index = idx;

            const cardTop = document.createElement('div');
            cardTop.className = 'card-top';
            const iconWrap = document.createElement('div');
            iconWrap.className = 'card-icon-wrap';
            iconWrap.style.background = `linear-gradient(135deg, ${color}, ${colorEnd})`;
            iconWrap.appendChild(createIcon(iconClass));
            const favBtn = document.createElement('button');
            favBtn.className = 'card-fav-btn' + (isFavorited ? ' favorited' : '');
            favBtn.type = 'button';
            favBtn.title = 'Favoritar';
            favBtn.appendChild(createIcon('fa-' + (isFavorited ? 'solid' : 'regular') + ' fa-heart'));
            cardTop.append(iconWrap, favBtn);

            const cardInfo = document.createElement('div');
            cardInfo.className = 'card-info';
            const genre = document.createElement('div');
            genre.className = 'card-genre';
            genre.textContent = genreName.substring(0, 24);
            const title = document.createElement('h3');
            title.textContent = stationTitle;
            const description = document.createElement('p');
            description.className = 'card-desc';
            description.textContent = stationDesc.substring(0, 100);
            cardInfo.append(genre, title, description);

            const footer = document.createElement('div');
            footer.className = 'card-footer-action';
            const label = document.createElement('span');
            label.className = 'card-play-label';
            label.append(createIcon('fa-solid fa-tower-broadcast'), document.createTextNode(' ' + (st.bitrate ? st.bitrate + ' kbps' : 'Ao Vivo')));
            const playButton = document.createElement('div');
            playButton.className = 'card-play-btn-circle';
            playButton.appendChild(createIcon('fa-solid ' + (isCurrent && isPlaying ? 'fa-pause' : 'fa-play')));
            footer.append(label, playButton);
            card.append(cardTop, cardInfo, footer);

            // Clique no card para tocar
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-fav-btn')) return;
                currentStationList = list;
                loadAndPlayStation(idx);
            });

            // Favoritar
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const key = 'fav_' + (st.id || st.stationuuid);
                const favState = localStorage.getItem(key) === 'true';
                localStorage.setItem(key, (!favState).toString());
                renderStations(list);
            });

            stationsGrid.appendChild(card);
        });
    }

    // Carregar e Tocar Estação
    function loadAndPlayStation(index) {
        if (index < 0 || index >= currentStationList.length) return;
        currentIndex = index;
        const st = currentStationList[index];

        const streamUrl = st.url_resolved || st.url;
        audio.src = streamUrl;

        const displayName = st.name || 'Rádio Studio FM';
        const displayGenre = st.genreLabel || st.tags || 'Música & Notícias';
        const displayTrack = st.track || st.country || 'Transmissão Ao Vivo';

        currentStationTitle.textContent = displayName;
        currentStationGenre.replaceChildren(createIcon(st.icon || 'fa-solid fa-radio'), document.createTextNode(' ' + displayGenre));
        currentTrackName.replaceChildren(createIcon('fa-solid fa-headphones'), document.createTextNode(' ' + displayTrack));

        miniTitle.textContent = displayName;
        miniGenre.textContent = displayGenre;
        miniBarPlayer.classList.add('visible');
        document.body.classList.add('has-mini-player');

        setStreamStatus('connecting', 'Conectando ao sinal...');
        playStream();
        updateMediaSession(st);
        renderStations(currentStationList);
    }

    function playStream() {
        setStreamStatus('connecting', 'Sintonizando...');
        miniBarPlayer.classList.add('visible');
        document.body.classList.add('has-mini-player');
        
        // Tenta iniciar áudio de forma segura
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                setStreamStatus('live', 'NO AR (AO VIVO)');
                updatePlayUI(true);
                aveeEngine.start();
            }).catch((err) => {
                console.warn('Erro ao reproduzir stream:', err);
                setStreamStatus('error', 'Tentando conectar...');
                // Fallback inteligente
                const st = currentStationList[currentIndex];
                if (st && st.fallbackUrl && audio.src !== st.fallbackUrl) {
                    audio.src = st.fallbackUrl;
                    audio.play().then(() => {
                        isPlaying = true;
                        setStreamStatus('live', 'NO AR (REDE 2)');
                        updatePlayUI(true);
                        aveeEngine.start();
                    }).catch(e => {
                        setStreamStatus('error', 'Clique em Play para iniciar');
                    });
                } else {
                    setStreamStatus('idle', 'Toque em Play para ouvir');
                }
            });
        }
    }

    function pauseStream() {
        audio.pause();
        stopBackgroundRadio();
        disarmBackgroundRadio();
        isPlaying = false;
        setStreamStatus('idle', 'PAUSADO');
        updatePlayUI(false);
        aveeEngine.stop();
    }

    function togglePlay() {
        if (isPlaying) {
            pauseStream();
        } else {
            if (!audio.src || audio.src === '') {
                loadAndPlayStation(currentIndex);
            } else {
                playStream();
            }
        }
    }

    function updatePlayUI(playing) {
        mainPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        miniPlayIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (playing) {
            coverDisc.classList.add('spinning');
            btnMainPlay.classList.add('playing');
        } else {
            coverDisc.classList.remove('spinning');
            btnMainPlay.classList.remove('playing');
        }
    }

    function nextStation() {
        const next = (currentIndex + 1) % currentStationList.length;
        loadAndPlayStation(next);
    }

    function prevStation() {
        const prev = (currentIndex - 1 + currentStationList.length) % currentStationList.length;
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

    // Listeners do Elemento Audio para feedback visual em tempo real
    audio.addEventListener('playing', () => {
        isPlaying = true;
        armBackgroundRadio();
        setStreamStatus('live', 'NO AR (AO VIVO)');
        updatePlayUI(true);
        aveeEngine.start();
    });

    audio.addEventListener('waiting', () => {
        setStreamStatus('connecting', 'Carregando áudio...');
    });

    audio.addEventListener('error', (e) => {
        console.warn('Erro de transmissão no áudio:', e);
        setStreamStatus('error', 'Sinal instável. Troque de estação.');
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            startBackgroundRadio();
        } else {
            stopBackgroundRadio({ resumeWebAudio: true });
        }
    });

    // PWA MediaSession
    function updateMediaSession(st) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: st.name || 'Studio FM',
                artist: st.track || 'Rádio Ao Vivo 24h',
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

    // Integração da Busca Radio Browser API
    async function searchRadioBrowser(query) {
        if (!query || query.trim() === '') return;
        searchStatusText.textContent = 'Buscando rádios na rede mundial...';
        searchStatusText.style.display = 'block';

        try {
            const results = await RadioBrowserService.searchStations(query.trim(), 24);
            searchStatusText.textContent = results.length + ' estações encontradas para "' + query + '"';
            if (results.length > 0) {
                currentStationList = results;
                renderStations(results);
            } else {
                searchStatusText.textContent = 'Nenhuma rádio encontrada com esse nome. Buscando no Brasil...';
                const brResults = await RadioBrowserService.getBrazilStations(20);
                currentStationList = brResults;
                renderStations(brResults);
            }
        } catch (err) {
            console.warn('Busca falhou:', err);
            searchStatusText.textContent = 'Modo offline: exibindo estações curadas.';
            currentStationList = STATIONS;
            renderStations(STATIONS);
        }
    }

    async function loadCategory(cat) {
        searchStatusText.style.display = 'block';
        if (cat === 'all') {
            searchStatusText.textContent = 'Exibindo estações de alta estabilidade';
            currentStationList = STATIONS;
            renderStations(STATIONS);
            return;
        }

        if (cat === 'brasil') {
            searchStatusText.textContent = 'Carregando mais de 25 rádios do Brasil via Radio Browser API...';
            try {
                const brStations = await RadioBrowserService.getBrazilStations(30);
                currentStationList = brStations;
                renderStations(brStations);
                searchStatusText.textContent = 'Rádios mais ouvidas do Brasil carregadas!';
            } catch (e) {
                currentStationList = STATIONS.filter(s => s.country === 'Brasil');
                renderStations(currentStationList);
            }
            return;
        }

        if (cat === 'world') {
            searchStatusText.textContent = 'Carregando as rádios mais ouvidas do planeta...';
            try {
                const worldStations = await RadioBrowserService.getTopWorldStations(30);
                currentStationList = worldStations;
                renderStations(worldStations);
                searchStatusText.textContent = 'Top Rádios Mundiais carregadas!';
            } catch (e) {
                renderStations(STATIONS);
            }
            return;
        }

        // Filtro local por gênero
        searchStatusText.textContent = 'Filtrando gênero: ' + cat.toUpperCase();
        const filtered = STATIONS.filter(s => s.genre === cat);
        currentStationList = filtered.length > 0 ? filtered : STATIONS;
        renderStations(currentStationList);
    }

    // Listeners dos Controles
    btnMainPlay.addEventListener('click', togglePlay);
    miniBtnPlay.addEventListener('click', togglePlay);
    btnNextStation.addEventListener('click', nextStation);
    miniBtnNext.addEventListener('click', nextStation);
    btnPrevStation.addEventListener('click', prevStation);
    miniBtnPrev.addEventListener('click', prevStation);

    btnVolumeMute.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => setVolume(parseInt(e.target.value)));

    // Filtros de Categorias
    genreFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.pill-btn');
        if (!btn) return;
        genreFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadCategory(btn.dataset.filter);
    });

    // Barra de Busca
    btnSearchRadio.addEventListener('click', () => {
        searchRadioBrowser(radioSearchInput.value);
    });
    radioSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRadioBrowser(radioSearchInput.value);
        }
    });

    // Sem backend neste projeto, os pedidos ficam no mural local do dispositivo.
    function addRequestToWall(request) {
        const item = document.createElement('div');
        item.className = 'req-item';
        item.append(createIcon('fa-solid fa-comment-dots'));
        const author = document.createElement('strong');
        author.textContent = ' ' + request.name + ':';
        item.append(author, document.createTextNode(' ' + request.song + (request.message ? ' — ' + request.message : '')));
        recentRequestsList.prepend(item);
    }

    if (songRequestForm && recentRequestsList && formFeedback) {
        songRequestForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('reqName').value.trim();
            const song = document.getElementById('reqSong').value.trim();
            const message = document.getElementById('reqMessage').value.trim();
            if (!name || !song) return;
            const request = { name: name.slice(0, 80), song: song.slice(0, 120), message: message.slice(0, 240) };
            const saved = JSON.parse(localStorage.getItem('studioFmRequests') || '[]');
            saved.push(request);
            localStorage.setItem('studioFmRequests', JSON.stringify(saved.slice(-10)));
            addRequestToWall(request);
            songRequestForm.reset();
            formFeedback.textContent = 'Pedido recebido no mural deste dispositivo.';
        });
    }

    // Modos do Espectro Avee Player
    const spectrumModes = ['circular', 'cyberbars', 'liquidwave', 'stardust'];
    let randomSpectrumTimer = null;

    function setSpectrumMode(mode, announce = false) {
        if (!spectrumModes.includes(mode)) return;
        spectrumTabs.querySelectorAll('.mode-tab[data-mode]').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        aveeEngine.mode = mode;
        if (announce) {
            const label = spectrumTabs.querySelector(`.mode-tab[data-mode="${mode}"]`)?.textContent.trim() || mode;
            showToast(`✨ Espectro: ${label}`);
        }
    }

    function cycleSpectrum() {
        const current = spectrumModes.indexOf(aveeEngine.mode);
        setSpectrumMode(spectrumModes[(current + 1) % spectrumModes.length], true);
    }

    spectrumTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.mode-tab');
        if (!tab || !tab.dataset.mode) return;
        setSpectrumMode(tab.dataset.mode);
    });

    if (canvasViewport) {
        canvasViewport.addEventListener('click', (e) => {
            if (!e.target.closest('button')) cycleSpectrum();
        });
    }

    if (btnRandomSpectrum) {
        btnRandomSpectrum.addEventListener('click', () => {
            const enabled = !randomSpectrumTimer;
            if (enabled) {
                cycleSpectrum();
                randomSpectrumTimer = window.setInterval(cycleSpectrum, 10000);
            } else {
                window.clearInterval(randomSpectrumTimer);
                randomSpectrumTimer = null;
            }
            btnRandomSpectrum.classList.toggle('active', enabled);
            btnRandomSpectrum.setAttribute('aria-pressed', String(enabled));
            showToast(enabled ? '🎲 Efeitos aleatórios ativados' : '🎨 Efeitos aleatórios desativados');
        });
    }

    // Seletor de Paleta Neon
    document.querySelectorAll('.dot-btn').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.dot-btn').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            aveeEngine.palette = dot.dataset.palette;
        });
    });

    // Bass Pulse
    btnBassPulse.addEventListener('click', () => {
        aveeEngine.bassPulseEnabled = !aveeEngine.bassPulseEnabled;
        btnBassPulse.classList.toggle('active', aveeEngine.bassPulseEnabled);
        btnBassPulse.textContent = aveeEngine.bassPulseEnabled ? 'LIGADO' : 'DESLIGADO';
    });

    // Tela Cheia
    btnFullscreen.addEventListener('click', () => {
        const stage = document.getElementById('visualizer-studio');
        if (!document.fullscreenElement) {
            stage.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    });

    // O mini player permanece disponível depois que o usuário escolhe uma rádio.

    // O APK já carrega todos os arquivos dentro dele. Service Worker só é
    // necessário no site; dentro do Android ele podia reabrir uma interface
    // antiga depois de uma atualização do aplicativo.
    const isNativeApp = window.Capacitor?.isNativePlatform?.() === true;
    if (isNativeApp) {
        document.body.classList.add('native-app');
    }
    if ('serviceWorker' in navigator && isNativeApp) {
        navigator.serviceWorker.getRegistrations()
            .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
            .then(() => window.caches ? window.caches.keys() : [])
            .then((keys) => Promise.all(keys.map((key) => window.caches.delete(key))))
            .catch((error) => console.warn('Não foi possível limpar o cache antigo:', error));
    } else if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(e => console.log(e));
        });
    }

    const btnInstallApp = document.getElementById('btnInstallApp');
    if (btnInstallApp) {
        btnInstallApp.addEventListener('click', shareApplication);
    }

    
    // ==========================================================
    // FLOATING ACTION BUTTON & SHARING ENGINE
    // ==========================================================
    const fabMainBtn = document.getElementById('fabMainBtn');
    const fabMenu = document.getElementById('fabMenu');
    const fabInstallApp = document.getElementById('fabInstallApp');
    const fabShareNative = document.getElementById('fabShareNative');
    const fabShareWhatsapp = document.getElementById('fabShareWhatsapp');
    const fabCopyLink = document.getElementById('fabCopyLink');
    const appToast = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(msg) {
        if (!appToast) return;
        toastMessage.textContent = msg;
        appToast.classList.add('visible');
        setTimeout(() => {
            appToast.classList.remove('visible');
        }, 3500);
    }

    function shareApplication() {
        const st = currentStationList[currentIndex] || {};
        const shareData = {
            title: 'Rádio Studio FM - Mix Digital 2026',
            text: 'Baixe o aplicativo Rádio Studio FM para Android e ouça ' + (st.name || 'rádios ao vivo') + ' no seu celular.',
            url: 'https://radio-studio-fm.vercel.app/'
        };
        const apkShare = window.Capacitor?.registerPlugin?.('AppShare')
            || window.Capacitor?.Plugins?.AppShare;
        if (apkShare) {
            showToast('📦 Preparando o APK para compartilhar...');
            return apkShare.shareApk({ text: shareData.text })
                .catch(() => shareLinkOnly());
        }
        return shareLinkOnly();
    }

    function shareLinkOnly() {
        const st = currentStationList[currentIndex] || {};
        const shareData = {
            title: 'Rádio Studio FM - Mix Digital 2026',
            text: 'Baixe o aplicativo Rádio Studio FM para Android e ouça ' + (st.name || 'rádios ao vivo') + ' no seu celular.',
            url: 'https://radio-studio-fm.vercel.app/'
        };
        const nativeShare = window.Capacitor?.Plugins?.Share
            || window.Capacitor?.registerPlugin?.('Share');
        if (nativeShare) {
            showToast('📤 Abrindo opções de compartilhamento...');
            return nativeShare.share({ ...shareData, dialogTitle: 'Compartilhar Rádio Studio FM' })
                .catch(() => console.log('Compartilhamento cancelado.'));
        }
        if (navigator.share) {
            return navigator.share(shareData).catch(() => console.log('Compartilhamento cancelado.'));
        }
        const copyPromise = navigator.clipboard?.writeText(shareData.url);
        if (!copyPromise) {
            showToast('Não foi possível abrir o compartilhamento neste aparelho.');
            return Promise.resolve();
        }
        return copyPromise.then(() => {
            showToast('🔗 Link do aplicativo copiado!');
        });
    }

    if (fabMainBtn) fabMainBtn.addEventListener('click', shareApplication);

    // Baixar / Instalar App
    if (fabInstallApp) {
        fabInstallApp.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt = null;
            } else {
                showToast('📲 Clique no ícone de instalar na barra de navegação!');
            }
        });
    }

    // Compartilhar Nativo
    if (fabShareNative) fabShareNative.addEventListener('click', shareApplication);

    // Compartilhar no WhatsApp
    if (fabShareWhatsapp) {
        fabShareWhatsapp.addEventListener('click', () => {
            const st = currentStationList[currentIndex] || {};
            const text = encodeURIComponent('📻 *Rádio Studio FM & Mix Digital 2026*\nOuvindo agora: *' + (st.name || 'Studio FM') + '* com efeitos de espectro sonoro ao vivo!\n\nOuça agora grátis:\n' + window.location.href);
            window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
        });
    }

    // Copiar Link
    if (fabCopyLink) {
        fabCopyLink.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('🔗 Link copiado com sucesso!');
            }).catch(() => {
                showToast('Link: ' + window.location.href);
            });
        });
    }

    // Inicialização sem autoplay forçado (em conformidade com navegadores modernos)
    initVisualizer();
    renderStations(STATIONS);
    
    // Configura os dados iniciais no player sem tocar
    const initialStation = STATIONS[0];
    audio.src = initialStation.url;
    currentStationTitle.textContent = initialStation.name;
    currentStationGenre.replaceChildren(createIcon(initialStation.icon), document.createTextNode(' ' + initialStation.genreLabel));
    currentTrackName.replaceChildren(createIcon('fa-solid fa-headphones'), document.createTextNode(' ' + initialStation.track));
    setStreamStatus('idle', 'Toque em Play para sintonizar');

})();
