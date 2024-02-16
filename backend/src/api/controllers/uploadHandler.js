const { getStorage } = require('firebase-admin/storage');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(`menu/${Date.now()}_${req.file.originalname}`);
    const blobStream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    blobStream.on('error', (err) => res.status(500).send(err.toString()));

    blobStream.on('finish', async () => {
      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      res.status(200).send({ url: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Firebase error", error);
    res.status(500).send("An error occurred");
  }
};

module.exports = { handleFileUpload, upload };
