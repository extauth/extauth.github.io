#!/bin/bash

echo "Installing dependencies..."
sudo apt update && sudo apt install -y age qrencode zbar-tools ffmpeg v4l-utils

echo "Configuring initramfs hooks..."

#sudo cp cryptkey-from-qrcode-hook /usr/share/initramfs-tools/hooks
sudo ln -s cryptkey-from-qrcode-hook /etc/initramfs-tools/hooks/
#sudo cp cryptkey-from-qrcode /etc/initramfs-tools/scripts/local-top/
sudo ln -s $(pwd)/cryptkey-from-qrcode /usr/local/sbin/
sudo ln -s $(pwd)/qrauth /usr/local/sbin/

echo "Updating initramfs... this may take a moment."
update-initramfs -tuck all; update-grub2
