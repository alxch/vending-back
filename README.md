Service:

```bash
$ cat /lib/systemd/system/vending.service
[Unit]
Description=Vending
After=multi-user.target

[Service]
ExecStart=/usr/bin/node /home/alex/vending-back/www

[Install]
WantedBy=multi-user.target
```

Log:
```bash
journalctl -u vending.service -b
```