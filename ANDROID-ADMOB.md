# Android e AdMob

O projeto está configurado para gerar um app Android com Capacitor e exibir um banner AdMob de teste. Antes de publicar, substitua os dois IDs de teste pelos IDs criados no painel AdMob.

## Preparar o projeto

```powershell
npm install
npm run android:add
npm run android:sync
npm run android:open
```

No Android Studio, configure o SDK Android se solicitado e use **Build > Generate Signed Bundle / APK > Android App Bundle**. Publique o arquivo `.aab` na Google Play Console.

## IDs de produção

Substitua o App ID em `capacitor.config.ts` e o ID do banner em `js/admob.js`. Também altere `initializeForTesting` e `isTesting` para `false`.

O App ID deve ficar no `AndroidManifest.xml` gerado, dentro de `<application>`:

```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-SEU_APP_ID" />
```

Nunca publique com os IDs de teste. Para testar anúncios reais, cadastre o aparelho como dispositivo de teste na conta AdMob.
