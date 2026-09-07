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
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnBassPulse = document.getElementById('btnBassPulse');
    const radioSearchInput = document.getElementById('radioSearchInput');
    const btnSearchRadio = document.getElementById('btnSearchRadio');
    const searchStatusText = document.getElementById('searchStatusText');
    const genreFilters = document.getElementById('genreFilters');

    // Inicializa motor Avee Player
    function initVisualizer() {
        aveeEngine = new AveeVisualizer('aveeCanvas', 'miniVisualizer');
    }

    // Atualiza o crachá de status do streaming
    function setStreamStatus(status, text) {
        if (!streamStatusBadge) return;
        streamStatusBadge.className = 'status-indicator ' + status;
        streamStatusBadge.innerHTML = '<span class="status-dot"></span> ' + text;
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
            const color = st.color || '#9d4edd';
            const colorEnd = st.colorEnd || '#00f2fe';
            const genreName = st.genreLabel || st.tags || 'ONLINE FM';
            const iconClass = st.icon || 'fa-solid fa-radio';
            const stationTitle = st.name || 'Rádio Ao Vivo';
            const stationDesc = st.description || (st.country ? 'Emissora de ' + st.country : 'Streaming de áudio digital 24h.');

            const card = document.createElement('div');
            card.className = 'station-card' + (isCurrent && isPlaying ? ' playing' : '');
            card.dataset.index = idx;

            card.innerHTML = `
                <div class="card-top">
                    <div class="card-icon-wrap" style="background: linear-gradient(135deg, ${color}, ${colorEnd});">
                        <i class="${iconClass}"></i>
                    </div>
                    <button class="card-fav-btn ${isFavorited ? 'favorited' : ''}" title="Favoritar">
                        <i class="fa-${isFavorited ? 'solid' : 'regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="card-info">
                    <div class="card-genre">${genreName.substring(0, 24)}</div>
                    <h3>${stationTitle}</h3>
                    <p class="card-desc">${stationDesc.substring(0, 100)}</p>
                </div>
                <div class="card-footer-action">
                    <span class="card-play-label">
                        <i class="fa-solid fa-tower-broadcast"></i> ${st.bitrate ? st.bitrate + ' kbps' : 'Ao Vivo'}
                    </span>
                    <div class="card-play-btn-circle">
                        <i class="fa-solid ${isCurrent && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                    </div>
                </div>
            `;

            // Clique no card para tocar
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-fav-btn')) return;
                currentStationList = list;
                loadAndPlayStation(idx);
            });

            // Favoritar
            const favBtn = card.querySelector('.card-fav-btn');
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
        currentStationGenre.innerHTML = '<i class="' + (st.icon || 'fa-solid fa-radio') + '"></i> ' + displayGenre;
        currentTrackName.innerHTML = '<i class="fa-solid fa-headphones"></i> ' + displayTrack;

        miniTitle.textContent = displayName;
        miniGenre.textContent = displayGenre;

        setStreamStatus('connecting', 'Conectando ao sinal...');
        playStream();
        updateMediaSession(st);
        renderStations(currentStationList);
    }

    function playStream() {
        setStreamStatus('connecting', 'Sintonizando...');
        
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

    // Modos do Espectro Avee Player
    spectrumTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.mode-tab');
        if (!tab) return;
        spectrumTabs.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        aveeEngine.mode = tab.dataset.mode;
    });

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

    // Mini Player Fixo ao rolar
    window.addEventListener('scroll', () => {
        const hero = document.getElementById('hero-player');
        if (hero) {
            const heroBottom = hero.getBoundingClientRect().bottom;
            if (heroBottom < 0 && isPlaying) {
                miniBarPlayer.classList.add('visible');
            } else {
                miniBarPlayer.classList.remove('visible');
            }
        }
    });

    // PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(e => console.log(e));
        });
    }

    // PWA Install Prompt
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
                deferredPrompt = null;
            } else {
                alert('Para instalar:\nNo Chrome/Edge: Clique no ícone de instalar na barra de endereços.\nNo Celular: Toque em "Adicionar à tela inicial".');
            }
        });
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

    if (fabMainBtn && fabMenu) {
        fabMainBtn.addEventListener('click', () => {
            const isOpen = fabMenu.classList.toggle('open');
            fabMainBtn.classList.toggle('active', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#floatingFabContainer') && fabMenu.classList.contains('open')) {
                fabMenu.classList.remove('open');
                fabMainBtn.classList.remove('active');
            }
        });
    }

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
    if (fabShareNative) {
        fabShareNative.addEventListener('click', async () => {
            const st = currentStationList[currentIndex] || {};
            const shareData = {
                title: 'Rádio Studio FM - Mix Digital 2026',
                text: 'Estou ouvindo: ' + (st.name || 'Studio FM') + ' com espectro Avee Player! Vem ouvir:',
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (e) {
                    console.log('Compartilhamento cancelado.');
                }
            } else {
                navigator.clipboard.writeText(window.location.href);
                showToast('🔗 Link da rádio copiado para a área de transferência!');
            }
        });
    }

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
    currentStationGenre.innerHTML = '<i class="' + initialStation.icon + '"></i> ' + initialStation.genreLabel;
    currentTrackName.innerHTML = '<i class="fa-solid fa-headphones"></i> ' + initialStation.track;
    setStreamStatus('idle', 'Toque em Play para sintonizar');

})();
