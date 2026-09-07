/**
 * Rádio Studio FM - Live Stations Catalog 2026
 * Streams with reliable public web audio feeds
 */
const STATIONS = [
    {
        id: 'studio-pop',
        name: 'Rádio Studio Pop',
        genre: 'pop',
        genreLabel: 'POP & TOP 40',
        description: 'Os maiores lançamentos globais, Billboard Hot 100 e hits virais do TikTok.',
        url: 'https://stream.zeno.fm/fyn8eh3h5f8uv',
        fallbackUrl: 'https://ice1.somafm.com/poptron-128-mp3',
        color: '#9d4edd',
        colorEnd: '#00f2fe',
        icon: 'fa-solid fa-microphone-lines',
        track: 'Dua Lipa, The Weeknd & Taylor Swift'
    },
    {
        id: 'mix-digital-edm',
        name: 'Mix Digital 2026',
        genre: 'dance',
        genreLabel: 'EDM, HOUSE & BASS',
        description: 'Vibes de festival com o melhor do Electro House, Future Rave, Trap e Bass Music.',
        url: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        fallbackUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
        color: '#00f2fe',
        colorEnd: '#ff007f',
        icon: 'fa-solid fa-bolt',
        track: 'Alok, David Guetta & Martin Garrix'
    },
    {
        id: 'lofi-chill',
        name: 'Studio Lo-Fi Beats',
        genre: 'chill',
        genreLabel: 'LO-FI & STUDY',
        description: 'Batidas aconchegantes e atmosféricas para estudar, programar e relaxar.',
        url: 'https://play.streamafrica.net/lofiradio',
        fallbackUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
        color: '#a855f7',
        colorEnd: '#ec4899',
        icon: 'fa-solid fa-mug-hot',
        track: 'Lofi Girl & Chillhop Essentials'
    },
    {
        id: 'rock-station',
        name: 'Studio Rock FM',
        genre: 'rock',
        genreLabel: 'ROCK & METAL',
        description: 'Guitarras pesadas, clássicos do Classic Rock, Grunge e lançamentos do Metal.',
        url: 'https://stream.zeno.fm/241kbfeyep8uv',
        fallbackUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
        color: '#ef4444',
        colorEnd: '#f97316',
        icon: 'fa-solid fa-guitar',
        track: 'Linkin Park, Queen, Foo Fighters'
    },
    {
        id: 'hiphop-urban',
        name: 'Urban Trap & Hip-Hop',
        genre: 'urban',
        genreLabel: 'TRAP & R&B',
        description: 'O flow do hip-hop mundial com 808s marcantes e produções de ponta.',
        url: 'https://stream.zeno.fm/4d6byep0punuv',
        fallbackUrl: 'https://ice1.somafm.com/fluid-128-mp3',
        color: '#eab308',
        colorEnd: '#f43f5e',
        icon: 'fa-solid fa-fire',
        track: 'Travis Scott, Drake & Post Malone'
    },
    {
        id: 'synthwave-retro',
        name: 'Cyberwave 80s/90s',
        genre: 'dance',
        genreLabel: 'RETROWAVE & SYNTH',
        description: 'Synthwave futurista e nostalgia dos anos 80 em áudio espacial imersivo.',
        url: 'https://ice1.somafm.com/spacestation-128-mp3',
        fallbackUrl: 'https://stream.zeno.fm/0r0xa792kwzuv',
        color: '#ff007f',
        colorEnd: '#9d4edd',
        icon: 'fa-solid fa-vr-cardboard',
        track: 'Kavinsky, The Midnight & Synth Hits'
    },
    {
        id: 'sertanejo-hits',
        name: 'Sertanejo Universitário',
        genre: 'pop',
        genreLabel: 'SERTANEJO & BRASIL',
        description: 'Os sucessos mais tocados no Brasil, do modão ao sertanejo pop moderno.',
        url: 'https://stream.zeno.fm/pw483dak6bhvv',
        fallbackUrl: 'https://stream.zeno.fm/fyn8eh3h5f8uv',
        color: '#f97316',
        colorEnd: '#eab308',
        icon: 'fa-solid fa-hat-cowboy',
        track: 'Jorge & Mateus, Gusttavo Lima & Ana Castela'
    },
    {
        id: 'jazz-groove',
        name: 'Velvet Jazz & Soul',
        genre: 'chill',
        genreLabel: 'JAZZ, BLUES & SOUL',
        description: 'Elegância e instrumentos acústicos para harmonizar qualquer ambiente.',
        url: 'https://stream.zeno.fm/0r0xa792kwzuv',
        fallbackUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
        color: '#14b8a6',
        colorEnd: '#3b82f6',
        icon: 'fa-solid fa-saxophone',
        track: 'Miles Davis, Norah Jones & Smooth Soul'
    }
];
