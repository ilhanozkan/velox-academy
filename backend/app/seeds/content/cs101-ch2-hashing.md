# Parolalar ve özet fonksiyonları

Parolalar veritabanında asla açık metin olarak saklanmamalıdır. Bunun yerine bir **özet (hash) fonksiyonundan** geçirilmiş halleri saklanır.

## Özet fonksiyonu nedir?

- Aynı girdi her zaman aynı çıktıyı üretir.
- Çıktıdan girdiyi geri elde etmek pratikte imkânsızdır.
- Girdideki küçük bir değişiklik çıktıyı tamamen değiştirir.

Terminalde deneyin:

```bash
echo -n "parola123" | sha256sum
echo -n "parola124" | sha256sum
```

Tek karakterlik farkın tamamen farklı özetler ürettiğine dikkat edin.

## Neden sadece SHA-256 yetmez?

SHA-256 çok **hızlıdır**; bu da saldırganın saniyede milyarlarca tahmin deneyebileceği anlamına gelir. Parolalar için bilinçli olarak **yavaş** ve **tuzlu** (*salted*) algoritmalar kullanılır:

| Algoritma | Parola için uygun mu? |
| --- | --- |
| MD5, SHA-1 | Hayır – kırılmış ve çok hızlı |
| SHA-256 | Tek başına hayır – çok hızlı |
| **bcrypt**, **scrypt**, **Argon2** | Evet – yavaş ve tuzlu |

Bu platform da kullanıcı parolalarını **bcrypt** ile saklar.

## Göreviniz

Aynı parolayı iki kez `sha256sum` ile özetleyin ve sonuçları karşılaştırın. Ardından bir saldırganın bu özet listesine sahip olsa bile bcrypt ile saklanan parolaları neden çok daha zor kırabileceğini kendi cümlelerinizle açıklayın.

> Bu dersi tamamladığınızda **Güvenlik Bilinci** başarımını kazanırsınız.
