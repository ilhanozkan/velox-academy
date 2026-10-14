# WHERE ile filtreleme

`WHERE` ifadesi, yalnızca belirli bir koşulu sağlayan satırları getirmek için kullanılır.

```sql
SELECT * FROM customers
WHERE Country = 'Germany';
```

Bu sorgu Almanya'daki 11 müşteriyi döndürür. Metin değerleri tek tırnak (`'...'`) içinde yazılır, sayılar ise tırnaksız:

```sql
SELECT * FROM products
WHERE Price > 50;
```

## Karşılaştırma operatörleri

| Operatör | Anlamı | Örnek |
| --- | --- | --- |
| `=` | Eşit | `Country = 'Mexico'` |
| `<>` | Eşit değil | `Country <> 'USA'` |
| `>` / `<` | Büyük / küçük | `Price > 20` |
| `>=` / `<=` | Büyük-eşit / küçük-eşit | `Price <= 10` |
| `BETWEEN` | Aralıkta | `Price BETWEEN 10 AND 20` |
| `IN` | Listedeki değerlerden biri | `Country IN ('France', 'Spain')` |

## Göreviniz

Fiyatı 10 ile 20 arasında olan ürünlerin adını ve fiyatını listeleyin.

> İpucu: `SELECT ProductName, Price FROM products WHERE Price BETWEEN 10 AND 20;`
