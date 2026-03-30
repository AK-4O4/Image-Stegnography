# Image Steganography

Hide secret images inside ordinary images — and retrieve them back — using 4-bit LSB steganography. Built with a **FastAPI** backend and a **Next.js + shadcn/ui** frontend.

---

## Demo

| Encode | Decode |
|--------|--------|
| Upload a cover image + secret image | Upload the stego image |
| Download the stego image (looks identical to cover) | Recover the hidden image |

---

## How It Works

This project uses **4-bit LSB (Least Significant Bit)** steganography:

1. The top 4 bits of every pixel in the secret image are extracted
2. They are stored in the bottom 4 bits of every pixel in the cover image
3. The resulting stego image looks virtually identical to the cover image to the human eye
4. To decode, the bottom 4 bits of the stego image are extracted and shifted back up

```
Cover pixel:  1101 1010  →  1101 [1011]  ← bottom 4 bits replaced
Secret pixel: [1011] 0110  ← top 4 bits used
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| UI Components | shadcn/ui, Tailwind CSS |
| Theme | next-themes (light/dark/system) |
| File Upload | react-dropzone |
| Backend | FastAPI, Python 3.11+ |
| Image Processing | Pillow, NumPy |
| Server | Uvicorn |

---

## Project Structure

```
Image-Stegnography/
├── backend/
│   ├── main.py               # FastAPI app, routes, CORS
│   ├── steganography.py      # Encode/decode logic
│   └── requirements.txt
└── frontend/
    ├── app/
    │   ├── layout.tsx        # Root layout, ThemeProvider
    │   ├── page.tsx          # Main UI
    │   └── globals.css
    ├── components/
    │   ├── ui/               # shadcn components
    │   └── theme-provider.tsx
    │
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ or [Bun](https://bun.sh)

---

### Backend

```bash
cd backend

# create and activate virtual environment
python -m venv .venv
source .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate         # Windows

# install dependencies
pip install -r requirements.txt

# start the server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

API docs available at `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend

# install dependencies
bun install

# start the dev server
bun dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

### `POST /encode`

Hide a secret image inside a cover image.

| Field | Type | Description |
|-------|------|-------------|
| `cover` | `file` | The carrier image (PNG or JPG) |
| `secret` | `file` | The image to hide (PNG or JPG) |

**Returns:** PNG image file (the stego image)

---

### `POST /decode`

Extract a hidden image from a stego image.

| Field | Type | Description |
|-------|------|-------------|
| `stego` | `file` | The stego image (PNG or JPG) |

**Returns:** PNG image file (the recovered secret image)

---

## Limitations

- Both images must be PNG or JPG
- Maximum file size: 10 MB per image
- The secret image is resized to match the cover image dimensions before encoding
- Use PNG for the stego image when downloading — saving as JPG will destroy the hidden data due to lossy compression

---

## Dependencies

### Backend (`requirements.txt`)

```
fastapi==0.133.1
uvicorn==0.41.0
pillow>=10.0.0
numpy>=1.24.0
python-multipart==0.0.22
```

### Frontend

```
next, react, typescript
tailwindcss
shadcn/ui
next-themes
react-dropzone
```

---
