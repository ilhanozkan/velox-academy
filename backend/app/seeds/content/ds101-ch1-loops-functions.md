# Döngüler ve fonksiyonlar

## for döngüsü

```python
satislar = [120, 340, 90, 410, 275]

for satis in satislar:
    if satis > 200:
        print(f"{satis} TL - hedefin üzerinde")
    else:
        print(f"{satis} TL - hedefin altında")
```

Python'da bloklar girintiyle (genellikle 4 boşluk) belirlenir.

## enumerate ile sıra numarası

```python
for gun, satis in enumerate(satislar, start=1):
    print(f"{gun}. gün: {satis} TL")
```

## Fonksiyonlar

```python
def ortalama(degerler):
    """Bir sayı listesinin aritmetik ortalamasını döndürür."""
    return sum(degerler) / len(degerler)

print(f"Ortalama satış: {ortalama(satislar):.2f} TL")
```

Üç tırnak içindeki açıklama (*docstring*), fonksiyonun ne yaptığını belgelemenin standart yoludur.

## Göreviniz

`analiz.py` dosyasına, bir listedeki değerlerin **en büyük ile en küçük farkını** (açıklık / *range*) döndüren `aciklik` adlı bir fonksiyon yazın ve adım sayıları listenizle çalıştırın.
