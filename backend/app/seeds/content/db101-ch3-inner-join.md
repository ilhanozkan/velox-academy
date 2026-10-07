# INNER JOIN

İlişkisel veritabanlarında veriler birden fazla tabloya bölünür. Örneğin `orders` tablosu müşterinin adını değil, yalnızca `CustomerID` değerini saklar. Müşteri adını görmek için iki tabloyu **birleştirmemiz** gerekir.

`INNER JOIN`, iki tabloda da eşleşmesi olan satırları getirir:

```sql
SELECT orders.OrderID, customers.CustomerName, orders.OrderDate
FROM orders
INNER JOIN customers ON orders.CustomerID = customers.CustomerID;
```

## Tablo takma adları

Uzun tablo adları yerine kısa takma adlar kullanmak sorguyu okunaklı yapar:

```sql
SELECT o.OrderID, c.CustomerName, o.OrderDate
FROM orders AS o
INNER JOIN customers AS c ON o.CustomerID = c.CustomerID
ORDER BY o.OrderDate
LIMIT 10;
```

## Üç tabloyu birleştirmek

Her siparişi, hangi kargo firmasıyla gönderildiğiyle birlikte listeleyelim:

```sql
SELECT o.OrderID, c.CustomerName, s.ShipperName
FROM orders AS o
INNER JOIN customers AS c ON o.CustomerID = c.CustomerID
INNER JOIN shippers AS s ON o.ShipperID = s.ShipperID;
```

## Göreviniz

Her ürünün adını, **kategori adıyla** (`categories.CategoryName`) birlikte listeleyin.
