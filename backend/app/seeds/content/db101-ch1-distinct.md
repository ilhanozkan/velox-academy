# Tekrarsız değerler: DISTINCT

Müşterilerin hangi ülkelerden geldiğini merak ediyoruz. Şu sorgu her müşteri için bir satır döndürür; aynı ülke defalarca tekrar eder:

```sql
SELECT Country FROM customers;
```

`DISTINCT` anahtar kelimesi tekrar eden değerleri eler:

```sql
SELECT DISTINCT Country FROM customers;
```

Sonuçta 21 farklı ülke görmelisiniz.

## Kaç farklı ülke var?

`DISTINCT`, `COUNT` fonksiyonuyla birlikte de kullanılabilir:

```sql
SELECT COUNT(DISTINCT Country) AS UlkeSayisi FROM customers;
```

## Göreviniz

Müşterilerin bulunduğu **farklı şehirleri** listeleyen bir sorgu yazıp çalıştırın.

> İpucu: `SELECT DISTINCT City FROM customers;`
