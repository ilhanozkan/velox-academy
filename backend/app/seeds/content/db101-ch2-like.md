# LIKE ile desen arama

Tam eşleşme yerine bir **desene** uyan metinleri bulmak için `LIKE` kullanılır. İki joker karakter vardır:

| Joker | Anlamı |
| --- | --- |
| `%` | Sıfır veya daha fazla karakter |
| `_` | Tam olarak bir karakter |

## Örnekler

Adı "a" ile başlayan müşteriler:

```sql
SELECT CustomerName FROM customers
WHERE CustomerName LIKE 'a%';
```

Adında "or" geçen müşteriler:

```sql
SELECT CustomerName FROM customers
WHERE CustomerName LIKE '%or%';
```

Şehri "L" ile başlayıp tam 6 harf olan müşteriler (ör. *London*, *Lisboa*):

```sql
SELECT CustomerName, City FROM customers
WHERE City LIKE 'L_____';
```

## Göreviniz

Adı **"Chef"** kelimesini içeren ürünleri, fiyatına göre azalan sırada listeleyin.

> Bu bölümü tamamladığınızda **Filtre Ustası** başarımını kazanırsınız.
