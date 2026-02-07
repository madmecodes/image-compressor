# Technical Documentation: How Image Compression Works

This document explains the technical implementation of this CLI tool and the underlying compression technologies.

## Tech Stack

| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Node.js** | Runtime environment | Fast, async I/O, great for CLI tools |
| **Sharp** | Image processing library | 4-5x faster than alternatives, uses libvips |
| **Commander** | CLI argument parsing | Industry standard, clean API |
| **Chalk** | Terminal colors | Better UX with color-coded output |

## Architecture Overview

```
User Command
    ↓
compress-img CLI (Commander)
    ↓
Parse arguments & validate
    ↓
Sharp Library (Node.js bindings)
    ↓
libvips (C library) - Fast image processing
    ↓
Compression Codecs:
  - MozJPEG (JPEG)
  - libpng (PNG)
  - libwebp (WebP)
  - libheif (AVIF)
    ↓
Compressed file written to disk
```

## How Image Compression Works

### 1. Lossy Compression (What We Use)

**Concept:** Removes data humans can't easily perceive to reduce file size significantly.

**How it works:**
1. **Spatial Redundancy:** Neighboring pixels often have similar colors
2. **Spectral Redundancy:** RGB color channels share overlapping information
3. **Perceptual Redundancy:** Human eyes ignore certain high-frequency details

### 2. Format-Specific Compression

#### JPEG Compression (MozJPEG)

**Algorithm: Discrete Cosine Transform (DCT)**

```javascript
// Our implementation
.jpeg({ quality: 80, mozjpeg: true })
```

**How it works step-by-step:**

1. **Color Space Conversion**
   - Convert RGB → YCbCr (Luminance + 2 Chrominance channels)
   - Separates brightness from color

2. **Chroma Subsampling (4:2:0)**
   - Full resolution brightness (Y)
   - Half resolution color (Cb, Cr)
   - Result: 50% smaller with minimal visual difference

3. **DCT Transform**
   - Splits image into 8×8 pixel blocks
   - Converts spatial data → frequency components
   - Low frequencies = important details
   - High frequencies = fine details (can discard)

4. **Quantization (Lossy Step)**
   ```
   Quantized = round(DCT_coefficient / Quantization_table[i])
   ```
   - Larger quantization values = more compression, lower quality
   - Quality 80 = balanced quantization table

5. **MozJPEG Optimization**
   - Trellis quantization (finds optimal quantization per block)
   - Better Huffman tables
   - Result: 5-10% smaller than standard JPEG encoders

#### PNG Compression

**Algorithm: DEFLATE (LZ77 + Huffman Coding)**

```javascript
// Our implementation
.png({ quality: 80, compressionLevel: 9, effort: 10 })
```

**How it works:**

1. **Delta Filtering**
   - Predict pixel values from neighbors
   - Store only the difference (delta)
   - Makes data more compressible

2. **LZ77 Compression**
   - Finds repeated patterns in data
   - Replaces with references: "copy 10 bytes from 50 bytes ago"

3. **Huffman Coding**
   - Frequent values = short codes
   - Rare values = long codes
   - Like Morse code optimization


### Why Sharp is Fast

**Sharp vs ImageMagick:**

| Operation | ImageMagick | Sharp |
|-----------|-------------|-------|
| Resize 2048×2048 JPEG | ~500ms | ~100ms |
| Memory usage | High (loads entire uncompressed) | Low (streaming) |
| Implementation | CLI spawning (slow) | Native bindings (fast) |

**Sharp's Secret: libvips**

```
Node.js JavaScript
    ↓ (N-API bindings)
C++ wrapper
    ↓
libvips (C library)
    ↓
- SIMD vectorization (process multiple pixels at once)
- Memory streaming (don't load entire image)
- Smart caching
- Multi-threaded processing
```

## Learning Resources

### Understanding Image Compression
- [JPEG Compression Explained](https://en.wikipedia.org/wiki/JPEG#Encoding) - DCT and quantization
- [PNG Specification](http://www.libpng.org/pub/png/spec/1.2/PNG-Contents.html) - DEFLATE compression
- [WebP Compression Study](https://developers.google.com/speed/webp/docs/compression)

### Sharp Library
- [Sharp Documentation](https://sharp.pixelplumbing.com/) - API reference
- [libvips](https://www.libvips.org/) - Underlying C library

### Algorithms
- **DCT:** Used in JPEG, MP3, video codecs
- **LZ77:** Used in ZIP, GZIP, PNG
- **Huffman Coding:** Used in most compression formats

## Key Takeaways

1. **Lossy compression** discards imperceptible data for major size reductions
2. **Sharp/libvips** provides 4-5× faster processing than alternatives
3. **MozJPEG** optimizes quantization for 5-10% better compression
4. **Quality 80** is the sweet spot for web images (good compression, minimal quality loss)
5. **Streaming processing** keeps memory usage low even for large images
6. **CLI tools** benefit from async I/O and native bindings (Node.js + C libraries)
