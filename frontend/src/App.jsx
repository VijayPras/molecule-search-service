import { useEffect, useState } from 'react';
import SearchPanel from './components/SearchPanel.jsx';
import ResultsList from './components/ResultsList.jsx';
import LearnPage from './components/LearnPage.jsx';
import { fetchStats, searchSimilar, searchSubstructure } from './api.js';

export default function App() {
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('search'); // 'search' | 'learn'
  const [mode, setMode] = useState('similarity'); // 'similarity' | 'substructure'

  const [smiles, setSmiles] = useState('CC(C)CC1=CC=C(C=C1)C(C)C(=O)O');
  const [smarts, setSmarts] = useState('c1ccccc1');
  const [threshold, setThreshold] = useState(0.3);

  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setStatus('idle');
    setResults([]);
    setError('');
  }

  async function handleSearch() {
    setStatus('loading');
    setError('');
    try {
      const data = mode === 'similarity' ? await searchSimilar(smiles, threshold) : await searchSubstructure(smarts);
      setResults(data);
      setStatus('done');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Molecule Search</h1>
        <nav className="view-nav">
          <button className={view === 'search' ? 'view-link active' : 'view-link'} onClick={() => setView('search')}>
            Search
          </button>
          <button className={view === 'learn' ? 'view-link active' : 'view-link'} onClick={() => setView('learn')}>
            Learn
          </button>
        </nav>
        <div className="status">
          {stats ? (
            <>
              <strong>{stats.totalMolecules}</strong> molecules indexed · local instance
            </>
          ) : (
            'connecting to API…'
          )}
        </div>
      </header>

      {view === 'search' ? (
        <div className="layout">
          <SearchPanel
            mode={mode}
            onModeChange={handleModeChange}
            smiles={smiles}
            onSmilesChange={setSmiles}
            smarts={smarts}
            onSmartsChange={setSmarts}
            threshold={threshold}
            onThresholdChange={setThreshold}
            onSearch={handleSearch}
            isSearching={status === 'loading'}
            isInvalid={status === 'error'}
          />
          <ResultsList mode={mode} status={status} error={error} results={results} />
        </div>
      ) : (
        <LearnPage />
      )}
    </div>
  );
}
