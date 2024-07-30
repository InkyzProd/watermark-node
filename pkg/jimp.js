const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

// Struktur class
class ImageProcessor {
    static async addWatermark(imagePath, watermarkText, position, color) {
        try {
            // Membaca gambar
            const image = await Jimp.read(imagePath);

            // Posisi watermark
            let x, y;
            const margin = 10;

            // Mengatur warna pada font
            let font;
            switch (color) {
                case "white":
                    font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
                    break;
                case "black":
                    font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
                    break;
                default:
                    font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            }

            // Mengatur teks dan font
            const textWidth = Jimp.measureText(font, watermarkText);
            const textHeight = Jimp.measureTextHeight(font, watermarkText);

            // Mengatur posisi watermark
            switch (position) {
                case "top-left":
                    x = margin;
                    y = margin;
                    break;
                case "top-right":
                    x = image.bitmap.width - textWidth - margin;
                    y = margin;
                    break;
                case "bottom-left":
                    x = margin;
                    y = image.bitmap.height - textHeight - margin;
                    break;
                case "bottom-right":
                    x = image.bitmap.width - textWidth - margin;
                    y = image.bitmap.height - textHeight - margin;
                    break;
                default:
                    x = margin;
                    y = margin;
            }

            // Membuat watermark
            image.print(font, x, y, {
                text: watermarkText,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_TOP,
            });

            // Path output
            const editedDir = path.join(__dirname, "..", "edited");
            
            if (!fs.existsSync(editedDir)) {
                fs.mkdirSync(editedDir, { recursive: true });
            }

            const outputPath = path.join(
                __dirname,
                "..",
                "edited",
                `${path.basename(imagePath, path.extname(imagePath))}_edited${path.extname(imagePath)}`,
            );
            await image.writeAsync(outputPath);

            // Menghapus file asli
            fs.unlinkSync(imagePath);

            // Mengembalikan output
            return outputPath;
        } catch (err) {
            // Mengembalikan error jika ada kesalahan
            console.error("Terjadi error saat memproses gambar:", err);
            throw err;
        }
    }
}

// Mengekspor class image
module.exports = { ImageProcessor };