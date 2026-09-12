package br.com.studiofm.radio;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class BackgroundRadioService extends Service {
    public static final String ACTION_START = "br.com.studiofm.radio.START_BACKGROUND_RADIO";
    public static final String ACTION_STOP = "br.com.studiofm.radio.STOP_BACKGROUND_RADIO";
    public static final String EXTRA_URL = "streamUrl";
    public static final String EXTRA_TITLE = "stationTitle";

    private static final String CHANNEL_ID = "radio_playback";
    private static final int NOTIFICATION_ID = 2026;
    private static final int MAX_RECONNECT_ATTEMPTS = 3;
    private MediaPlayer player;
    private final Handler retryHandler = new Handler(Looper.getMainLooper());
    private String activeUrl;
    private int reconnectAttempts;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null || ACTION_STOP.equals(intent.getAction())) {
            retryHandler.removeCallbacksAndMessages(null);
            stopSelf();
            return START_NOT_STICKY;
        }

        String url = intent.getStringExtra(EXTRA_URL);
        String title = intent.getStringExtra(EXTRA_TITLE);
        if (url == null || url.isEmpty()) {
            stopSelf();
            return START_NOT_STICKY;
        }

        startForeground(NOTIFICATION_ID, notification(title));
        activeUrl = url;
        reconnectAttempts = 0;
        startStream();
        // Em caso de o sistema recriar o serviço, pede a repetição do Intent
        // com a URL atual em vez de reiniciar sem estação.
        return START_REDELIVER_INTENT;
    }

    private void startStream() {
        if (activeUrl == null || activeUrl.isEmpty()) {
            stopSelf();
            return;
        }
        releasePlayer();
        try {
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build());
            player.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(activeUrl);
            player.setOnPreparedListener(mediaPlayer -> {
                reconnectAttempts = 0;
                mediaPlayer.start();
            });
            player.setOnErrorListener((mediaPlayer, what, extra) -> {
                reconnectOrStop();
                return true;
            });
            player.prepareAsync();
        } catch (Exception error) {
            reconnectOrStop();
        }
    }

    private void reconnectOrStop() {
        releasePlayer();
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            stopSelf();
            return;
        }
        reconnectAttempts++;
        retryHandler.postDelayed(this::startStream, 2500L);
    }

    private Notification notification(String title) {
        NotificationManager manager = getSystemService(NotificationManager.class);
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Rádio em reprodução",
                NotificationManager.IMPORTANCE_LOW
        );
        manager.createNotificationChannel(channel);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getApplicationInfo().icon)
                .setContentTitle(title == null ? "Rádio Studio FM" : title)
                .setContentText("Rádio ao vivo em reprodução")
                .setOngoing(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();
    }

    private void releasePlayer() {
        if (player != null) {
            try {
                player.stop();
            } catch (IllegalStateException ignored) {
                // O player também pode ser liberado enquanto ainda prepara.
            }
            try {
                player.reset();
            } catch (IllegalStateException ignored) {
            }
            player.release();
            player = null;
        }
    }

    @Override
    public void onDestroy() {
        retryHandler.removeCallbacksAndMessages(null);
        releasePlayer();
        stopForeground(STOP_FOREGROUND_REMOVE);
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
