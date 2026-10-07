# SQL nedir?

SQL (Structured Query Language), ilişkisel veritabanlarıyla konuşmak için kullanılan standart dildir. Bir uygulamadaki kullanıcılar, siparişler veya ürünler gibi veriler genellikle **tablolarda** saklanır ve SQL bu tablolardaki verileri okumamızı, eklememizi, güncellememizi ve silmemizi sağlar.

## Tablo, satır ve sütun

Bir tabloyu bir elektronik tablo sayfası gibi düşünebilirsiniz:

| Kavram | Açıklama | Örnek |
| --- | --- | --- |
| Tablo | Aynı türdeki kayıtların bulunduğu yapı | `customers` |
| Sütun | Her kaydın sahip olduğu bir alan | `CustomerName`, `City` |
| Satır | Tek bir kayıt | *Alfreds Futterkiste* müşterisi |

## Bu eğitimdeki örnek veritabanı

Sanal makinenizde **w3schools** adlı hazır bir veritabanı çalışıyor. İçinde bir gıda toptancısına ait şu tablolar var:

- `customers` – müşteriler
- `orders` ve `order_details` – siparişler ve sipariş kalemleri
- `products`, `categories`, `suppliers` – ürünler, kategoriler ve tedarikçiler
- `employees`, `shippers` – çalışanlar ve kargo firmaları

## Çalışma alanını tanıyın

- **Sol tarafta** kod editörü ve dosyalarınız var. `.sql` uzantılı bir dosyaya sorgunuzu yazın.
- **Çalıştır** düğmesi seçili dosyadaki sorguyu veritabanında çalıştırır.
- Sonuçlar sağdaki **Çıktılar** sekmesinde tablo olarak görünür.
- **Terminal** sekmesi sanal makinenizdeki komut satırını açar.

> İpucu: Tablo adları büyük/küçük harfe duyarlıdır. Bu veritabanında tüm tablo adları küçük harflidir: `customers`, `orders`, `products`...
