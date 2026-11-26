const { randomUUID } = require('node:crypto');
const repository = require('../repositories/documents.repository');

function createDocument(file, owner) {
  return repository.save({
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  });
}

function listDocuments(owner) {
  return repository.findByOwner(owner);
}

function findDocument(id, owner) {
  return repository.findByIdAndOwner(id, owner);
}

module.exports = { createDocument, listDocuments, findDocument };