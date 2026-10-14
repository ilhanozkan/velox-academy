# İlk sorgunuz

Bir tablodaki **tüm** verileri görmek için `SELECT *` kullanılır. Yıldız (`*`) "bütün sütunlar" anlamına gelir.

```sql
SELECT * FROM customers;
```

## Göreviniz

1. Sol taraftaki dosyalardan `simple.sql` dosyasını açın.
2. Dosyanın içeriğinin yukarıdaki sorguyla aynı olduğundan emin olun.
3. **Çalıştır** düğmesine basın.

**Çıktılar** sekmesinde 91 müşterinin listelendiği bir tablo görmelisiniz. Her satır bir müşteri, her sütun ise o müşterinin bir bilgisidir.

## Sorgunun parçaları

| Parça | Anlamı |
| --- | --- |
| `SELECT` | Hangi sütunları istediğimizi belirtir |
| `*` | Tüm sütunlar |
| `FROM customers` | Verinin hangi tablodan geleceği |
| `;` | Sorgunun sonu |

> SQL anahtar kelimeleri büyük/küçük harfe duyarlı değildir; `select` da çalışır. Okunabilirlik için anahtar kelimeleri büyük harfle yazmak yaygın bir alışkanlıktır.
