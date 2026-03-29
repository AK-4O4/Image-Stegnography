import numpy as np
from PIL import Image
import io

def encode_image(cover_bytes: bytes, secret_bytes: bytes) -> bytes:
    cover = Image.open(io.BytesIO(cover_bytes)).convert("RGB")
    secret = Image.open(io.BytesIO(secret_bytes)).convert("RGB")

    # Resize secret to match cover
    secret = secret.resize((cover.width, cover.height), Image.LANCZOS)

    cover_arr = np.array(cover, dtype=np.uint8)
    secret_arr = np.array(secret, dtype=np.uint8)

    # Store top 4 bits of secret in bottom 4 bits of cover
    stego = (cover_arr & 0xF0) | (secret_arr >> 4)

    out = io.BytesIO()
    Image.fromarray(stego).save(out, format="PNG")
    return out.getvalue()


def decode_image(stego_bytes: bytes) -> bytes:
    stego = np.array(Image.open(io.BytesIO(stego_bytes)).convert("RGB"), dtype=np.uint8)

    # Extract bottom 4 bits and shift up
    recovered = (stego & 0x0F) << 4

    out = io.BytesIO()
    Image.fromarray(recovered).save(out, format="PNG")
    return out.getvalue()