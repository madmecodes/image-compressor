const express = require('express');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { createWriteStream, createReadStream } = require('fs');

const app = express();
const PORT = 3333;

// Create directories for uploads and downloads
const uploadsDir = path.join(os.tmpdir(), 'image-compressor-uploads');
const downloadsDir = path.join(os.tmpdir(), 'image-compressor-downloads');

(async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(downloadsDir, { recursive: true });
})();

// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle image compression
app.post('/api/compress', async (req, res) => {
  try {
    const { imageData, quality = 80, format } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Detect format from buffer if not specified
    let outputFormat = format;
    if (!outputFormat) {
      const metadata = await sharp(imageBuffer).metadata();
      outputFormat = metadata.format;
    }

    // Compress the image
    let compressor = sharp(imageBuffer);
    const qualityNum = parseInt(quality);

    switch (outputFormat) {
      case 'jpeg':
      case 'jpg':
        compressor = compressor.jpeg({ quality: qualityNum, mozjpeg: true });
        break;
      case 'png':
        compressor = compressor.png({
          quality: qualityNum,
          compressionLevel: 9,
          effort: 10
        });
        break;
      case 'webp':
        compressor = compressor.webp({ quality: qualityNum });
        break;
      case 'avif':
        compressor = compressor.avif({ quality: qualityNum });
        break;
      default:
        compressor = compressor.jpeg({ quality: qualityNum, mozjpeg: true });
    }

    const compressedBuffer = await compressor.toBuffer();
    const compressedBase64 = compressedBuffer.toString('base64');
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const savingsPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    res.json({
      success: true,
      compressedImage: `data:image/${outputFormat};base64,${compressedBase64}`,
      originalSize,
      compressedSize,
      savings: savingsPercent,
      format: outputFormat
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle file upload compression
app.post('/api/compress-file', async (req, res) => {
  try {
    const { files, quality = 80, format } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const results = [];

    for (const file of files) {
      try {
        const base64Data = file.data.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Detect format
        let outputFormat = format;
        if (!outputFormat) {
          const metadata = await sharp(imageBuffer).metadata();
          outputFormat = metadata.format;
        }

        // Compress
        let compressor = sharp(imageBuffer);
        const qualityNum = parseInt(quality);

        switch (outputFormat) {
          case 'jpeg':
          case 'jpg':
            compressor = compressor.jpeg({ quality: qualityNum, mozjpeg: true });
            break;
          case 'png':
            compressor = compressor.png({
              quality: qualityNum,
              compressionLevel: 9,
              effort: 10
            });
            break;
          case 'webp':
            compressor = compressor.webp({ quality: qualityNum });
            break;
          case 'avif':
            compressor = compressor.avif({ quality: qualityNum });
            break;
          default:
            compressor = compressor.jpeg({ quality: qualityNum, mozjpeg: true });
        }

        const compressedBuffer = await compressor.toBuffer();
        const originalSize = imageBuffer.length;
        const compressedSize = compressedBuffer.length;
        const savingsPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        results.push({
          name: file.name,
          success: true,
          originalSize,
          compressedSize,
          savings: savingsPercent,
          format: outputFormat,
          data: compressedBuffer.toString('base64')
        });
      } catch (error) {
        results.push({
          name: file.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch compression error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download multiple files as zip
app.post('/api/download-batch', async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files to download' });
    }

    // For simplicity, we'll send files as individual downloads
    // In production, you'd use a zip library
    res.json({
      success: true,
      message: 'Files ready for download',
      count: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Image Compressor running at http://localhost:${PORT}`);
});
