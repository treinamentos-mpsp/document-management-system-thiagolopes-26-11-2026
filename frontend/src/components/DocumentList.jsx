import { FileText, FolderOpen } from 'lucide-react';
import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, owner }) {
  if (!documents.length) {
    return <div className="empty-state"><FolderOpen size={28} /><p>Nenhum documento por aqui</p><span>Os documentos enviados aparecerão nesta lista.</span></div>;
  }

  return (
    <div className="document-list">
      <div className="list-header" aria-hidden="true"><span>NOME</span><span>TAMANHO</span><span>DATA DE ENVIO</span><span /></div>
      {documents.map((document) => (
        <div className="document-row" key={document.id}>
          <div className="document-name"><span className="document-icon"><FileText size={19} /></span><span title={document.originalName}>{document.originalName}</span></div>
          <span className="document-meta">{formatSize(document.size)}</span>
          <span className="document-meta">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(document.uploadedAt))}</span>
          <DownloadButton owner={owner} document={document} />
        </div>
      ))}
    </div>
  );
}