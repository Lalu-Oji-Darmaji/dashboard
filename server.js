const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
const upload = multer({ dest: "uploads/" });

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", {
        totalPesawat: 0,
        dataPerTahun: {},
        dataRute: {},
        dataAktivitas: {},
    });
});

app.post("/upload", upload.single("csvfile"), (req, res) => {
    const filePath = req.file.path;
    const data = [];

    fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => data.push(row))
        .on("end", () => {
       
            const dataPerTahun = {};
            data.forEach((r) => {
                const tahun = parseInt(r["Tahun"]);
                const jumlah = parseInt(r["Jumlah Pesawat (unit)"] || 0);
                if (tahun >= 2017 && tahun <= 2024) {
                    dataPerTahun[tahun] = (dataPerTahun[tahun] || 0) + jumlah;
                }
            });

            const dataRute = {};
            data.forEach((r) => {
                const rute = r["Rute Penerbangan"] || "Tidak diketahui";
                dataRute[rute] = (dataRute[rute] || 0) + parseInt(r["Jumlah Pesawat (unit)"] || 0);
            });

            const dataAktivitas = {};
            data.forEach((r) => {
                const aktivitas = r["Aktivitas Pesawat"] || "Tidak diketahui";
                dataAktivitas[aktivitas] = (dataAktivitas[aktivitas] || 0) + parseInt(r["Jumlah Pesawat (unit)"] || 0);
            });

            const totalPesawat = Object.values(dataPerTahun).reduce((a, b) => a + b, 0);

            res.render("index", {
                totalPesawat,
                dataPerTahun,
                dataRute,
                dataAktivitas
            });

            fs.unlinkSync(filePath);
        });
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));