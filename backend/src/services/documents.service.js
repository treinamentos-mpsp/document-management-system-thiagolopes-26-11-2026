const { randomUUID } = require('node:crypto');
const repository = require('../repositories/documents.repository');

function createDocument(fileMetadata, owner) {
  return repository.save({
    id: randomUUID(),
    originalName: fileMetadata.originalName,
    storedName: fileMetadata.storedName,
    mimeType: fileMetadata.mimeType,
    size: fileMetadata.size,
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