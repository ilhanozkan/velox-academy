# Web nasıl çalışır?

Tarayıcınıza bir adres yazdığınızda arka planda kısa bir konuşma gerçekleşir:

1. **Tarayıcı (istemci)**, adresi bir IP adresine çevirir (DNS).
2. O IP adresindeki **sunucuya** bir HTTP isteği gönderir: `GET /index.html`
3. Sunucu bir **HTTP yanıtı** döndürür: durum kodu (`200 OK`), başlıklar ve içerik.
4. Tarayıcı gelen HTML'i okur, gerekli CSS, JavaScript ve görselleri ister ve sayfayı çizer.

## Sayfanın üç katmanı

| Teknoloji | Görevi |
| --- | --- |
| **HTML** | İçerik ve yapı: başlıklar, paragraflar, bağlantılar |
| **CSS** | Görünüm: renkler, yazı tipleri, yerleşim |
| **JavaScript** | Davranış: tıklamalara tepki, veri çekme, etkileşim |

## Sık görülen HTTP durum kodları

| Kod | Anlamı |
| --- | --- |
| `200` | Başarılı |
| `301` / `302` | Kalıcı / geçici yönlendirme |
| `404` | Bulunamadı |
| `500` | Sunucu hatası |

## Deneyin

Sağdaki **Terminal** sekmesini açın ve bir web sunucusuna kendiniz istek gönderin:

```bash
curl -I https://example.com
```

`-I` parametresi yalnızca yanıt başlıklarını gösterir. İlk satırda durum kodunu görebilirsiniz.
