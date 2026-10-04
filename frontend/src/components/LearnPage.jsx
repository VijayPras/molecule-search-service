import MoleculeStructure from './MoleculeStructure.jsx';

function Example({ smiles, label }) {
  return (
    <div className="learn-example">
      <MoleculeStructure smiles={smiles} size={88} />
      <div className="learn-example-label">{label}</div>
      <div className="learn-example-smiles">{smiles}</div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <article className="learn">
      <section className="learn-section">
        <h2>SMILES: writing a molecule as text</h2>
        <p>
          SMILES (Simplified Molecular Input Line Entry System) is a way of writing a molecule's structure as a
          short line of text. Atoms are letters — C for carbon, O for oxygen, N for nitrogen — written in the
          order they're bonded. A bond is implied between adjacent atoms; <code>=</code> marks a double bond and{' '}
          <code>#</code> a triple bond. Lowercase letters (<code>c</code>, <code>n</code>, <code>o</code>) mark
          aromatic atoms — the kind found in ring systems like benzene, where electrons are shared around the
          ring rather than locked into fixed double bonds. A number appearing twice marks where a ring closes.
        </p>

        <div className="learn-examples">
          <Example smiles="CCO" label="Ethanol — two carbons, one oxygen" />
          <Example smiles="c1ccccc1" label="Benzene — a 6-membered aromatic ring" />
          <Example smiles="CC(=O)O" label="Acetic acid — the =O and O are the acid group" />
        </div>

        <p>
          The same molecule can usually be written as SMILES in more than one way — <code>CCO</code> and{' '}
          <code>OCC</code> both describe ethanol, just starting from a different atom. This service stores a{' '}
          <em>canonical</em> SMILES for each molecule — one agreed-upon form — so the same structure always
          looks the same in the database.
        </p>
      </section>

      <section className="learn-section">
        <h2>Fingerprints: turning structure into bits</h2>
        <p>
          To compare molecules quickly, this service doesn't compare SMILES strings directly — it compares{' '}
          <strong>fingerprints</strong>. A fingerprint is a fixed-length list of bits, where each bit records
          whether a particular small local pattern — a few connected atoms, roughly — appears anywhere in the
          molecule. Two molecules that share a lot of local structure end up with a lot of the same bits set,
          even if their overall size or shape differs.
        </p>
        <p>
          Specifically, this service uses a <em>circular fingerprint</em> (ECFP4-style): for every atom, it
          looks outward a few bonds in every direction, and hashes what it finds into the fingerprint. It's
          called "circular" because the search radiates outward from each atom like ripples.
        </p>
      </section>

      <section className="learn-section">
        <h2>Tanimoto similarity: scoring the overlap</h2>
        <p>
          Once two molecules are reduced to fingerprints, <strong>Tanimoto similarity</strong> scores how much
          they overlap:
        </p>
        <div className="learn-formula">Tanimoto = (bits both share) ÷ (bits either one has)</div>
        <p>
          A score of <code>1.0</code> means the fingerprints are identical — almost always the same molecule. A
          score of <code>0.0</code> means they share nothing. This is what the <strong>Similarity</strong> search
          tab computes: it fingerprints your query, fingerprints every stored molecule, and ranks by this score.
        </p>
        <p>
          It's worth being precise about what this does and doesn't mean. A high score means two molecules share
          a lot of local atomic neighborhoods — it doesn't mean they look alike to the eye, or do the same thing
          biologically, only that their immediate chemistry is statistically similar.
        </p>
      </section>

      <section className="learn-section">
        <h2>SMARTS: searching for a pattern instead of a molecule</h2>
        <p>
          SMILES describes one specific molecule. <strong>SMARTS</strong> extends that same notation into a
          query language — a SMARTS string describes a <em>pattern</em> that can match many different molecules,
          the way a regular expression matches many strings rather than one exact piece of text. The{' '}
          <strong>Substructure</strong> search tab compiles your SMARTS pattern and checks every stored molecule
          to see whether that pattern occurs anywhere inside it — this is a structural "contains," not a
          similarity score, so a molecule either matches or it doesn't.
        </p>

        <table className="learn-table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Matches</th>
              <th>Example hits</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>c1ccccc1</code></td>
              <td>a benzene-type aromatic ring</td>
              <td>benzene, toluene, aspirin</td>
            </tr>
            <tr>
              <td><code>C(=O)O</code></td>
              <td>a carbon double-bonded to one oxygen, single-bonded to another</td>
              <td>acetic acid, benzoic acid</td>
            </tr>
            <tr>
              <td><code>[OX2H]</code></td>
              <td>an oxygen with exactly two connections, at least one a hydrogen (a hydroxyl group)</td>
              <td>ethanol, phenol</td>
            </tr>
          </tbody>
        </table>
      </section>
    </article>
  );
}
