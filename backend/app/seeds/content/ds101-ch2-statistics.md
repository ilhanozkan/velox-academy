# Temel istatistikler

Bir veri setini tanımanın ilk adımı onu birkaç sayıyla özetlemektir. Python'un standart kütüphanesindeki `statistics` modülü bunun için yeterlidir.

```python
import statistics as st

notlar = [72, 85, 90, 66, 85, 78, 95, 58, 85, 70]

print("Ortalama :", st.mean(notlar))
print("Medyan   :", st.median(notlar))
print("Mod      :", st.mode(notlar))
print("Std. sapma:", round(st.stdev(notlar), 2))
```

| Ölçü | Ne anlatır? |
| --- | --- |
| **Ortalama** | Değerlerin toplamı / sayısı; uç değerlerden etkilenir |
| **Medyan** | Sıralanmış verinin ortasındaki değer; uç değerlere dayanıklıdır |
| **Mod** | En sık tekrar eden değer |
| **Standart sapma** | Değerlerin ortalamadan ne kadar uzaklaştığı |

## Uç değerin etkisi

Listeye tek bir yüksek değer eklemek ortalamayı belirgin şekilde değiştirir, medyanı ise neredeyse hiç değiştirmez:

```python
maaslar = [18_000, 21_000, 19_500, 22_000, 20_500]
print(st.mean(maaslar), st.median(maaslar))

maaslar.append(250_000)
print(st.mean(maaslar), st.median(maaslar))
```

## Göreviniz

`analiz.py` dosyanızdaki adım sayıları için ortalama, medyan ve standart sapmayı hesaplayın. Hangi ölçü haftanızı daha iyi özetliyor?
