#!/bin/bash

echo "Installing dependencies..."
sudo apt update && sudo apt install -y keyutils age qrencode zbar-tools ffmpeg v4l-utils

echo "Configuring initramfs hooks..."

#sudo cp cryptkey-from-qrcode-hook /usr/share/initramfs-tools/hooks
sudo ln -s $(pwd)/cryptkey-from-qrcode-hook /etc/initramfs-tools/hooks/
#sudo cp cryptkey-from-qrcode /etc/initramfs-tools/scripts/local-top/
sudo ln -s $(pwd)/cryptkey-from-qrcode /usr/local/sbin/
sudo ln -s $(pwd)/qrauth /usr/local/sbin/

# /etc/default/grub  comment line #GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
# add GRUB_GFXMODE=1920x1080x24   (you best display resolution, to detect use xrandr)
# add GRUB_GFXPAYLOAD_LINUX=keep
# also for debug initramfs possible boot stop  GRUB_CMDLINE_LINUX_DEFAULT="break=init rd.break=init"   (exit will continue booting)

# add to /etc/crypttab  diskname UUID=... none luks,keyscript=/usr/local/sbin/cryptkey-from-qrcode,tries=2,initramfs

echo "Updating initramfs... this may take a moment."
update-initramfs -tuck all; update-grub2
