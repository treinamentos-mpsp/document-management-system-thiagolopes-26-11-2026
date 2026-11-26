const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
process.env.MAX_UPLOAD_SIZE = '1024';
const app = require('../src/app');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download respeitam o dono e os erros de entrada', async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const headers = { 'X-User-Id': 'usuario-1' };

  const healthResponse = await fetch(baseUrl + '/health');
  assert.deepStrictEqual(await healthResponse.json(), { status: 'ok' });

  for (const [url, options] of [
    ['/upload', { method: 'POST' }],
    ['/documents', {}],
    ['/documents/inexistente/download', {}],
  ]) {
    const response = await fetch(baseUrl + url, options);
    assert.strictEqual(response.status, 401);
  }

  const emptyResponse = await fetch(baseUrl + '/upload', { method: 'POST', headers });
  assert.strictEqual(emptyResponse.status, 400);

  const unexpected = new FormData();
  unexpected.append('outro', new Blob(['arquivo']), 'arquivo.txt');
  const unexpectedResponse = await fetch(baseUrl + '/upload', { method: 'POST', headers, body: unexpected });
  assert.strictEqual(unexpectedResponse.status, 400);

  const oversized = new FormData();
  oversized.append('file', new Blob(['a'.repeat(1025)]), 'grande.txt');
  const oversizedResponse = await fetch(baseUrl + '/upload', { method: 'POST', headers, body: oversized });
  assert.strictEqual(oversizedResponse.status, 413);

  const form = new FormData();
  form.append('file', new Blob(['conteúdo do documento'], { type: 'text/plain' }), 'documento.txt');
  const uploadResponse = await fetch(baseUrl + '/upload', { method: 'POST', headers, body: form });
  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  context.after(() => fs.rm(path.join(__dirname, '../storage', document.storedName), { force: true }));
  assert.strictEqual(document.originalName, 'documento.txt');
  assert.strictEqual(document.owner, 'usuario-1');
  assert.strictEqual(document.mimeType, 'text/plain');
  assert.strictEqual(document.size, Buffer.byteLength('conteúdo do documento'));
  assert.ok(document.id);
  assert.ok(!Number.isNaN(Date.parse(document.uploadedAt)));

  const listResponse = await fetch(baseUrl + '/documents', { headers });
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);
  const otherHeaders = { 'X-User-Id': 'usuario-2' };
  const otherList = await fetch(baseUrl + '/documents', { headers: otherHeaders });
  assert.deepStrictEqual(await otherList.json(), []);

  const downloadUrl = `${baseUrl}/documents/${document.id}/download`;
  const downloadResponse = await fetch(downloadUrl, { headers });
  assert.strictEqual(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /documento\.txt/);
  assert.strictEqual(await downloadResponse.text(), 'conteúdo do documento');
  assert.strictEqual((await fetch(downloadUrl, { headers: otherHeaders })).status, 404);
  assert.strictEqual((await fetch(baseUrl + '/documents/inexistente/download', { headers })).status, 404);

  await fs.rm(path.join(__dirname, '../storage', document.storedName));
  assert.strictEqual((await fetch(downloadUrl, { headers })).status, 404);
});
