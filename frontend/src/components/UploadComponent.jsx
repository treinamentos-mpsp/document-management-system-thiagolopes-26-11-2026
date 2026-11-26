import { useState } from 'react';
import { FileUp, Upload } from 'lucide-react';
import { uploadDocument } from '../services/documents.js';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || uploading) return;
    const form = event.currentTarget;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      await uploadDocument(owner, file);
      form.reset();
      setFile(null);
      setMessage('Documento enviado com sucesso.');
      onUploaded();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="upload-heading"><div className="upload-icon"><FileUp size={21} /></div><div><h2 id="upload-title">Adicionar documento</h2><p>Selecione um arquivo para enviar.</p></div></div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-picker"><span>{file ? file.name : 'Selecionar arquivo'}</span><input type="file" onChange={(event) => { setFile(event.target.files[0] || null); setMessage(''); setError(''); }} disabled={uploading} required /></label>
        <button className="primary-button" type="submit" disabled={!file || uploading}><Upload size={17} />{uploading ? 'Enviando...' : 'Enviar arquivo'}</button>
      </form>
      {message && <p className="message success" role="status">{message}</p>}
      {error && <p className="message error" role="alert">{error}</p>}
    </section>
  );
}