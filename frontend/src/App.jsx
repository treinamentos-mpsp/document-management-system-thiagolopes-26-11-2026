import { useEffect, useState } from 'react';
import { ArrowRight, Files, FolderOpen, RefreshCw } from 'lucide-react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/documents.js';
import './App.css';

function DocumentWorkspace({ owner }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    listDocuments(owner, controller.signal)
      .then(setDocuments)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [owner, revision]);

  function refreshDocuments() {
    setRevision((current) => current + 1);
  }

  return (
    <>
      <UploadComponent owner={owner} onUploaded={refreshDocuments} />
      <section className="documents-section" aria-labelledby="documents-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SEU ESPAÇO</p>
            <h2 id="documents-title">Documentos <span className="count">{documents.length}</span></h2>
          </div>
          <button className="icon-button" type="button" onClick={refreshDocuments} disabled={loading} title="Atualizar lista" aria-label="Atualizar lista">
            <RefreshCw size={18} />
          </button>
        </div>
        {error && <p className="message error" role="alert">{error}</p>}
        {loading ? <p className="list-status" role="status">Carregando documentos...</p> : !error && <DocumentList documents={documents} owner={owner} />}
      </section>
    </>
  );
}

export default function App() {
  const [ownerInput, setOwnerInput] = useState('');
  const [owner, setOwner] = useState('');

  function selectOwner(event) {
    event.preventDefault();
    const selectedOwner = ownerInput.trim();
    if (selectedOwner) setOwner(selectedOwner);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand"><span className="brand-mark"><Files size={19} /></span><span>arquivo<span className="brand-dot">.</span></span></div>
          <span className="header-label">GESTÃO DE DOCUMENTOS</span>
        </div>
      </header>
      <main className="main-content">
        <div className="page-heading">
          <div><p className="eyebrow">ÁREA DE TRABALHO</p><h1>Meus documentos</h1><p className="subtitle">Seus arquivos, organizados em um só lugar.</p></div>
          <div className="heading-icon" aria-hidden="true"><FolderOpen size={25} /></div>
        </div>
        <section className="identity-bar" aria-label="Identificação do usuário">
          <div className="identity-copy"><span className="identity-dot" /><span>{owner ? `Usuário atual: ${owner}` : 'Identifique-se para acessar seus documentos'}</span></div>
          <form className="identity-form" onSubmit={selectOwner}>
            <label className="visually-hidden" htmlFor="owner">Identificação do usuário</label>
            <input id="owner" value={ownerInput} onChange={(event) => setOwnerInput(event.target.value)} placeholder="Identificação do usuário" required />
            <button type="submit" title="Acessar documentos" aria-label="Acessar documentos"><ArrowRight size={18} /></button>
          </form>
        </section>
        {owner ? <DocumentWorkspace key={owner} owner={owner} /> : <div className="welcome-state"><FolderOpen size={30} /><p>Nenhum usuário selecionado</p></div>}
      </main>
      <footer><span>ARQUIVO</span><span>Gestão de documentos</span></footer>
    </div>
  );
}
