# GROUP BY ve HAVING

`GROUP BY`, aynı değere sahip satırları gruplar ve toplama fonksiyonlarını her grup için ayrı ayrı hesaplar.

## Ülkelere göre müşteri sayısı

```sql
SELECT Country, COUNT(*) AS MusteriSayisi
FROM customers
GROUP BY Country
ORDER BY MusteriSayisi DESC;
```

## HAVING ile grupları filtrelemek

`WHERE` satırları gruplamadan **önce**, `HAVING` ise grupları gruplamadan **sonra** filtreler. Toplama fonksiyonlarının sonucuna göre filtrelemek için `HAVING` kullanılır:

```sql
SELECT Country, COUNT(*) AS MusteriSayisi
FROM customers
GROUP BY Country
HAVING COUNT(*) > 5
ORDER BY MusteriSayisi DESC;
```

## Göreviniz

Her kategorideki ürün sayısını ve ortalama fiyatı listeleyin; yalnızca **10'dan fazla ürünü** olan kategorileri gösterin.

> İpucu: `products` tablosunu `CategoryID` sütununa göre gruplayın.
