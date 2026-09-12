package br.com.studiofm.radio;

import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugins personalizados precisam ser registrados antes de o
        // Capacitor criar a ponte JavaScript.
        registerPlugin(BackgroundRadioPlugin.class);
        registerPlugin(AppSharePlugin.class);
        super.onCreate(savedInstanceState);
        // O WebView ocupa a área toda. O CSS do aplicativo reserva uma faixa
        // pequena e controlada para a barra de status, sem sobrepor o logo.
        applyEdgeToEdgeTheme();
        clearLegacyWebCache();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Não parar aqui: alguns Androids chamam onResume ao bloquear a
        // tela. O JavaScript interrompe o serviço só ao voltar visível.
        applyEdgeToEdgeTheme();
    }

    @Override
    public void onPause() {
        // A atividade ainda está visível neste ponto, permitindo iniciar o
        // serviço de mídia antes das restrições de segundo plano do Android.
        BackgroundRadioPlugin.startIfArmed(getApplicationContext());
        super.onPause();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyEdgeToEdgeTheme();
        }
    }

    private void applyEdgeToEdgeTheme() {
        int appBackground = Color.rgb(7, 9, 19);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarContrastEnforced(false);

        View decor = getWindow().getDecorView();
        decor.setBackgroundColor(appBackground);
        int flags = decor.getSystemUiVisibility();
        flags |= View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
        flags |= View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
        flags |= View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        decor.setSystemUiVisibility(flags);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), decor);
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);
    }

    /**
     * O site usava um Service Worker. Em um APK ele não é necessário e podia
     * reabrir o HTML da versão anterior mesmo depois de uma atualização.
     */
    private void clearLegacyWebCache() {
        WebView webView = getBridge().getWebView();
        // Os arquivos do APK já são a fonte atual. Limpamos recursos antigos
        // sem chamar location.reload(), que era a causa da faixa/tela branca
        // logo depois de abrir o aplicativo.
        webView.clearCache(true);
        String script = "(async()=>{const registrations=await navigator.serviceWorker.getRegistrations();"
            + "await Promise.all(registrations.map(r=>r.unregister()));"
            + "const names=await caches.keys();await Promise.all(names.map(n=>caches.delete(n)));})().catch(console.warn);";
        webView.evaluateJavascript(script, null);
    }
}
