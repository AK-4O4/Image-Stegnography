from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from steganography import encode_image, decode_image

app = FastAPI(title="Image Steganography API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_TYPES = {"image/png", "image/jpeg", "image/jpg"}

def validate(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PNG/JPG images are supported.")

@app.post("/encode")
async def encode(
    cover: UploadFile = File(...),
    secret: UploadFile = File(...),
):
    validate(cover)
    validate(secret)
    cover_bytes = await cover.read()
    secret_bytes = await secret.read()
    result = encode_image(cover_bytes, secret_bytes)
    return Response(content=result, media_type="image/png",
                    headers={"Content-Disposition": "attachment; filename=stego.png"})

@app.post("/decode")
async def decode(stego: UploadFile = File(...)):
    validate(stego)
    stego_bytes = await stego.read()
    result = decode_image(stego_bytes)
    return Response(content=result, media_type="image/png",
                    headers={"Content-Disposition": "attachment; filename=recovered.png"})