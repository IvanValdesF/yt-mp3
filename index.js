const ytpl = require("ytpl");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const getPlaylistUrls = async (playlistId) => {
  try {
    const playlist = await ytpl(playlistId, { pages: Infinity });
    const urls = playlist.items.map((item) => item.shortUrl);
    console.log(urls);
    return urls;
  } catch (err) {
    console.error("Error fetching playlist:", err);
    return [];
  }
};

const downloadVideoAsMP3 = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    ytdl
      .getInfo(url)
      .then((info) => {
        const title = info.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, "-"); // Clean up the title to make it file-system friendly
        const outputFilePath = path.join(outputPath, `${title}.mp3`);

        const audioStream = ytdl(url, { filter: "audioonly" });

        ffmpeg(audioStream)
          .audioBitrate(128)
          .save(outputFilePath)
          .on("progress", (p) => {
            console.log(`Progress: ${p.targetSize}kb downloaded`);
          })
          .on("end", () => {
            console.log(`Finished downloading and converting ${title} to MP3`);
            resolve();
          })
          .on("error", (err) => {
            console.error("Error:", err);
            reject(err);
          });
      })
      .catch(reject);
  });
};

const playlistId = "PLDzN6FJtvMbYfrdOhta0uWLzXgEVhYEQr"; // Replace with your playlist ID
const outputPath = "./downloads";

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

getPlaylistUrls(playlistId).then((urls) => {
  urls.forEach((url) => {
    downloadVideoAsMP3(url, outputPath)
      .then(() => console.log(`Downloaded ${url}`))
      .catch((err) => console.error(`Failed to download ${url}:`, err));
  });
});
