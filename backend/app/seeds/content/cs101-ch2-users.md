# Kullanıcılar ve gruplar

Linux çok kullanıcılı bir işletim sistemidir. Her işlem bir **kullanıcı** adına çalışır ve dosyalara erişim kullanıcının yetkilerine göre belirlenir.

## Kim olduğunuzu öğrenin

```bash
whoami
id
```

`id` çıktısındaki `uid` kullanıcı numaranızı, `groups` ise üye olduğunuz grupları gösterir. `uid=0` olan kullanıcı **root**'tur: sistemde her şeyi yapabilir.

## Sistemdeki kullanıcılar

```bash
cut -d: -f1,3,7 /etc/passwd
```

Her satır `kullanıcı:uid:kabuk` biçimindedir. `nologin` kabuğuna sahip hesaplar servis hesaplarıdır; bu hesaplarla oturum açılamaz.

## En az yetki ilkesi

> Her kullanıcıya ve servise yalnızca işini yapmaya yetecek kadar yetki verin.

- Günlük işleri root olarak yapmayın; gerektiğinde `sudo` kullanın.
- Servisleri ayrı, yetkisiz kullanıcılarla çalıştırın.
- Kullanılmayan hesapları kapatın.

## Göreviniz

Terminalde `id` komutunu çalıştırın. Hangi kullanıcıyla çalışıyorsunuz ve bu kullanıcı root yetkisine sahip mi?
