# HTML belgesinin yapısı

Her HTML sayfası aynı iskelete sahiptir:

```html
<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <title>İlk Sayfam</title>
  </head>
  <body>
    <h1>Merhaba Dünya!</h1>
    <p>Bu benim ilk web sayfam.</p>
  </body>
</html>
```

| Bölüm | Açıklama |
| --- | --- |
| `<!DOCTYPE html>` | Tarayıcıya modern HTML kullandığımızı söyler |
| `<html lang="tr">` | Belgenin kökü; `lang` ekran okuyucular için dili belirtir |
| `<head>` | Sayfa hakkında bilgiler: başlık, karakter seti, stiller |
| `<body>` | Kullanıcının gördüğü içerik |

## Etiketler ve öznitelikler

HTML **etiketlerden** oluşur. Çoğu etiketin bir açılışı ve kapanışı vardır: `<p>...</p>`. Etiketler **öznitelik** alabilir:

```html
<a href="https://velox.academy" target="_blank">Velox Academy</a>
```

Burada `href` ve `target` birer özniteliktir.

## Göreviniz

Terminalde kendi sayfanızı oluşturun:

```bash
cat > index.html <<'HTML'
<!DOCTYPE html>
<html lang="tr">
  <head><meta charset="UTF-8" /><title>Hakkımda</title></head>
  <body><h1>Merhaba, ben bir web geliştiricisiyim!</h1></body>
</html>
HTML
```

Dosya, sol taraftaki dosya listesinde görünecektir. Açıp düzenleyebilirsiniz.
