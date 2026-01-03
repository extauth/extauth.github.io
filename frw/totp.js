/* based on https://github.com/wuyanxin/totp.js
*/
TOTP6 = {
  generateSecretKey: function(source, callback) {
    async function SHA256(data) {
      let hmac = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data.toString()));
      return Array.from(new Uint8Array(hmac)).map(val=>{return ('00' + val.toString(16)).slice(-2)}).join('');
    }
    let bin5base32= {
      '00000':'A', '00001':'B', '00010':'C', '00011':'D', '00100':'E', '00101':'F', '00110':'G', '00111':'H',
      '01000':'I', '01001':'J', '01010':'K', '01011':'L', '01100':'M', '01101':'N', '01110':'O', '01111':'P',
      '10000':'Q', '10001':'R', '10010':'S', '10011':'T', '10100':'U', '10101':'V', '10110':'W', '10111':'X',
      '11000':'Y', '11001':'Z', '11010':'2', '11011':'3', '11100':'4', '11101':'5', '11110':'6', '11111':'7'
    };
    SHA256(source).then(otpSHA256 => {
      let otpbin= '';
      for (let i= 0; i < otpSHA256.length; i++)
        otpbin += ('000' + parseInt(otpSHA256[i],16).toString(2)).slice(-4);
      //console.log(otpbin.length, otpbin)
      let OTPKEY= '';
      for (let i= 0; i < otpbin.length-5; i=i+5) {
        //console.log(otpbin.substring(i, i+5), bin5base32[otpbin.substring(i, i + 5)]);
        OTPKEY += bin5base32[otpbin.substring(i, i + 5)];
      }
      let secret = OTPKEY.substring(0,32);
      callback(secret, secret);
    });
  },
  generatePassword: function(len = 16) {
    const base32 = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
    let key = '';
    for (let i=1; i <= len; i++) key += base32[Math.floor(Math.random()*62)];
    return key;
  },
  generateBase32key: function(len = 32) {
    const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let key = base32[Math.floor(Math.random()*26)]; //first char must be LETTER
    for (let i=2; i <= len; i++) {
      key += base32[Math.floor(Math.random()*32)];
    }
    return key;
  },
  _base32toHEX: function(base32str) {
    let base32bin5 = {
      'A':'00000', 'B':'00001', 'C':'00010', 'D':'00011', 'E':'00100', 'F':'00101', 'G':'00110', 'H':'00111',
      'I':'01000', 'J':'01001', 'K':'01010', 'L':'01011', 'M':'01100', 'N':'01101', 'O':'01110', 'P':'01111',
      'Q':'10000', 'R':'10001', 'S':'10010', 'T':'10011', 'U':'10100', 'V':'10101', 'W':'10110', 'X':'10111',
      'Y':'11000', 'Z':'11001', '2':'11010', '3':'11011', '4':'11100', '5':'11101', '6':'11110', '7':'11111'
    };
    let bits = '';
    let bytes = [];
    for (let i in base32str) bits += base32bin5[base32str[i].toUpperCase()];
    for (let i = 0; i <= (bits.length>>3<<3)-8; i += 8)
      bytes.push(parseInt(bits.substring(i, i+8), 2));
    return bytes;
  },
  genCode: async function(key, timeStep = 30, bias = 0) {
    const digits = 6;
    let _timeAsArray = new ArrayBuffer(8);
    new DataView(_timeAsArray).setUint32(4, Math.floor((Date.now() / 1000 - bias) / timeStep), false);
    // compute HMACSHA1(key, shift)
    const signature = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        new Uint8Array(this._base32toHEX(key)),
        {name: "HMAC", hash: { name: "SHA-1" }},
        false,
        ["sign"]
      ),
      _timeAsArray
    );
    const hmac = new Uint8Array(signature);
    /** This is supposed to shorten the hash to k (6) digits */
    let offset = hmac[hmac.length - 1] & 0xf;
    const bin_code =
      (hmac[offset++] & 0x7f) << 24 |
      (hmac[offset++] & 0xff) << 16 |
      (hmac[offset++] & 0xff) << 8 |
      (hmac[offset] & 0xff);
    return (bin_code % Math.pow(10, digits)).toString().padStart(digits, '0');
  }
}
