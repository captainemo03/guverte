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

## Onemli

Google Play'de oyun ici dijital icerik aciyorsan iyzico/PayTR gibi dis odeme kullanma. Google Play Billing kullan.
