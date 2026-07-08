# Guverte Release Signing

Play Store release paketleri yerel upload key ile imzalanir.

## Yerel Dosyalar

- Keystore: `android/keystore/guverte-upload.jks`
- Gradle signing ayarlari: `android/key.properties`
- Key alias: `guverte-upload`

Keystore ve `key.properties` Git tarafindan bilerek dislanir. Bu iki dosyayi birlikte, sifreli ve en az iki guvenli konumda yedekle. Keystore'u veya parolasini kaybetmek sonraki Play Store guncellemelerini zorlastirabilir.

Parolayi kaynak koda, GitHub'a, ekran goruntusune veya destek mesajina ekleme.

## Release AAB Uretme

```powershell
cd android
.\gradlew.bat bundleRelease
```

Olusan dosya:

`android/app/build/outputs/bundle/release/app-release.aab`

Her yeni Play Store yuklemesinde `android/app/build.gradle` icindeki `versionCode` degeri onceki surumden buyuk olmalidir.
