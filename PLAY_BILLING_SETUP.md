# Google Play Billing Kurulum Kontrol Listesi

Bu oyunda kod tarafinda kullanilan paket adi:

- `com.captainemo.guverte`

Kod tarafinda kullanilan satin alma urunleri:

- `premium_full_pack` - Premium paket - 75 TL
- `remove_ads` - Reklamlari kaldir - 50 TL

Paranin gelmesi icin Play Console tarafinda yapilmasi gerekenler:

1. Play Console hesabinda odeme profili / merchant hesabini tamamla.
2. Vergi, banka hesabi ve kimlik/dogrulama adimlarini bitir.
3. Uygulama paket adinin `com.captainemo.guverte` oldugunu kontrol et.
4. Para ile satilan iki urunu `In-app products` alaninda olustur:
   - Product ID: `premium_full_pack`
   - Product ID: `remove_ads`
5. Urun tipleri tek seferlik satin alma olmali, abonelik degil.
6. Fiyatlari yerel para biriminde ayarla:
   - `premium_full_pack`: 75 TL
   - `remove_ads`: 50 TL
7. Iki urunu de `Active` durumuna getir.
8. Uygulamayi imzali AAB olarak Play Console'a yukle.
9. Internal testing track olustur ve test kullanicilarini ekle.
10. Test kullanicisi cihazda Play Store hesabiyla oturum acsin.
11. Oyunda Premium ekranindan `Play urun kontrol` dugmesine bas:
    - Iki urun bulunduysa kod, Play Console urunlerini gorebiliyor demektir.
    - Bir urun bulunmuyorsa Product ID, paket adi, test track veya urun aktifligi hatalidir.
12. Satin alma testinden sonra Play Console siparis gecmisinde order gorunmeli.

Not:

- Kod parayi direkt banka hesabina gondermez. Para akisi Google Play tarafindan yonetilir.
- Kodun gorevi Google Play Billing ekranini acmak, satin almayi almak, purchase token'i acknowledge etmek ve oyunda entitlement acmaktir.
- Banka hesabina odeme gecmesi Play Console odeme profili ve Google'in odeme takvimi ile olur.
