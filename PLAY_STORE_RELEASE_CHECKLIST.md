# Guverte Play Store Yayin Kontrol Listesi

Bu liste her kapali test ve production surumunden once tamamlanir. Gercek satin alma testleri lisansli tester hesabi ve Play Store uzerinden yuklenen build ile yapilir.

## Gercek cihaz matrisi

- Android 8-10 dusuk bellekli telefon: Performans profili, dikey ve yatay.
- Android 11-13 orta sinif telefon: Dengeli profil, kayit ve geri yukleme.
- Android 14-16 guncel telefon: Yuksek profil, izinler ve geri tusu.
- 7-11 inc tablet: yatay yerlesim, harita, cihaz yakinlastirma ve dialog kaydirma.
- Dar ekran: karakter olusturma, konusma balonu, secenekler ve tester paneli.

Her cihazda `Options > Yayin Testi / Geri Bildirim` calistirilir; olusan JSON raporu test kaydina eklenir.

## Satin alma testi

- `premium_full_pack`: satin al, premium gemi ve operasyonlari ac, uygulamayi kapat/ac.
- `remove_ads`: satin al, interstitial isteklerinin engellendigini dogrula.
- Geri Yukle: uygulama verisini temizledikten sonra iki urunu ayri ayri geri yukle.
- Iptal/beklemede: erisim acilmamali ve arayuz net mesaj vermeli.
- Test karti ile basarisiz odeme: oyun kilitlenmemeli, kayit bozulmamali.
- Play Console urunleri aktif, uygulama kimligi `com.captainemo.guverte` ile ayni olmali.

## Kayit ve kurtarma

- Manuel kaydet, uygulamayi kapat, Devam Et ile ayni sahneye don.
- Ana kaydi bozma senaryosunda Otomatik Yedegi Kurtar calismali.
- JSON Disa Aktar ve Ice Aktar akisi ayni sahne/statlari getirmeli.
- Kaydi Sil ana, yedek ve kurtarma kopyalarini birlikte silmeli.

## Reklam ve izin

- UMP gizlilik formu gerekli bolgelerde reklamdan once acilir.
- Reklam yalniz dogal gecislerde gosterilir; sahne kararini bolmez.
- `remove_ads` aktifken yeni reklam yuklenmez veya gosterilmez.
- Cocuklara yonelik olmayan hedef kitle ve Data Safety cevaplari uygulamayla tutarlidir.

## Kapali test

- En az bir yeni oyuncu ilk 10 dakikayi yardimsiz tamamlar.
- Bir tester dikey, biri yatay, biri tablet akisini dener.
- Her hata icin kategori, tekrar adimlari ve Yayin Testi raporu eklenir.
- Crash/ANR, Android Vitals ve tester geri bildirimleri production oncesi incelenir.

## Magaza ve yayin

- `store-listing/tr-TR.md` ve `store-listing/en-US.md` metinleri Play Console ile aynidir.
- Telefon ekran goruntuleri: ana menu, karakter, canli sahne, ECDIS, radar, kariyer.
- Tablet ekran goruntuleri: harita, cihaz merkezi ve sinematik sahne.
- Privacy Policy URL erisilebilir; reklam, satin alma, fotograf ve yerel tanilama aciklanir.
- `versionCode` onceki yuklemeden buyuktur.
- `npm.cmd test` ve `gradlew lintRelease bundleRelease` basarilidir.
- AAB dogru upload key ile imzalanmistir; SHA-1 Play Console beklenen sertifikayla aynidir.
