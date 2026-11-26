const documents = [];

function save(document) {
  documents.push(document);
  return document;
}

function findByOwner(owner) {
  return documents.filter((document) => document.owner === owner);
}

function findByIdAndOwner(id, owner) {
  return documents.find((document) => document.id === id && document.owner === owner);
}

module.exports = { save, findByOwner, findByIdAndOwner };