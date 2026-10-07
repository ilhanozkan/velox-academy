# IP adresleri ve portlar

Ağdaki her cihazın bir **IP adresi** vardır. IP adresi bir binanın adresine, **port** ise o binadaki daire numarasına benzer: aynı makinede çalışan farklı servisler farklı portları dinler.

## IPv4 ve IPv6

| Sürüm | Örnek | Not |
| --- | --- | --- |
| IPv4 | `192.168.1.10` | 32 bit, ~4,3 milyar adres |
| IPv6 | `2001:db8::1` | 128 bit, neredeyse sınırsız adres |

## Özel ve genel adresler

Şu aralıklar yalnızca yerel ağlarda kullanılır (internette yönlendirilmez):

- `10.0.0.0/8`
- `172.16.0.0/12`
- `192.168.0.0/16`
- `127.0.0.1` – makinenin kendisi (*localhost*)

## İyi bilinen portlar

| Port | Servis |
| --- | --- |
| 22 | SSH (uzak terminal) |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 5432 | PostgreSQL |

Bir saldırgan için açık portlar, sistemdeki olası giriş kapılarıdır. Bu yüzden güvenlik denetimlerinin ilk adımlarından biri hangi portların dinlendiğini tespit etmektir.

## Göreviniz

Bu eğitimin sanal makinesinde bir MySQL veritabanı çalışıyor. Sizce hangi portu dinliyor? Bir sonraki derste terminalden doğrulayacağız.
