Section "InputClass"
	Identifier "ILITEK ILITEK-TP"
	MatchProduct "ILITEK ILITEK-TP"
	MatchIsTouchscreen "on"
	Driver "libinput"
	Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
#	Option "SwapAxes" "on"
EndSection

Setup AP
Password for AP and for system user.
User: VM00001
Pass: SWG*admin

```bash
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

Service:
```bash
$ cat /lib/systemd/system/vending.service
[Unit]
Description=Vending
After=multi-user.target

[Service]
ExecStart=/usr/bin/node /home/alex/vending/release/

[Install]
WantedBy=multi-user.target
```

Log:
```bash
journalctl -u vending.service -b
```

Tailwind:
```css
@import "tailwindcss";
npx @tailwindcss/cli -i ./input.css -o ./output.css --watch
```

Nodogsplash:
```bash
sudo apt install git libmicrohttpd-dev build-essential
git clone https://github.com/nodogsplash/nodogsplash.git
cd ~/nodogsplash
make
sudo make install

sudo nano /etc/nodogsplash/nodogsplash.conf
  GatewayInterface wlan0
  WebRoot /home/alex/vending/release/setup
  FirewallRuleSet authenticated-users {
    FirewallRule block all
  }
  FirewallRuleSet preauthenticated-users {
    FirewallRule allow udp port 53
    FirewallRule allow udp port 67
    FirewallRule allow tcp port 53
    FirewallRule allow tcp port 80 to 10.42.0.1
    FirewallRule allow tcp port 22 to 10.42.0.1
  }
  FirewallRuleSet users-to-router {
    FirewallRule allow udp port 53       
    FirewallRule allow udp port 67
    FirewallRule allow tcp port 53       
    FirewallRule allow tcp port 80 to 10.42.0.1
    FirewallRule allow tcp port 22 to 10.42.0.1
  }

sudo nano /etc/rc.local
nodogsplash
exit 0
```