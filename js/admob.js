(function () {
    'use strict';

    // O banner só é ativado dentro do APK/iOS criado com Capacitor.
    // O ID abaixo é o banner de teste oficial do Google; nunca publique com ele.
    const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

    async function initializeAdMob() {
        const AdMob = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
        if (!AdMob) return;

        try {
            await AdMob.initialize({ initializeForTesting: true });
            // O banner nativo de teste captura os toques da WebView neste aparelho.
            // Mantemos o SDK pronto e removemos qualquer banner anterior até inserir
            // o formato de anúncio em uma área que não bloqueie os controles.
            await AdMob.removeBanner();
        } catch (error) {
            console.warn('AdMob não pôde iniciar:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', initializeAdMob);
})();
