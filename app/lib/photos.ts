import fs from "fs";
import path from "path";

export interface Photo {
  src: string;
  alt: string;
}

export function getPhotos(): Photo[] {
  const publicDir = path.join(process.cwd(), "public");
  const extensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

  try {
    const files = fs.readdirSync(publicDir);
    return files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return extensions.includes(ext);
      })
      .sort()
      .map((file) => ({
        src: `/${file}`,
        alt: "Mihai & Alesia",
      }));
  } catch {
    return [];
  }
}
