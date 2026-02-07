#!/usr/bin/env node

const sharp = require('sharp');
const { program } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

program
  .name('compress-img')
  .description('Fast local image compression tool')
  .version('1.0.0')
  .argument('<files...>', 'Image file(s) to compress (supports wildcards)')
  .option('-q, --quality <number>', 'Compression quality (1-100)', '80')
  .option('-f, --format <type>', 'Output format (jpeg|webp|png|avif)')
  .option('-o, --suffix <text>', 'Output filename suffix', '-compressed')
  .option('--replace', 'Overwrite original file (use with caution!)', false)
  .action(async (files, options) => {
    try {
      const quality = parseInt(options.quality);

      if (quality < 1 || quality > 100) {
        console.error(chalk.red('Error: Quality must be between 1 and 100'));
        process.exit(1);
      }

      console.log(chalk.blue(`\nCompressing ${files.length} image(s)...\n`));

      let totalOriginalSize = 0;
      let totalCompressedSize = 0;
      let successCount = 0;

      for (const file of files) {
        try {
          const result = await compressImage(file, options, quality);

          totalOriginalSize += result.originalSize;
          totalCompressedSize += result.compressedSize;
          successCount++;

          const savingsPercent = ((1 - result.compressedSize / result.originalSize) * 100).toFixed(1);
          const color = savingsPercent > 30 ? chalk.green : savingsPercent > 10 ? chalk.yellow : chalk.white;

          console.log(chalk.gray(`✓ ${path.basename(file)}`));
          console.log(`  ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} ${color(`(saved ${savingsPercent}%)`)}`);
          console.log(`  ${chalk.gray(`Output: ${result.outputPath}`)}\n`);
        } catch (error) {
          console.error(chalk.red(`✗ ${path.basename(file)}: ${error.message}\n`));
        }
      }

      if (successCount > 0) {
        const totalSavingsPercent = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
        console.log(chalk.green.bold(`\n✓ Successfully compressed ${successCount}/${files.length} image(s)`));
        console.log(chalk.green(`Total: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalCompressedSize)} (saved ${totalSavingsPercent}%)`));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

async function compressImage(filePath, options, quality) {
  const absolutePath = path.resolve(filePath);
  const parsedPath = path.parse(absolutePath);
  const stats = await fs.stat(absolutePath);
  const originalSize = stats.size;

  // Determine output format
  const image = sharp(absolutePath);
  const metadata = await image.metadata();
  const outputFormat = options.format || metadata.format;

  // Determine output path
  let outputPath;
  if (options.replace) {
    outputPath = absolutePath;
  } else {
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    outputPath = path.join(parsedPath.dir, `${parsedPath.name}${options.suffix}.${ext}`);
  }

  // Configure compression based on format
  let compressor = image;

  switch (outputFormat) {
    case 'jpeg':
    case 'jpg':
      compressor = compressor.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      compressor = compressor.png({
        quality,
        compressionLevel: 9,
        effort: 10
      });
      break;
    case 'webp':
      compressor = compressor.webp({ quality });
      break;
    case 'avif':
      compressor = compressor.avif({ quality });
      break;
    default:
      compressor = compressor.jpeg({ quality, mozjpeg: true });
  }

  // Save compressed image
  await compressor.toFile(outputPath);

  const compressedStats = await fs.stat(outputPath);
  const compressedSize = compressedStats.size;

  return {
    originalSize,
    compressedSize,
    outputPath
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

program.parse();
