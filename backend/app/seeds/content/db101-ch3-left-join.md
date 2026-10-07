# LEFT JOIN

`LEFT JOIN`, soldaki tablonun **tüm** satırlarını getirir; sağdaki tabloda eşleşme yoksa o sütunlar `NULL` olur.

```sql
SELECT c.CustomerName, o.OrderID
FROM customers AS c
LEFT JOIN orders AS o ON c.CustomerID = o.CustomerID
ORDER BY c.CustomerName;
```

Hiç siparişi olmayan müşterilerin `OrderID` değeri `NULL` olarak görünür.

## Hiç sipariş vermemiş müşteriler

`LEFT JOIN` ile `IS NULL` kontrolünü birleştirerek eşleşmeyen kayıtları bulabiliriz:

```sql
SELECT c.CustomerName, c.Country
FROM customers AS c
LEFT JOIN orders AS o ON c.CustomerID = o.CustomerID
WHERE o.OrderID IS NULL;
```

Bu sorgu hiç sipariş vermemiş 17 müşteriyi listeler.

## Göreviniz

Her müşterinin **kaç sipariş verdiğini** listeleyin; hiç siparişi olmayanlar `0` ile görünsün.

> İpucu: `COUNT(o.OrderID)` yalnızca `NULL` olmayan değerleri sayar. `GROUP BY c.CustomerID, c.CustomerName` ekleyin.

Tebrikler! Bu dersi bitirdiğinizde **Birleştirme Uzmanı** başarımını kazanırsınız.
