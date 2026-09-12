package br.com.studiofm.radio;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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
        // Android recente força edge-to-edge. Deixamos o WebView preencher
        // também as barras, para o fundo escuro do app aparecer nelas.
        applyEdgeToEdgeTheme();
        clearLegacyWebCache();
    }

    @Override
    public void onResume() {
        super.onResume();
        BackgroundRadioPlugin.stop(getApplicationContext());
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
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            WebView webView = getBridge().getWebView();
            String script = "(async()=>{const key='studio-fm-native-cache-v2026.10';"
                + "if(localStorage.getItem(key))return;"
                + "const registrations=await navigator.serviceWorker.getRegistrations();"
                + "await Promise.all(registrations.map(r=>r.unregister()));"
                + "const names=await caches.keys();await Promise.all(names.map(n=>caches.delete(n)));"
                + "localStorage.setItem(key,'1');location.reload();})().catch(console.warn);";
            webView.evaluateJavascript(script, null);
            applyEdgeToEdgeTheme();
        }, 1200);
    }
}
