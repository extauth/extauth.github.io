🔑 QR-Auth: Passwordless LUKS Authorization via PWA

(still developing yet, but working already)

A secure, keyboard-free authentication framework for Linux systems, designed to eliminate the threat of hardware and visual keyloggers.
To test this system:
1. open the website [QRauth](https://alpxit.github.io/qrauth/) on your smartphone (you can install it as a web app to use it offline),
2. run one of commands below in linux console:
```sh
qrauth | sudo -S -v && sudo -i    # to open root
qrauth | passwd                   # to change password
```
3. then start scanning on the app page,
4. scan the QR code from the console, 
5. click the "Show QR code" button, 
6. and show it to the camera of the device on which you ran the script...
!! Please only use LUKS QR authentication if you know and understand how to recover your kernel boot in case of problems!!

💡 The Concept

This project is based on the principle of Out-of-Band (OOB) Authentication.
By removing the need to type passwords on a physical keyboard, we bypass hardware-level interception (keyloggers).
The system uses a smartphone as a trusted security token to deliver encrypted credentials directly to the target machine.

🚀 Current Features (v1.0)

- Progressive Web App (PWA): A cross-platform, offline-capable mobile interface for key management and scanning.
- Initramfs Integration: Custom hooks and scripts for the Linux boot process to unlock LUKS encrypted partitions without keyboard input.
- QR-Protocol v1: A robust data exchange mechanism using visual codes.
- TOTP Session Lock: Post-boot system locking that requires a TOTP code generated from the LUKS password hash.

🔐 How It Works (The QR Protocol)

1. Challenge: During the boot process, an initramfs script generates an ephemeral key pair and displays a QR code containing the Public Key and session metadata.
2. Scan: The user scans this QR code using the PWA on their smartphone.
3.  Authorize: If the device is recognized, the app retrieves the stored credentials. If not, the user enters the passphrase on the smartphone.
4. Encrypt & Respond: The PWA encrypts the passphrase with the machine's Public Key (using the age encryption protocol).
5. Data Transfer: The encrypted payload is converted into a sequence of dynamic QR codes displayed on the smartphone screen.
6. Unlock: The machine's camera captures the sequence, decrypts the payload with its Private Key, and passes the valid passphrase to cryptsetup.
Note: The protocol supports automatic passphrase rotation, allowing the LUKS key to be changed after every successful login for maximum security.

🛡 Security Highlights

- Anti-Keylogger: Physical keystroke interception is impossible as no data is entered via the keyboard.
- Asymmetric Encryption: Credentials are never transmitted in plain text; only encrypted payloads are exchanged.
- Offline Independence: The PWA is fully autonomous and does not require an internet connection, making it suitable for air-gapped or secure environments.

🗺 Roadmap

The project aims to become a multi-modal authentication standard.
Future updates will introduce additional transport channels while maintaining the core encryption protocol:
+ QR Codes (Visual Channel)
- USB (Direct smartphone-to-PC connection)
- Bluetooth Low Energy (BLE)
- Wi-Fi / Local Network
- Audio (Ultrasonic data transmission via mic/speakers)

📺 Demo

(Coming soon: A full video demonstration of the LUKS unlocking process will be linked here.)
