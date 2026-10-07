# AND, OR ve NOT

Birden fazla koşulu mantıksal operatörlerle birleştirebilirsiniz.

## AND – tüm koşullar doğru olmalı

```sql
SELECT * FROM customers
WHERE Country = 'Germany' AND City = 'Berlin';
```

## OR – koşullardan biri yeterli

```sql
SELECT * FROM customers
WHERE City = 'Berlin' OR City = 'London';
```

## NOT – koşulu tersine çevirir

```sql
SELECT * FROM customers
WHERE NOT Country = 'USA';
```

## Parantezlerle gruplama

`AND`, `OR`'dan önce değerlendirilir. Niyetinizi açıkça belirtmek için parantez kullanın:

```sql
SELECT CustomerName, City, Country FROM customers
WHERE Country = 'Spain' AND (City = 'Madrid' OR City = 'Barcelona');
```

## Göreviniz

Ülkesi `'Germany'` **veya** `'France'` olan, ancak şehri `'Paris'` **olmayan** müşterileri listeleyin.
