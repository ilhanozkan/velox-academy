# Toplama fonksiyonları

Toplama (aggregate) fonksiyonları birçok satırı tek bir değere indirger.

| Fonksiyon | Ne yapar? |
| --- | --- |
| `COUNT()` | Satır sayısı |
| `SUM()` | Toplam |
| `AVG()` | Ortalama |
| `MIN()` / `MAX()` | En küçük / en büyük değer |

## Örnekler

Kaç ürünümüz var?

```sql
SELECT COUNT(*) AS UrunSayisi FROM products;
```

Ortalama, en düşük ve en yüksek ürün fiyatı:

```sql
SELECT AVG(Price) AS Ortalama,
       MIN(Price) AS EnDusuk,
       MAX(Price) AS EnYuksek
FROM products;
```

Toplam kaç adet ürün sipariş edildi?

```sql
SELECT SUM(Quantity) AS ToplamAdet FROM order_details;
```

## Göreviniz

`CategoryID` değeri 1 olan (içecekler) ürünlerin **ortalama fiyatını** hesaplayın.

> İpucu: `WHERE` ile filtreleyip `AVG(Price)` kullanın.
