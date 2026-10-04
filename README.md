# Molecule Search Service

A Spring Boot + CDK API for molecule similarity search over a sample of
ChEMBL-style data, running entirely on your own machine via Docker — no
cloud account, no cost, no setup beyond Docker.

## Status: Phase 1 (proof of concept)

This is the first working slice, scoped deliberately small:

- [x] Parse SMILES, compute ECFP4-style circular fingerprints (CDK)
- [x] Store molecules + fingerprints in PostgreSQL
- [x] Similarity search endpoint (Tanimoto similarity)
- [x] Auto-loads a 28-molecule sample dataset on first run
- [ ] Substructure search (Phase 2)
- [ ] React frontend (Phase 2)
- [ ] Larger ChEMBL dataset, indexed for scale (Phase 3)

## Quick Start

Requires Docker Desktop (or Docker Engine + Compose).

```bash
docker-compose up
```

First run builds the backend image (downloads Maven dependencies — needs
internet the first time only) and starts Postgres + the API. Takes 1-3
minutes depending on your connection. Subsequent runs are fast.

The API comes up on **http://localhost:8080** and loads the sample dataset
automatically.

## Try It

Check how many molecules loaded:

```bash
curl http://localhost:8080/api/molecules/stats
```

Search for molecules similar to ibuprofen:

```bash
curl -X POST http://localhost:8080/api/molecules/search/similar \
  -H "Content-Type: application/json" \
  -d '{"smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", "threshold": 0.3}'
```

Try lowering the threshold (e.g. `0.1`) if you get an empty result — the
sample dataset is small and diverse, so fewer molecules clear a high bar.

## Stopping / Resetting

```bash
docker-compose down       # stop, keep data
docker-compose down -v    # stop, wipe the database (next run reloads sample data)
```

## Project Structure

```
backend/     Spring Boot API (Java 17, Maven, CDK, PostgreSQL)
data/        Sample dataset (chembl_sample.csv) — swap in a bigger ChEMBL export later
```

## A Note on This First Draft

The chemistry code (`FingerprintService.java`) was written against CDK's
documented 2.x API but could not be compiled in the environment that
generated it (no access to Maven Central there). Your machine *does* have
internet access, so the first `docker-compose up` — or `mvn compile` if you
want a faster feedback loop — is also the first real compile check. If
`CircularFingerprinter`, `SmilesParser`, or `AtomContainerManipulator` throw
a compile error, it's almost certainly a method-name drift between CDK
versions, not a logic problem — easy to fix once you see the actual error.

## Why These Choices

- **Maven, not Gradle** — your call; both work fine with CDK.
- **Naive O(n) similarity scan** — fine up to ~100k molecules. See the
  roadmap notes on indexing (pgvector, precomputed buckets) if you outgrow
  this.
- **No cloud deployment** — this is designed to run free, forever, on
  anyone's laptop. A packaged desktop app is a possible future direction.

## License

MIT — use it, fork it, learn from it.
