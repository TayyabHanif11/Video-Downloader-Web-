const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// ==============================
// 📌 1. VIDEO INFO ROUTE
// ==============================
app.post("/info", (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: "URL required" });
    }

    const yt = spawn("yt-dlp", [
        "-j",
        "--no-playlist",
        url
    ]);

    let data = "";

    yt.stdout.on("data", chunk => {
        data += chunk.toString();
    });

    yt.on("close", () => {
        try {
            const json = JSON.parse(data);

            const allowed = [360, 480, 720, 1080];
            const seen = new Set();
            const formats = [];

            json.formats.forEach(f => {
                if (f.height && allowed.includes(f.height) && !seen.has(f.height)) {
                    seen.add(f.height);
                    formats.push({ quality: f.height + "p" });
                }
            });

            if (formats.length === 0) {
                formats.push({ quality: "360p" });
            }

            res.json({
                title: json.title,
                thumbnail: json.thumbnail,
                formats
            });

        } catch (e) {
            res.status(500).json({ error: "Parsing error" });
        }
    });
});


// ==============================
// 📌 2. DOWNLOAD (LIVE CHROME FIX)
// ==============================

app.get("/download", (req, res) => {
    const { url, quality } = req.query;

    if (!url || !quality) {
        return res.status(400).send("Missing params");
    }

    const height = quality.replace("p", "");

    // ✅ safe codec (already working for you)
    const format = `bv*[vcodec^=avc1][height<=${height}]+ba[acodec^=mp4a]/b`;

    const yt = spawn("yt-dlp", [
        "-f", format,
        "--merge-output-format", "mp4",
        "--no-playlist",
        "--newline",
        "-o", "-",
        url
    ]);

    // 🔥 IMPORTANT: Chrome LIVE download trigger
    res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
    res.setHeader("Content-Type", "video/mp4");

    // 🚀 REAL TIME STREAM (THIS IS THE KEY)
    yt.stdout.pipe(res);

    yt.stderr.on("data", data => {
        console.log(data.toString());
    });

    yt.on("error", err => {
        console.error(err);
        res.status(500).send("Download failed");
    });
});

app.post("/size", (req, res) => {
    const url = req.body.url;

    const yt = spawn("yt-dlp", ["-J", url]);

    let data = "";

    yt.stdout.on("data", chunk => {
        data += chunk.toString();
    });

    yt.on("close", () => {
        try {
            const json = JSON.parse(data);

            let size = 0;

            json.formats.forEach(f => {
                if (f.filesize) {
                    size = Math.max(size, f.filesize);
                }
            });

            res.json({
                sizeMB: size ? (size / (1024 * 1024)).toFixed(2) : "Unknown"
            });

        } catch (e) {
            res.status(500).send("Error");
        }
    });
});

// ==============================
// 🚀 SERVER START
// ==============================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});