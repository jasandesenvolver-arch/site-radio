package br.com.studiofm.radio;

import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;

@CapacitorPlugin(name = "AppShare")
public class AppSharePlugin extends Plugin {
    @PluginMethod
    public void shareApk(PluginCall call) {
        try {
            File sourceApk = new File(getContext().getApplicationInfo().sourceDir);
            File sharedApk = new File(getContext().getCacheDir(), "radio-studio-fm.apk");
            copyFile(sourceApk, sharedApk);

            Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    sharedApk
            );
            Intent send = new Intent(Intent.ACTION_SEND)
                    .setType("application/vnd.android.package-archive")
                    .putExtra(Intent.EXTRA_STREAM, apkUri)
                    .putExtra(Intent.EXTRA_TEXT, call.getString("text", "Instale o app Rádio Studio FM para Android."))
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            getActivity().startActivity(Intent.createChooser(send, "Enviar aplicativo Rádio Studio FM"));
            call.resolve();
        } catch (Exception error) {
            call.reject("Não foi possível preparar o APK para compartilhamento", error);
        }
    }

    private void copyFile(File source, File destination) throws Exception {
        try (FileInputStream input = new FileInputStream(source);
             FileOutputStream output = new FileOutputStream(destination)) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = input.read(buffer)) != -1) {
                output.write(buffer, 0, bytesRead);
            }
        }
    }
}
