const SIMILARITY_EXAMPLES = [
  { label: 'Ibuprofen', value: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O' },
  { label: 'Caffeine', value: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C' },
  { label: 'Aspirin', value: 'CC(=O)OC1=CC=CC=C1C(=O)O' },
];

const SUBSTRUCTURE_EXAMPLES = [
  { label: 'Benzene ring', value: 'c1ccccc1' },
  { label: 'Carboxylic acid', value: 'C(=O)O' },
  { label: 'Hydroxyl group', value: '[OX2H]' },
];

export default function SearchPanel({
  mode,
  onModeChange,
  smiles,
  onSmilesChange,
  smarts,
  onSmartsChange,
  threshold,
  onThresholdChange,
  onSearch,
  isSearching,
  isInvalid,
}) {
  const isSimilarity = mode === 'similarity';
  const examples = isSimilarity ? SIMILARITY_EXAMPLES : SUBSTRUCTURE_EXAMPLES;
  const value = isSimilarity ? smiles : smarts;
  const onChange = isSimilarity ? onSmilesChange : onSmartsChange;

  return (
    <div className="panel">
      <div className="mode-toggle" role="tablist">
        <button
          role="tab"
          aria-selected={isSimilarity}
          className={`mode-button${isSimilarity ? ' active' : ''}`}
          onClick={() => onModeChange('similarity')}
        >
          Similarity
        </button>
        <button
          role="tab"
          aria-selected={!isSimilarity}
          className={`mode-button${!isSimilarity ? ' active' : ''}`}
          onClick={() => onModeChange('substructure')}
        >
          Substructure
        </button>
      </div>

      <div className="field">
        <p className="panel-label">{isSimilarity ? 'SMILES' : 'SMARTS'}</p>
        <p className="panel-hint">
          {isSimilarity
            ? 'The structure you want to find relatives of.'
            : 'The fragment every result must contain.'}
        </p>
        <textarea
          className={`smiles-input${isInvalid ? ' invalid' : ''}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSimilarity ? 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O' : 'c1ccccc1'}
          spellCheck={false}
        />
      </div>

      {isSimilarity && (
        <div className="field">
          <p className="panel-label">Similarity threshold</p>
          <p className="panel-hint">Lower shows more distant matches.</p>
          <div className="threshold-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
            />
            <span className="threshold-value">{threshold.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button className="search-button" onClick={onSearch} disabled={isSearching || !value.trim()}>
        {isSearching ? 'Searching…' : 'Search'}
      </button>

      <div className="examples">
        <p className="panel-label">Try one</p>
        <ul>
          {examples.map((ex) => (
            <li key={ex.label}>
              <button className="example-button" onClick={() => onChange(ex.value)}>
                {ex.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
