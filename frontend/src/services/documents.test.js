import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadDocument, listDocuments, uploadDocument } from './documents.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('envia usuário e arquivo para os endpoints da API', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(url.endsWith('/download') ? 'conteúdo' : '[]');
  };

  const file = new File(['conteúdo'], 'documento.txt');
  await listDocuments('usuario');
  await uploadDocument('usuario', file);
  const blob = await downloadDocument('usuario', 'id/1');

  assert.deepEqual(calls.map(({ url }) => url), [
    '/api/documents', '/api/upload', '/api/documents/id%2F1/download',
  ]);
  assert.ok(calls.every(({ options }) => options.headers['X-User-Id'] === 'usuario'));
  assert.equal(calls[1].options.method, 'POST');
  assert.equal(calls[1].options.body.get('file'), file);
  assert.equal(await blob.text(), 'conteúdo');
});

test('apresenta a mensagem de erro retornada pelo backend', async () => {
  globalThis.fetch = async () => Response.json({ error: 'Documento não encontrado.' }, { status: 404 });
  await assert.rejects(downloadDocument('usuario', 'inexistente'), /Documento não encontrado/);
});

test('apresenta erros de conexão e preserva cancelamentos', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  await assert.rejects(listDocuments('usuario'), /Não foi possível conectar ao servidor/);
  globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError'); };
  await assert.rejects(listDocuments('usuario'), { name: 'AbortError' });
});