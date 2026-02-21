# Image Compressor

Fast local image compression tool with CLI and Web UI built with Node.js and Sharp.

## Installation

```bash
npm install
```

## Usage

### Web UI (Recommended)

Start the web server and open in browser:

```bash
npm start
```

Visit `http://localhost:3333` to:
- Drag and drop images for compression
- Bulk upload multiple images
- Adjust quality and format settings
- Preview results and download compressed images
- View compression statistics

### CLI Usage

Global installation:

```bash
npm install -g .
```

Then use the `compress-img` command:

```bash
# Basic compression
compress-img photo.jpg

# Compress multiple images
compress-img *.jpg photo.png

# Set quality (1-100, default: 80)
compress-img photo.jpg -q 75

# Convert format
compress-img photo.jpg -f webp

# Custom suffix
compress-img photo.jpg -o "-small"

# Overwrite original
compress-img photo.jpg --replace
```

## Supported Formats

- JPEG/JPG (MozJPEG encoder)
- PNG
- WebP
- AVIF

## Features

- Drag and drop or bulk upload via web UI
- Real-time compression preview
- Format conversion support
- Quality control (1-100)
- Batch processing
- Download individual or all compressed images
- Local processing - images never leave your device
- Built on Sharp/libvips for fast compression
