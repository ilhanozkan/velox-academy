# DNS ve isim çözümleme

İnsanlar `example.com` gibi isimleri, bilgisayarlar ise IP adreslerini kullanır. **DNS** (Domain Name System) bu ikisi arasında çeviri yapan dağıtık bir rehberdir.

## Yerel isim çözümleme

DNS sunucusuna sormadan önce sistem `/etc/hosts` dosyasına bakar:

```bash
cat /etc/hosts
```

Bir ismin hangi adrese çözüldüğünü görmek için:

```bash
getent hosts localhost
```

## Hangi DNS sunucusu kullanılıyor?

```bash
cat /etc/resolv.conf
```

`nameserver` satırları makinenin sorgu gönderdiği DNS sunucularıdır.

## DNS ve güvenlik

| Saldırı | Açıklama |
| --- | --- |
| **DNS spoofing** | Sahte yanıtla kullanıcıyı başka bir sunucuya yönlendirmek |
| **hosts dosyası değişikliği** | Zararlı yazılımın `/etc/hosts`'a sahte kayıt eklemesi |
| **Typosquatting** | `gooogle.com` gibi benzer alan adları kaydetmek |

HTTPS, bağlandığınız sunucunun sertifikasını doğrulayarak bu saldırıların çoğuna karşı koruma sağlar.

## Göreviniz

`/etc/hosts` dosyasında `localhost` dışında bir kayıt var mı? Varsa hangi isim hangi adrese yönlendiriliyor?
