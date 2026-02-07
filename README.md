# Image Compressor CLI

Fast local image compression tool built with Node.js and Sharp.

## Installation

```bash
npm install -g .
```

This creates a global `compress-img` command that you can use from anywhere.

## Usage

### Basic compression

```bash
compress-img photo.jpg
```

This creates `photo-compressed.jpg` in the same folder as the original.

### Compress multiple images

```bash
compress-img *.jpg
compress-img photo1.png photo2.png photo3.jpg
```

### Options

```bash
# Set quality (1-100, default: 80)
compress-img photo.jpg -q 75

# Convert to different format
compress-img photo.jpg -f webp
compress-img photo.png -f jpeg

# Custom output suffix
compress-img photo.jpg -o "-optimized"

# Overwrite original (use with caution!)
compress-img photo.jpg --replace
```

### Examples

```bash
# Compress all PNGs in current folder with quality 85
compress-img *.png -q 85

# Convert JPEGs to WebP format
compress-img *.jpg -f webp

# Compress with custom suffix
compress-img image.png -o "-small"
# Creates: image-small.png
```

## Supported Formats

- JPEG/JPG (uses MozJPEG encoder for optimal compression)
- PNG (with advanced compression)
- WebP
- AVIF

## How It Works

The tool uses the Sharp library (built on libvips) for high-performance image processing:

- **JPEG**: Uses MozJPEG encoder for 5-10% better compression than standard encoders
- **PNG**: Applies maximum compression with quality control
- **WebP**: Modern format with 30% better compression than JPEG
- **AVIF**: Next-gen format for best compression at low-medium quality

All processing happens locally on your machine - your images never leave your computer.

## Features

- Fast compression using libvips
- Outputs to same folder as original by default
- Shows before/after file sizes and savings percentage
- Color-coded output (green for >30% savings, yellow for >10%)
- Support for batch processing
- Simple command-line interface

## Uninstall

```bash
npm uninstall -g image-compressor
```
