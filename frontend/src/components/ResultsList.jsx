import MoleculeStructure from './MoleculeStructure.jsx';
import ScoreBar from './ScoreBar.jsx';

export default function ResultsList({ mode, status, error, results }) {
  const isSimilarity = mode === 'similarity';

  if (status === 'idle') {
    return (
      <div className="state-message">
        {isSimilarity
          ? 'Paste a SMILES string on the left and search to see similar molecules ranked by fingerprint similarity.'
          : 'Paste a SMARTS pattern on the left and search to find every molecule that contains it.'}
      </div>
    );
  }

  if (status === 'loading') {
    return <div className="state-message">Searching…</div>;
  }

  if (status === 'error') {
    return <div className="state-message error">{error}</div>;
  }

  if (results.length === 0) {
    return (
      <div className="state-message">
        {isSimilarity
          ? 'No molecules met that similarity threshold. Try lowering it — a 0.0 threshold returns every molecule ranked.'
          : "No molecules contain that fragment. Check the SMARTS syntax, or try one of the examples on the left."}
      </div>
    );
  }

  const rowClass = `result-row${isSimilarity ? '' : ' substructure'}`;
  const headClass = `results-head${isSimilarity ? '' : ' substructure'}`;

  return (
    <div>
      <div className="results-count">
        {results.length} match{results.length === 1 ? '' : 'es'}
      </div>
      <div className={headClass}>
        <span>Structure</span>
        <span>Molecule</span>
        <span>MW</span>
        {isSimilarity && <span>Similarity</span>}
      </div>
      {results.map((r) => (
        <div className={rowClass} key={r.id}>
          <div className="structure-cell">
            <MoleculeStructure smiles={r.canonicalSmiles} size={72} />
          </div>
          <div className="molecule-info">
            <div className="molecule-name">{r.compoundName || 'unnamed'}</div>
            <div className="molecule-smiles">{r.canonicalSmiles}</div>
          </div>
          <div className="molecule-mw">{r.molecularWeight ? r.molecularWeight.toFixed(1) : '—'}</div>
          {isSimilarity && <ScoreBar score={r.similarityScore} />}
        </div>
      ))}
    </div>
  );
}
