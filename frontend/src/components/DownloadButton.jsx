import { useState } from 'react';
import { Download } from 'lucide-react';
import { downloadDocument } from '../services/documents.js';

export default function DownloadButton({ owner, document }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError('');
    try {
      const blob = await downloadDocument(owner, document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloading(false);
    }
  }

  return <div className="download-action"><button className="icon-button" type="button" onClick={handleDownload} disabled={downloading} title={downloading ? 'Baixando...' : 'Baixar documento'} aria-label={`Baixar ${document.originalName}`}><Download size={18} /></button>{error && <span className="download-error" role="alert">{error}</span>}</div>;
}