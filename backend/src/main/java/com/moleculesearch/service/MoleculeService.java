package com.moleculesearch.service;

import com.moleculesearch.entity.Molecule;
import com.moleculesearch.repository.MoleculeRepository;
import org.openscience.cdk.exception.CDKException;
import org.openscience.cdk.interfaces.IAtomContainer;
import org.openscience.cdk.isomorphism.Pattern;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MoleculeService {

    private final MoleculeRepository moleculeRepository;
    private final FingerprintService fingerprintService;
    private final SubstructureService substructureService;

    public MoleculeService(MoleculeRepository moleculeRepository,
                            FingerprintService fingerprintService,
                            SubstructureService substructureService) {
        this.moleculeRepository = moleculeRepository;
        this.fingerprintService = fingerprintService;
        this.substructureService = substructureService;
    }

    /**
     * Loads molecules from a CSV with columns:
     * molecule_id,canonical_smiles,molecular_weight,compound_name,target
     *
     * Skips rows that fail to parse (bad SMILES) and reports them instead of
     * failing the whole load. Does nothing if the database already has data,
     * so restarting the container doesn't re-load or duplicate rows.
     */
    public LoadResult loadFromCsv(String path) {
        if (moleculeRepository.count() > 0) {
            return new LoadResult(0, List.of(
                    "Skipped: database already has " + moleculeRepository.count() + " molecules"));
        }

        int loaded = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            String header = reader.readLine(); // discard header row
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                String[] parts = line.split(",", -1);
                if (parts.length < 2) {
                    continue;
                }

                String smiles = parts[1].trim();
                try {
                    moleculeRepository.save(buildMolecule(smiles, parts));
                    loaded++;
                } catch (Exception e) {
                    errors.add("Row for SMILES '" + smiles + "' failed: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            errors.add("Could not read file '" + path + "': " + e.getMessage());
        }

        return new LoadResult(loaded, errors);
    }

    private Molecule buildMolecule(String smiles, String[] parts) throws CDKException {
        IAtomContainer mol = fingerprintService.parseSmiles(smiles);
        byte[] fingerprint = fingerprintService.computeFingerprint(mol);

        Molecule molecule = new Molecule();
        molecule.setCanonicalSmiles(smiles);
        molecule.setFingerprint(fingerprint);

        if (parts.length > 2 && !parts[2].isBlank()) {
            try {
                molecule.setMolecularWeight(Double.parseDouble(parts[2].trim()));
            } catch (NumberFormatException ignored) {
                // leave molecular weight null rather than failing the whole row
            }
        }
        if (parts.length > 3) {
            molecule.setCompoundName(parts[3].trim());
        }
        return molecule;
    }

    /** Naive O(n) scan — fine up to ~100k molecules. See the Phase 3 notes on indexing if you outgrow this. */
    public List<SimilarityMatch> findSimilar(String querySmiles, double threshold) throws CDKException {
        IAtomContainer queryMol = fingerprintService.parseSmiles(querySmiles);
        byte[] queryFingerprint = fingerprintService.computeFingerprint(queryMol);

        return moleculeRepository.findAll().stream()
                .map(m -> new SimilarityMatch(m, fingerprintService.tanimotoSimilarity(queryFingerprint, m.getFingerprint())))
                .filter(match -> match.score() >= threshold)
                .sorted(Comparator.comparingDouble(SimilarityMatch::score).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Naive O(n) scan: re-parses every stored molecule's SMILES and tests it
     * against the compiled SMARTS pattern. There's no persisted structural
     * index to check against (unlike similarity search, which compares
     * pre-computed fingerprint bytes), so this is the most expensive
     * endpoint in the service — expect it to be noticeably slower than
     * similarity search even on this small dataset. See the Phase 3 notes
     * on indexing if you outgrow this.
     *
     * Molecules that fail to re-parse are skipped rather than failing the
     * whole search — a single bad row shouldn't take down every other result.
     */
    public List<Molecule> findBySubstructure(String smarts) throws CDKException {
        Pattern pattern = substructureService.compile(smarts);

        List<Molecule> matches = new ArrayList<>();
        for (Molecule molecule : moleculeRepository.findAll()) {
            try {
                IAtomContainer mol = fingerprintService.parseSmiles(molecule.getCanonicalSmiles());
                if (substructureService.matches(pattern, mol)) {
                    matches.add(molecule);
                }
            } catch (Exception e) {
                // skip molecules that fail to re-parse rather than aborting the whole search
            }
        }
        return matches;
    }

    public long count() {
        return moleculeRepository.count();
    }

    public record LoadResult(int loaded, List<String> errors) {
    }

    public record SimilarityMatch(Molecule molecule, double score) {
    }
}
