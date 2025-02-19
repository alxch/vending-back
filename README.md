# ILITEK

```bash
sudo nano /usr/share/X11/xorg.conf.d/40-libinput.conf

Section "InputClass"
	Identifier "ILITEK ILITEK-TP"
	MatchProduct "ILITEK ILITEK-TP"
	MatchIsTouchscreen "on"
	Driver "libinput"
	Option "TransformationMatrix" "0 1 0 -1 0 1 0 0 1"
#	Option "SwapAxes" "on"
EndSection
```

# Setup AP
```
Password for AP and for system user.
User: VM00001
Pass: SWG*admin
```

# Node
```bash
curl -sL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

# Services
```bash
sudo nano /lib/systemd/system/vending.service

[Unit]
Description=Vending
After=multi-user.target

[Service]
ExecStart=/home/alex/vending/release/index.js

[Install]
WantedBy=multi-user.target

###

sudo nano /lib/systemd/system/nodogsplash.service
[Unit]
Description=Nodogsplash
After=multi-user.target

[Service]
ExecStart=/usr/bin/nodogsplash -f

[Install]
WantedBy=multi-user.target
```

# Log
```bash
journalctl -u vending.service -n 100 -f
journalctl -u nodogsplash.service -n 100 -f
```

# Tailwind
```bash
https://v3.tailwindcss.com/docs/guides/create-react-app
```

# Nodogsplash
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
  FirewallRule allow tcp port 3001 to 10.42.0.1
  FirewallRule allow tcp port 22 to 10.42.0.1
}
FirewallRuleSet users-to-router {
  FirewallRule allow udp port 53       
  FirewallRule allow udp port 67
  FirewallRule allow tcp port 53       
  FirewallRule allow tcp port 3001 to 10.42.0.1
  FirewallRule allow tcp port 22 to 10.42.0.1
}

```