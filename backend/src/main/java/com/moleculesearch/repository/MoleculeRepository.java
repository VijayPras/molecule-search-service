package com.moleculesearch.repository;

import com.moleculesearch.entity.Molecule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MoleculeRepository extends JpaRepository<Molecule, Long> {

    Optional<Molecule> findByCanonicalSmiles(String canonicalSmiles);
}
