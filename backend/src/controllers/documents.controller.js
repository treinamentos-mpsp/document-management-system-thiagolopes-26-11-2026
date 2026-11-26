const path = require('node:path');
const service = require('../services/documents.service');

const storageDirectory = path.resolve(__dirname, '../../storage');

function requireUser(req, res, next) {
  const owner = req.get('X-User-Id');
  if (!owner || !owner.trim()) {
    return res.status(401).json({ error: 'Informe o usuário no cabeçalho X-User-Id.' });
  }
  req.owner = owner.trim();
  next();
}

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo no campo file.' });
  }
  const document = service.createDocument(req.file, req.owner);
  res.status(201).json(document);
}

function list(req, res) {
  res.json(service.listDocuments(req.owner));
}

function download(req, res) {
  const document = service.findDocument(req.params.id, req.owner);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }
  res.download(path.join(storageDirectory, document.storedName), document.originalName, (error) => {
    if (!error) return;
    if (res.headersSent) return res.destroy(error);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }
    res.status(500).json({ error: 'Não foi possível baixar o documento.' });
  });
}

function handleUploadError(error, req, res, next) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'O arquivo excede o tamanho máximo permitido.' });
  }
  if (error.name === 'MulterError') {
    return res.status(400).json({ error: 'Não foi possível processar o arquivo enviado.' });
  }
  res.status(500).json({ error: 'Não foi possível salvar o arquivo.' });
}

module.exports = { requireUser, upload, list, download, handleUploadError };