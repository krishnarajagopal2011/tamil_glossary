import hashlib, hmac, struct, sys
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

SRC = "apk/assets/swg_tmd"; OUT = "glossary_plain.db"
PW = b"RenSir_9014"; PAGE = 1024; RESERVE = 48; IV_SZ = 16; HMAC_SZ = 20

data = open(SRC, "rb").read()
salt = data[:16]
key = hashlib.pbkdf2_hmac("sha1", PW, salt, 64000, 32)
hsalt = bytes(b ^ 0x3a for b in salt)
hkey = hashlib.pbkdf2_hmac("sha1", key, hsalt, 2, 32)

npages = len(data)//PAGE
ok = 0
out = bytearray()
for i in range(npages):
    page = data[i*PAGE:(i+1)*PAGE]
    start = 16 if i == 0 else 0
    body_end = PAGE - RESERVE
    iv = page[body_end:body_end+IV_SZ]
    mac = page[body_end+IV_SZ:body_end+IV_SZ+HMAC_SZ]
    calc = hmac.new(hkey, page[start:body_end+IV_SZ] + struct.pack("<I", i+1), hashlib.sha1).digest()
    if hmac.compare_digest(calc, mac): ok += 1
    else: print("HMAC FAIL page", i+1)
    dec = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
    plain = dec.update(page[start:body_end]) + dec.finalize()
    if i == 0: out += b"SQLite format 3\x00"
    out += plain + b"\x00"*RESERVE

open(OUT, "wb").write(bytes(out))
print(f"pages={npages} hmac_ok={ok} out={len(out)} bytes")
