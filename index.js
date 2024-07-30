const express = require("express");
const path = require("path");
const multer = require("multer");
const { ImageProcessor } = require("./pkg/jimp");
const fs = require('fs');

const app = express();
const PORT = 3000;

// Mengecek folder
const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Middleware untuk menangani upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname),
        );
    },
});

// Mengecek tipe file
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|bmp|tiff|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase(),
    );

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(
            "Error: Hanya gambar berekstensi (jpeg, jpg, png, bmp, tiff, gif) yang dapat diunggah",
        );
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

// Middleware untuk melayani file statis
app.use(express.static("public"));
app.use("/edited", express.static(path.join(__dirname, "edited")));

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/add-watermark", upload.single("image"), async (req, res) => {
    try {
        const imagePath = req.file.path;
        const watermarkText = req.body.watermark || "Sample Watermark";
        const position = req.body.position;
        const color = req.body.color;

        // Proses penambahan watermark
        const outputPath = await ImageProcessor.addWatermark(
            imagePath,
            watermarkText,
            position,
            color,
        );

        // Mengirim gambar jika telah selesai ditambahkan watermark
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Image with Watermark</title>
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                <h1>Hasil Gambar</h1>
                <img src="/edited/${path.basename(outputPath)}" alt="Image"><br><br>
                <a href="/edited/${path.basename(outputPath)}" download>
                    <button>Download Gambar</button>
                </a><br><br>
                <a href="/">Upload gambar lain</a>
            </body>
            </html>
        `);
    } catch (err) {
        console.error("Terjadi kesalahan saat memproses gambar:", err);
        res.status(500).send("Terjadi kesalahan saat memproses gambar");
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});