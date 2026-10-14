# ORDER BY ve LIMIT

## Sıralama

`ORDER BY` sonuçları bir veya daha fazla sütuna göre sıralar. Varsayılan sıralama artandır (`ASC`); azalan sıralama için `DESC` kullanılır.

```sql
SELECT ProductName, Price FROM products
ORDER BY Price DESC;
```

Birden fazla sütuna göre de sıralayabilirsiniz. Aşağıdaki sorgu müşterileri önce ülkeye, aynı ülkedekileri de ada göre sıralar:

```sql
SELECT CustomerName, Country FROM customers
ORDER BY Country ASC, CustomerName ASC;
```

## Sonuç sayısını sınırlamak

`LIMIT`, döndürülecek satır sayısını sınırlar. "En pahalı 5 ürün" gibi sorular için idealdir:

```sql
SELECT ProductName, Price FROM products
ORDER BY Price DESC
LIMIT 5;
```

## Göreviniz

En **ucuz** 3 ürünün adını ve fiyatını listeleyin.
