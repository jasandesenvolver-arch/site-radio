package br.com.studiofm.radio;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundRadio")
public class BackgroundRadioPlugin extends Plugin {
    private static final String PREFS = "background_radio";
    private static final String KEY_ARMED = "armed";
    private static final String KEY_URL = "url";
    private static final String KEY_TITLE = "title";

    @PluginMethod
    public void arm(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.trim().isEmpty()) {
            call.reject("URL da rádio não informada");
            return;
        }
        preferences(getContext()).edit()
                .putBoolean(KEY_ARMED, true)
                .putString(KEY_URL, url)
                .putString(KEY_TITLE, call.getString("title", "Rádio Studio FM"))
                .apply();
        call.resolve();
    }

    @PluginMethod
    public void disarm(PluginCall call) {
        disarm(getContext());
        call.resolve();
    }
    @PluginMethod
    public void start(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.trim().isEmpty()) {
            call.reject("URL da rádio não informada");
            return;
        }

        Intent intent = new Intent(getContext(), BackgroundRadioService.class);
        intent.setAction(BackgroundRadioService.ACTION_START);
        intent.putExtra(BackgroundRadioService.EXTRA_URL, url);
        intent.putExtra(BackgroundRadioService.EXTRA_TITLE, call.getString("title", "Rádio Studio FM"));
        getContext().startForegroundService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        stop(getContext());
        call.resolve();
    }

    public static void startIfArmed(Context context) {
        SharedPreferences prefs = preferences(context);
        if (!prefs.getBoolean(KEY_ARMED, false)) return;
        String url = prefs.getString(KEY_URL, null);
        if (url == null || url.isEmpty()) return;
        Intent intent = new Intent(context, BackgroundRadioService.class);
        intent.setAction(BackgroundRadioService.ACTION_START);
        intent.putExtra(BackgroundRadioService.EXTRA_URL, url);
        intent.putExtra(BackgroundRadioService.EXTRA_TITLE, prefs.getString(KEY_TITLE, "Rádio Studio FM"));
        context.startForegroundService(intent);
    }

    public static void disarm(Context context) {
        preferences(context).edit().putBoolean(KEY_ARMED, false).apply();
        stop(context);
    }

    public static void stop(Context context) {
        Intent intent = new Intent(context, BackgroundRadioService.class);
        intent.setAction(BackgroundRadioService.ACTION_STOP);
        context.startService(intent);
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
}
