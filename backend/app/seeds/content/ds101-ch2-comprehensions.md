# Liste üreteçleriyle filtreleme

Liste üreteçleri (*list comprehension*) bir listeden yeni bir liste üretmenin kısa ve okunaklı yoludur.

```python
sayilar = [3, 8, 15, 4, 23, 42, 16]

kareler = [n * n for n in sayilar]
ciftler = [n for n in sayilar if n % 2 == 0]

print(kareler)
print(ciftler)
```

## Veri temizleme örneği

Ham veriler çoğu zaman eksik veya hatalı değer içerir:

```python
ham = ["12", "7", "", "abc", "30", None, "18"]

temiz = [int(x) for x in ham if x and x.isdigit()]
print(temiz)              # [12, 7, 30, 18]
print(sum(temiz) / len(temiz))
```

## Sözlük üreteçleri

```python
fiyatlar = {"kalem": 15, "defter": 45, "çanta": 650}
kdvli = {urun: round(fiyat * 1.2, 2) for urun, fiyat in fiyatlar.items()}
print(kdvli)
```

## Göreviniz

Önceki dersteki `siparisler` listesinden yalnızca tutarı 200 TL'nin üzerinde olan siparişlerin şehirlerini, **tekrarsız** olarak (ipucu: `set`) listeleyin.

> Bu dersi tamamladığınızda **Veri Düzenleyici** başarımını kazanırsınız.
