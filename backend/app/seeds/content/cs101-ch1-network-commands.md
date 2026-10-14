# Terminalde ağ komutları

Sağdaki **Terminal** sekmesini açın. Aşağıdaki komutları sırayla çalıştırıp çıktıları inceleyin.

## Makinenin adı ve IP adresleri

```bash
hostname
hostname -I
```

## Ağ arayüzleri

```bash
ip addr show
```

`lo` arayüzü *loopback*'tir (`127.0.0.1`). Diğer arayüzler makinenin gerçek ağ bağlantılarıdır.

## Bağlantıyı test etmek

```bash
ping -c 3 127.0.0.1
```

`-c 3` yalnızca üç paket gönderir. Her satırdaki `time=` değeri gidiş-dönüş süresidir.

## Dinlenen portlar

```bash
ss -tuln
```

| Parametre | Anlamı |
| --- | --- |
| `-t` / `-u` | TCP / UDP soketleri |
| `-l` | Yalnızca dinleyen soketler |
| `-n` | Port numaralarını isim yerine sayı olarak göster |

Çıktıda `:3306` (MySQL) ve `:9000` (bu çalışma alanının bağlandığı servis) portlarını bulun.

> Güvenlik notu: Sadece `127.0.0.1` üzerinde dinleyen bir servise dışarıdan erişilemez; `0.0.0.0` üzerinde dinleyen bir servis ise tüm ağ arayüzlerine açıktır.
