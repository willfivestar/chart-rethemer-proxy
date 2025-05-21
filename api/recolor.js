import { IncomingForm } from "formidable";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

export const config = { api: { bodyParser: false } };

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async (req, res) => {
  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).send("Error parsing form");
    const palette = JSON.parse(fields.palette || "[]");
    const replaceTransforms = palette
      .map(h => `e_replace_color:${h.replace("#","")}:10`)
      .join(",");
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { transformation: replaceTransforms },
      (error, result) => {
        if (error) return res.status(500).send(error.message);
        res.setHeader("Content-Type", "image/png");
        res.redirect(result.secure_url);
      }
    );
    streamifier.createReadStream(files.file.filepath).pipe(uploadStream);
  });
};
