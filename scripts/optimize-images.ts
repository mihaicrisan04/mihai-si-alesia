import sharp from "sharp";
import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 82;
const EXTENSIONS = [".jpg", ".jpeg", ".png"];

async function optimizeImages() {
  const files = fs.readdirSync(PUBLIC_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return EXTENSIONS.includes(ext);
  });

  if (files.length === 0) {
    console.log("No images to optimize.");
    return;
  }

  console.log(`Found ${files.length} images to optimize.\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processed = 0;

  for (const file of files) {
    const inputPath = path.join(PUBLIC_DIR, file);
    const outputName = path.basename(file, path.extname(file)) + ".webp";
    const outputPath = path.join(PUBLIC_DIR, outputName);

    const originalSize = fs.statSync(inputPath).size;
    totalOriginalSize += originalSize;

    await sharp(inputPath)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPath);

    const optimizedSize = fs.statSync(outputPath).size;
    totalOptimizedSize += optimizedSize;

    fs.unlinkSync(inputPath);
    processed++;

    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
    console.log(
      `  ${file} → ${outputName}  (${formatBytes(originalSize)} → ${formatBytes(optimizedSize)}, -${savings}%)`
    );
  }

  console.log(`\nDone! Processed ${processed} images.`);
  console.log(
    `  Total: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalOptimizedSize)} (-${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1)}%)`
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

optimizeImages().catch((err) => {
  console.error("Error optimizing images:", err);
  process.exit(1);
});
