# Dosya izinleri

Linux'ta her dosyanın bir **sahibi**, bir **grubu** ve üç izin seti vardır.

```bash
ls -l
```

Örnek çıktı:

```text
-rw-r--r-- 1 root root 42 Oct  7 12:00 simple.sql
```

| Karakterler | Kime ait? | Anlamı |
| --- | --- | --- |
| `rw-` | Sahip | okuma + yazma |
| `r--` | Grup | yalnızca okuma |
| `r--` | Diğerleri | yalnızca okuma |

`r` = okuma (4), `w` = yazma (2), `x` = çalıştırma (1).

## İzinleri değiştirmek

```bash
echo 'echo "gizli bilgi"' > gizli.sh
ls -l gizli.sh

chmod 700 gizli.sh   # sadece sahip: okuma + yazma + çalıştırma
ls -l gizli.sh
./gizli.sh
```

`700` = sahip için `4+2+1`, grup ve diğerleri için `0`.

## Yaygın hatalar

- `chmod 777` herkese her yetkiyi verir; neredeyse hiçbir zaman doğru çözüm değildir.
- Parola veya anahtar içeren dosyalar (`~/.ssh/id_rsa` gibi) yalnızca sahibi tarafından okunabilmelidir (`600`).

## Göreviniz

Bir `notlar.txt` dosyası oluşturun ve izinlerini **yalnızca sahibin okuyup yazabileceği** şekilde ayarlayın. `ls -l` ile doğrulayın.
