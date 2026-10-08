# Belirli sütunları seçmek

Çoğu zaman tablonun tüm sütunlarına ihtiyacımız olmaz. İstediğimiz sütunları virgülle ayırarak yazabiliriz:

```sql
SELECT CustomerName, City FROM customers;
```

Bu sorgu yalnızca müşteri adını ve şehrini döndürür. Sütunlar, sorguda yazdığınız sırayla gelir.

## Göreviniz

1. `important.sql` dosyasını açın ve yukarıdaki sorguyu çalıştırın.
2. Ardından sorguyu değiştirerek müşterilerin **ülkesini** ve **posta kodunu** listeleyin:

```sql
SELECT CustomerName, Country, PostalCode FROM customers;
```

## Sütunlara takma ad vermek

`AS` ile bir sütuna sonuçta görünecek farklı bir ad verebilirsiniz:

```sql
SELECT CustomerName AS Musteri, City AS Sehir FROM customers;
```

> Sadece ihtiyaç duyduğunuz sütunları seçmek, büyük tablolarda sorguların daha hızlı çalışmasını sağlar.
