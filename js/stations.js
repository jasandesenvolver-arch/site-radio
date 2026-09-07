/**
 * RÁDIO STUDIO FM & MIX DIGITAL - CATÁLOGO DE ESTAÇÕES REAIS AO VIVO
 * Emissoras consagradas do Brasil e do Mundo com transmissões digitais oficiais 24 horas
 */
const STATIONS = [
    {
        id: 'antena-1',
        name: 'Antena 1 FM 94.7',
        genre: 'pop',
        genreLabel: 'POP & FLASHBACK',
        description: 'A rádio número 1 em música internacional. O melhor do Pop, Soft Rock e grandes clássicos.',
        url: 'https://antenaone.crossradio.com.br/stream/1',
        fallbackUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
        color: '#9d4edd',
        colorEnd: '#00f2fe',
        icon: 'fa-solid fa-microphone-lines',
        track: 'Música Internacional & Sucessos Globais'
    },
    {
        id: '89-radio-rock',
        name: '89 FM A Rádio Rock',
        genre: 'rock',
        genreLabel: 'ROCK & METAL',
        description: 'A maior rádio de rock do Brasil (89.1 FM SP). Do Classic Rock ao Indie e Heavy Metal.',
        url: 'https://ice.fabricahost.com.br/radiorock',
        fallbackUrl: 'https://ice1.somafm.com/indiepop-128-mp3',
        color: '#ef4444',
        colorEnd: '#f97316',
        icon: 'fa-solid fa-guitar',
        track: 'Rock Nacional & Internacional Non-Stop'
    },
    {
        id: 'mix-fm-sp',
        name: 'Mix FM 106.3',
        genre: 'pop',
        genreLabel: 'POP & TOP 40',
        description: 'O som que toca na sua cabeça. Billboard Hot 100, Pop nacional, internacional e lançamentos.',
        url: 'https://ice.fabricahost.com.br/radiomixsp',
        fallbackUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
        color: '#f43f5e',
        colorEnd: '#fb923c',
        icon: 'fa-solid fa-fire',
        track: 'Top Hits, Pop, Funk Pop & Urban'
    },
    {
        id: 'ibiza-global-radio',
        name: 'Ibiza Global Radio',
        genre: 'dance',
        genreLabel: 'EDM & HOUSE MUSIC',
        description: 'Diretamente de Ibiza (Espanha). A emissora de música eletrônica mais famosa do planeta.',
        url: 'https://stream.ibizaglobalradio.com/ibizaglobalradio.mp3',
        fallbackUrl: 'https://ice1.somafm.com/beatblender-128-mp3',
        color: '#00f2fe',
        colorEnd: '#ff007f',
        icon: 'fa-solid fa-bolt',
        track: 'Live DJs from Ibiza, House & Techno'
    },
    {
        id: 'alpha-fm',
        name: 'Alpha FM 101.7',
        genre: 'chill',
        genreLabel: 'MPB & CONTEMPORÂNEO',
        description: 'Música boa e elegante. MPB de qualidade, Pop Adulto, Soul e românticas inesquecíveis.',
        url: 'https://alphafm.crossradio.com.br/stream/1',
        fallbackUrl: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
        color: '#a855f7',
        colorEnd: '#ec4899',
        icon: 'fa-solid fa-heart',
        track: 'Clássicos, MPB & Pop Elegante'
    },
    {
        id: 'somafm-groove-salad',
        name: 'SomaFM Groove Salad (EUA)',
        genre: 'chill',
        genreLabel: 'LO-FI & DOWNTEMPO',
        description: 'A lendária rádio de São Francisco. Sons ambientes e batidas Lo-Fi perfeitas para focar e programar.',
        url: 'https://ice1.somafm.com/groovesalad-128-mp3',
        fallbackUrl: 'https://play.streamafrica.net/lofiradio',
        color: '#10b981',
        colorEnd: '#06b6d4',
        icon: 'fa-solid fa-mug-hot',
        track: 'Chillout, Lo-Fi Beats & Ambient'
    },
    {
        id: 'radio-swiss-pop',
        name: 'Radio Swiss Pop HD',
        genre: 'pop',
        genreLabel: 'POP EUROPEU & GLOBAL',
        description: 'Transmissão da Suíça em qualidade cristalina HD 320kbps sem comerciais.',
        url: 'https://stream.srg-ssr.ch/m/rsp/mp3_128',
        fallbackUrl: 'https://ice1.somafm.com/poptron-128-mp3',
        color: '#3b82f6',
        colorEnd: '#8b5cf6',
        icon: 'fa-solid fa-compact-disc',
        track: 'Greatest Pop Songs of All Time'
    },
    {
        id: 'sertanejo-fm',
        name: 'Top Sertanejo Brasil',
        genre: 'pop',
        genreLabel: 'SERTANEJO & MODÃO',
        description: 'Do modão tradicional às músicas mais tocadas nas paradas do sertanejo universitário.',
        url: 'https://streaming01.zas.media:8000/sertanejo',
        fallbackUrl: 'https://stream.zeno.fm/pw483dak6bhvv',
        color: '#f97316',
        colorEnd: '#eab308',
        icon: 'fa-solid fa-hat-cowboy',
        track: 'Sertanejo Universitário & Modão'
    },
    {
        id: 'radio-swiss-jazz',
        name: 'Radio Swiss Jazz HD',
        genre: 'chill',
        genreLabel: 'JAZZ & BLUES',
        description: 'Jazz acústico refinado, Blues, Soul e instrumental 24 horas direto de Berna.',
        url: 'https://stream.srg-ssr.ch/m/rsj/mp3_128',
        fallbackUrl: 'https://ice1.somafm.com/secretagent-128-mp3',
        color: '#14b8a6',
        colorEnd: '#3b82f6',
        icon: 'fa-solid fa-saxophone',
        track: 'Classic Jazz, Blues & Acoustic Soul'
    },
    {
        id: 'somafm-defcon',
        name: 'SomaFM DEF CON Radio',
        genre: 'urban',
        genreLabel: 'CYBERPUNK & TRAP',
        description: 'Música e trilhas eletrônicas da maior conferência hacker do mundo em Las Vegas.',
        url: 'https://ice1.somafm.com/defcon-128-mp3',
        fallbackUrl: 'https://ice1.somafm.com/fluid-128-mp3',
        color: '#eab308',
        colorEnd: '#f43f5e',
        icon: 'fa-solid fa-vr-cardboard',
        track: 'Cyberpunk, Bass Music & Glitch'
    }
];
