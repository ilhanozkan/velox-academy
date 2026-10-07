# Fonksiyonlar

Fonksiyonlar, tekrar tekrar kullanabileceğimiz kod bloklarıdır.

## Fonksiyon tanımlamak

```javascript
function selamla(isim) {
  return `Merhaba, ${isim}!`;
}

console.log(selamla("Ada"));
```

## Ok (arrow) fonksiyonları

Daha kısa bir yazım şekli:

```javascript
const kare = (sayi) => sayi * sayi;

console.log(kare(4)); // 16
```

## Varsayılan parametreler

```javascript
const indirimliFiyat = (fiyat, oran = 0.1) => fiyat * (1 - oran);

console.log(indirimliFiyat(200));      // 180
console.log(indirimliFiyat(200, 0.25)); // 150
```

## Göreviniz

`merhaba.js` dosyasına, santigrat dereceyi fahrenhayta çeviren `celsiusToFahrenheit` adında bir fonksiyon yazın ve `0`, `37` ve `100` değerleri için sonucu yazdırın.

> İpucu: `F = C × 9 / 5 + 32`
