# Sözlüklerle gruplama

Sözlükler (`dict`) anahtar–değer çiftleri tutar ve verileri bir kategoriye göre gruplamak için idealdir.

```python
urun = {"ad": "Kahve", "kategori": "İçecek", "fiyat": 85}
print(urun["ad"], urun["fiyat"])
```

## Kayıt listesi

Gerçek veriler genellikle sözlüklerden oluşan bir listedir (bir tablonun satırları gibi):

```python
siparisler = [
    {"sehir": "İstanbul", "tutar": 450},
    {"sehir": "Ankara", "tutar": 120},
    {"sehir": "İstanbul", "tutar": 300},
    {"sehir": "İzmir", "tutar": 210},
    {"sehir": "Ankara", "tutar": 380},
]
```

## Şehirlere göre toplam tutar

```python
toplamlar = {}

for siparis in siparisler:
    sehir = siparis["sehir"]
    toplamlar[sehir] = toplamlar.get(sehir, 0) + siparis["tutar"]

for sehir, toplam in sorted(toplamlar.items(), key=lambda x: x[1], reverse=True):
    print(f"{sehir:10} {toplam:>6} TL")
```

Bu, SQL'deki `GROUP BY sehir` ile `SUM(tutar)` işleminin Python karşılığıdır.

## Göreviniz

Aynı veride her şehir için **sipariş sayısını** ve **ortalama tutarı** hesaplayıp yazdırın.
