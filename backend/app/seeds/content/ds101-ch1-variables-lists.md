# Değişkenler ve listeler

## Değişkenler

Python'da değişken tanımlamak için tip belirtmenize gerek yoktur:

```python
sehir = "İstanbul"      # str
nufus = 15_655_924      # int (alt çizgi okunabilirlik içindir)
yuzolcumu = 5_461.0     # float
buyuksehir = True       # bool

yogunluk = nufus / yuzolcumu
print(f"{sehir} nüfus yoğunluğu: {yogunluk:.1f} kişi/km²")
```

`f"..."` (f-string) metnin içine değişken ve ifade yerleştirmenizi sağlar; `:.1f` sayıyı tek ondalık basamakla biçimlendirir.

## Listeler

Listeler sıralı ve değiştirilebilir koleksiyonlardır. Veri biliminde bir sütundaki değerleri tutmak için sıkça kullanılır:

```python
sicakliklar = [21.5, 23.0, 19.8, 25.4, 22.1]

print(sicakliklar[0])     # ilk eleman
print(sicakliklar[-1])    # son eleman
print(sicakliklar[1:3])   # dilimleme: 2. ve 3. elemanlar
print(len(sicakliklar))   # eleman sayısı

sicakliklar.append(24.3)  # sona ekle
print(max(sicakliklar), min(sicakliklar))
```

## Göreviniz

`analiz.py` dosyasını açın. Haftanın günlük adım sayılarını bir listede tutun, toplam ve en yüksek adım sayısını yazdırın.
