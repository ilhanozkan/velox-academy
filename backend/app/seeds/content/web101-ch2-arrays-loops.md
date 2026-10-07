# Diziler ve döngüler

## Diziler

Diziler sıralı değer listeleridir:

```javascript
const diller = ["HTML", "CSS", "JavaScript"];

console.log(diller[0]);      // HTML
console.log(diller.length);  // 3

diller.push("SQL");          // sona ekle
```

## Döngüler

`for...of` dizinin her elemanını sırayla dolaşır:

```javascript
for (const dil of diller) {
  console.log(`${dil} öğreniyorum`);
}
```

## Dizi metotları

JavaScript'te döngü yazmadan da dizilerle çalışabilirsiniz:

```javascript
const fiyatlar = [120, 45, 300, 80];

const kdvli = fiyatlar.map((f) => f * 1.2);
const pahali = fiyatlar.filter((f) => f > 100);
const toplam = fiyatlar.reduce((acc, f) => acc + f, 0);

console.log(kdvli, pahali, toplam);
```

| Metot | Ne yapar? |
| --- | --- |
| `map` | Her elemanı dönüştürür, yeni dizi döndürür |
| `filter` | Koşulu sağlayan elemanları döndürür |
| `reduce` | Diziyi tek bir değere indirger |
| `find` | Koşulu sağlayan ilk elemanı döndürür |

## Göreviniz

Bir öğrenci notları dizisi oluşturun (`[78, 92, 55, 64, 88]`). Ortalamayı hesaplayın ve 60'ın altındaki notları ayrı bir dizide yazdırın.
