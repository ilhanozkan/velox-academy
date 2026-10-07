# Sık kullanılan etiketler

## Başlıklar ve metin

```html
<h1>En önemli başlık</h1>
<h2>Alt başlık</h2>
<p>Bir paragraf. <strong>Kalın</strong> ve <em>vurgulu</em> metin.</p>
```

Sayfada yalnızca bir `<h1>` kullanın; başlık seviyelerini atlamayın (h1 → h2 → h3).

## Listeler

```html
<ul>
  <li>Sırasız liste öğesi</li>
</ul>
<ol>
  <li>Birinci adım</li>
  <li>İkinci adım</li>
</ol>
```

## Bağlantılar ve görseller

```html
<a href="/egitimler">Eğitimlere git</a>
<img src="logo.png" alt="Velox logosu" />
```

`alt` metni görmeyen kullanıcılar ve görsel yüklenemediğinde gösterilir; her görselde mutlaka kullanın.

## Anlamsal (semantik) etiketler

`<div>` yerine anlam taşıyan etiketler tercih edin. Hem arama motorları hem ekran okuyucular sayfanızı daha iyi anlar:

| Etiket | Kullanım |
| --- | --- |
| `<header>` | Sayfa veya bölüm başlığı |
| `<nav>` | Gezinme bağlantıları |
| `<main>` | Sayfanın ana içeriği |
| `<section>` / `<article>` | İçerik bölümleri |
| `<footer>` | Alt bilgi |

## Göreviniz

`index.html` dosyanıza bir `<nav>`, üç öğeli bir `<ul>` listesi ve `alt` metni olan bir `<img>` ekleyin.
