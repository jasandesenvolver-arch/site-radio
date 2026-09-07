/**
 * RÁDIO STUDIO FM & MIX DIGITAL 2026
 * Catálogo de Rádios Verificadas + Serviço Radio Browser API
 */

// Estações Curadas Pré-carregadas de Alta Estabilidade
const STATIONS = [
    {
        id: 'swiss-pop',
        name: 'Radio Swiss Pop HD',
        genre: 'pop',
        genreLabel: 'POP & HITS MUNDIAIS',
        country: 'Suíça / Global',
        description: 'Transmissão europeia em alta definição 320kbps. 100% de estabilidade 24 horas.',
        url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
        color: '#3b82f6',
        colorEnd: '#8b5cf6',
        icon: 'fa-solid fa-compact-disc',
        track: 'Top Hits Internacionais & Pop'
    },
    {
        id: 'somafm-groove',
        name: 'SomaFM Groove Salad',
        genre: 'chill',
        genreLabel: 'LO-FI & DOWNTEMPO',
        country: 'EUA / Global',
        description: 'A rádio de Lo-Fi, Ambient e Downtempo mais ouvida do mundo. Transmissão contínua sem comerciais.',
        url: 'https://ice1.somafm.com/groovesalad-128-mp3',
        color: '#10b981',
        colorEnd: '#06b6d4',
        icon: 'fa-solid fa-mug-hot',
        track: 'Chillout, Lo-Fi Beats & Ambient'
    },
    {
        id: 'ibiza-global',
        name: 'Ibiza Global Radio',
        genre: 'dance',
        genreLabel: 'EDM & HOUSE',
        country: 'Espanha / Global',
        description: 'A rádio oficial dos maiores festivais e clubes de Ibiza. Eletrônica e DJs ao vivo.',
        url: 'https://stream.ibizaglobalradio.com/ibizaglobalradio.mp3',
        color: '#00f2fe',
        colorEnd: '#ff007f',
        icon: 'fa-solid fa-bolt',
        track: 'Live DJs from Ibiza, House & Tech'
    },
    {
        id: 'somafm-defcon',
        name: 'SomaFM DEF CON Radio',
        genre: 'dance',
        genreLabel: 'CYBERPUNK & SYNTH',
        country: 'EUA',
        description: 'Sons eletrônicos futuristas, synthwave e batidas graves da maior conferência hacker de Las Vegas.',
        url: 'https://ice1.somafm.com/defcon-128-mp3',
        color: '#eab308',
        colorEnd: '#f43f5e',
        icon: 'fa-solid fa-vr-cardboard',
        track: 'Cyberpunk, Bass Music & Glitch'
    },
    {
        id: 'swiss-jazz',
        name: 'Radio Swiss Jazz HD',
        genre: 'chill',
        genreLabel: 'JAZZ & BLUES',
        country: 'Suíça',
        description: 'Jazz clássico, Blues e Soul acústico em som cristalino.',
        url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
        color: '#14b8a6',
        colorEnd: '#3b82f6',
        icon: 'fa-solid fa-saxophone',
        track: 'Classic Jazz & Blues Legends'
    },
    {
        id: 'somafm-indie',
        name: 'SomaFM Indie Pop Rocks',
        genre: 'rock',
        genreLabel: 'INDIE & ROCK',
        description: 'Novas bandas, clássicos do rock alternativo e indie internacional.',
        url: 'https://ice1.somafm.com/indiepop-128-mp3',
        color: '#ef4444',
        colorEnd: '#f97316',
        icon: 'fa-solid fa-guitar',
        track: 'Indie Rock & Modern Alternative'
    },
    {
        id: 'somafm-poptron',
        name: 'SomaFM PopTron',
        genre: 'pop',
        genreLabel: 'ELECTROPOP & DANCE',
        description: 'Electropop sofisticado com os maiores destaques alternativos e pop moderno.',
        url: 'https://ice1.somafm.com/poptron-128-mp3',
        color: '#f43f5e',
        colorEnd: '#fb923c',
        icon: 'fa-solid fa-fire',
        track: 'Electropop, Synth & Modern Hits'
    },
    {
        id: 'bossa-jazz-br',
        name: 'Bossa Jazz Brasil',
        genre: 'chill',
        genreLabel: 'BOSSA NOVA & MPB',
        country: 'Brasil',
        description: 'O melhor da Bossa Nova, Tom Jobim, Vinicius de Moraes e MPB instrumental.',
        url: 'https://centova5.transmissaodigital.com:20104/live',
        color: '#a855f7',
        colorEnd: '#ec4899',
        icon: 'fa-solid fa-heart',
        track: 'Bossa Nova, MPB & Jazz Brasileiro'
    }
];

// Serviço Radio Browser API para busca em tempo real de qualquer rádio do mundo
const RadioBrowserService = {
    mirrors: [
        'https://de1.api.radio-browser.info',
        'https://nl1.api.radio-browser.info',
        'https://at1.api.radio-browser.info'
    ],
    currentMirrorIndex: 0,

    getApiBase() {
        return this.mirrors[this.currentMirrorIndex];
    },

    rotateMirror() {
        this.currentMirrorIndex = (this.currentMirrorIndex + 1) % this.mirrors.length;
    },

    async fetchWithFallback(endpoint) {
        for (let i = 0; i < this.mirrors.length; i++) {
            const url = this.getApiBase() + endpoint;
            try {
                const response = await fetch(url, { headers: { 'User-Agent': 'StudioFM/2026' } });
                if (response.ok) {
                    return await response.json();
                }
            } catch (err) {
                console.warn('Radio Browser mirror falhou, tentando outro...', err);
                this.rotateMirror();
            }
        }
        throw new Error('Todos os mirrors da Radio Browser API falharam.');
    },

    async getBrazilStations(limit = 24) {
        return this.fetchWithFallback('/json/stations/search?countrycode=BR&limit=' + limit + '&order=clickcount&reverse=true');
    },

    async searchStations(query, limit = 24) {
        const encoded = encodeURIComponent(query);
        return this.fetchWithFallback('/json/stations/search?name=' + encoded + '&limit=' + limit + '&order=clickcount&reverse=true');
    },

    async getTopWorldStations(limit = 24) {
        return this.fetchWithFallback('/json/stations/topclick/' + limit);
    }
};
