# Değişkenler ve veri tipleri

JavaScript tarayıcıda çalıştığı gibi sunucuda da (Node.js) çalışır. Sanal makinenizde `.js` dosyalarını **Çalıştır** düğmesiyle doğrudan çalıştırabilirsiniz.

## Değişken tanımlamak

```javascript
const ad = "Ada";        // değeri değişmeyecek
let yas = 28;            // değeri değişebilir
yas = yas + 1;

console.log(ad, yas);    // Ada 29
```

Modern JavaScript'te `var` yerine `const` ve `let` kullanılır. Varsayılan olarak `const` tercih edin; yalnızca değeri değişecekse `let` kullanın.

## Temel veri tipleri

| Tip | Örnek |
| --- | --- |
| `string` | `"merhaba"`, `'Velox'` |
| `number` | `42`, `3.14` |
| `boolean` | `true`, `false` |
| `undefined` | Değer atanmamış değişken |
| `null` | Bilinçli olarak "boş" |
| `object` | `{ ad: "Ada", yas: 28 }` |

`typeof` ile bir değerin tipini öğrenebilirsiniz:

```javascript
console.log(typeof "Velox"); // string
console.log(typeof 42);      // number
```

## Şablon metinler

Ters tırnak (`` ` ``) ile metnin içine değişken yerleştirebilirsiniz:

```javascript
const kurs = "Web Development 101";
console.log(`${kurs} eğitimine hoş geldiniz!`);
```

## Göreviniz

`merhaba.js` dosyasını açın, kendi adınızı ve şehrinizi değişkenlere atayıp şablon metinle ekrana yazdırın, ardından **Çalıştır**'a basın.
