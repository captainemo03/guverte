# Guverte Premium Kurulum Notu

Premium paket tek seferlik satin alma olarak tasarlanmistir.

## Urun Bilgisi

- Urun tipi: One-time product / Non-consumable
- Product ID: `premium_full_pack`
- Fiyat: `75 TL`
- Oyunda acilan paket: proje gemisi, kruvaziyer, arastirma gemisi, offshore/DP, buz seyri, cable/pipe layer, shuttle tanker ve ileri cihaz/3D operasyonlari

## Google Play Console Adimlari

1. Google Play Console'a gir.
2. Uygulamayi sec: `com.captainemo.guverte`
3. Monetize / Products / In-app products bolumune gir.
4. Yeni one-time product olustur.
5. Product ID alanina tam olarak `premium_full_pack` yaz.
6. Urun adini `Guverte Premium Paket` yap.
7. Aciklamaya premiumda acilan gemi ve operasyonlari yaz.
8. Fiyati Turkiye icin `75 TL` olarak ayarla.
9. Urunu aktif hale getir.
10. Test icin Play Console lisans test kullanicisi ekle.

## Play Console'da Takilirsan

Premium urun olusturamiyorsan genelde sebep su dort seyden biridir:

1. Odeme profili yoktur.
   - Play Console'da `Setup > Payments profile` veya `Monetize with Play` tarafinda odeme profili kurulmalidir.
   - Google senden sirket/kisi bilgisi, adres, vergi ve banka bilgisi isteyebilir.

2. Uygulama henuz Play Console'a AAB olarak yuklenmemistir.
   - Once `Release > Testing > Internal testing` bolumune gir.
   - Yeni release olustur.
   - `android/app/release/app-release.aab` veya yeni uretilen AAB dosyasini yukle.
   - Release'i internal testing'e gonder.

3. Urun aktif degildir.
   - `Monetize with Play > Products > In-app products` icinde `premium_full_pack` urunune gir.
   - Sag ustte veya sayfa sonunda `Activate` / `Etkinlestir` butonu varsa bas.
   - Sadece kaydetmek yetmez; aktif olmasi gerekir.

4. Ulke / fiyat eksiktir.
   - Fiyat alaninda Turkiye icin `75 TL` gir.
   - Uygulama ulke dagitiminda Turkiye acik olsun.

## En Kolay Test Sirasi

1. Play Console'da internal testing'e AAB yukle.
2. Test kullanicisi olarak kendi Gmail adresini ekle.
3. `premium_full_pack` urununu olustur.
4. Fiyat: `75 TL`
5. Urunu `Activate` et.
6. Telefonda oyunu Play Store internal test linkinden yukle.
7. Oyunda `75 TL Satin Al` butonuna bas.

Eger odeme ekraninda urun bulunamiyorsa once su ucunu kontrol et:

```text
Product ID ayni mi? premium_full_pack
Urun aktif mi?
Oyunu Play Store internal test surumunden mi yukledin?
```

## Kod Tarafi

Web tarafinda satin alma butonu hazir:

- `openPremiumPurchase()`
- `PREMIUM_PRODUCT_ID = 'premium_full_pack'`
- `PREMIUM_PRICE_LABEL = '75 TL'`

Android tarafinda Google Play Billing baglaninca `window.GuverteBilling.purchasePremium(productId)` fonksiyonu su sekilde sonuc dondurmelidir:

```js
{
  ok: true,
  purchaseToken: "google-play-purchase-token"
}
```

Bu sonuc gelince oyun `grantPremiumPackageFromPurchase("GP-" + purchaseToken)` ile premiumu acar.

Bu repo icinde Android koprusu hazirlandi:

- `android/app/src/main/java/com/captainemo/guverte/GuverteBillingBridge.java`
- `android/app/src/main/java/com/captainemo/guverte/MainActivity.java`
- Gradle dependency: `com.android.billingclient:billing`

Oyunda ayrica `Geri Yukle` butonu vardir. Bu buton Google Play satin alma gecmisini kontrol edip premiumu yeniden acar.

## Derleme Notu

Bu proje Capacitor 8 kullandigi icin Android derlemede JDK 21 gerekir. JDK 17 ile Gradle su hatayi verir:

```text
invalid source release: 21
```

Android Studio'da Gradle JDK ayarini JDK 21 yap veya sistemde `JAVA_HOME` degerini JDK 21'e goster.
Bu makinede Android Studio JBR su yolda bulundu:

```text
C:\Program Files\Android\Android Studio\jbr
```

Komut satirindan derlerken gerekirse:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat :app:compileDebugJavaWithJavac
```

## Onemli

Google Play'de oyun ici dijital icerik aciyorsan iyzico/PayTR gibi dis odeme kullanma. Google Play Billing kullan.
