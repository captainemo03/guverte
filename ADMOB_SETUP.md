# Güverte AdMob Kurulum Kontrol Listesi

Kod tarafında interstitial reklam, UMP gizlilik izni ve `remove_ads` engeli hazırdır.

## Geliştirme Modu

Proje varsayılan olarak Google'ın resmi test kimliklerini kullanır:

- Test App ID: `ca-app-pub-3940256099942544~3347511713`
- Test Interstitial ID: `ca-app-pub-3940256099942544/1033173712`

Bu kimlikler gelir üretmez. Geliştirme sırasında canlı reklam kimliğine tıklama.

## AdMob Tarafında

1. AdMob hesabını ve ödeme profilini tamamla.
2. Android uygulamasını paket adıyla ekle: `com.captainemo.guverte`.
3. Bir interstitial reklam birimi oluştur.
4. AdMob App ID ve interstitial Ad Unit ID değerlerini kaydet.
5. Privacy & messaging alanında gereken bölgeler için izin mesajı oluştur.
6. Google Play Data Safety formunu bu gizlilik politikasıyla uyumlu doldur.

## Üretim Kimliklerini Derlemeye Verme

Gerçek kimlikleri komut satırında Gradle property olarak ver:

```powershell
.\gradlew.bat bundleRelease `
  -PADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY `
  -PADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
```

Kalıcı yerel kullanım için değerleri `android/gradle.properties` dosyasına ekleyebilirsin:

```properties
ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/ZZZZZZZZZZ
```

Gerçek kimlikleri herkese açık depoya göndermeden önce proje politikanı kontrol et.

## Reklam Gösterim Kuralları

- Reklam yalnızca ay sonu, kontrat sonu ve eğitim merkezi çıkışı gibi doğal aralarda istenir.
- İki reklam arasında native katmanda en az 90 saniye beklenir.
- Reklam hazır değilse oyun bekletilmez.
- UMP izin durumu reklam isteğinden önce kontrol edilir.
- `remove_ads` satın alması doğrulanınca JavaScript ve Android katmanı reklamı kapatır.
