const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const controller = require('../controllers/documents.controller');

const router = express.Router();
const storageDirectory = path.resolve(__dirname, '../../storage');
const configuredLimit = Number(process.env.MAX_UPLOAD_SIZE);
const maxUploadSize = Number.isSafeInteger(configuredLimit) && configuredLimit > 0
  ? configuredLimit
  : 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(storageDirectory, { recursive: true }, (error) => callback(error, storageDirectory));
  },
  filename(req, file, callback) {
    callback(null, randomUUID());
  },
});

const upload = multer({ storage, limits: { fileSize: maxUploadSize } });

router.post('/upload', controller.requireUser, upload.single('file'), controller.upload);
router.get('/documents', controller.requireUser, controller.list);
router.get('/documents/:id/download', controller.requireUser, controller.download);
router.use(controller.handleUploadError);

module.exports = router;