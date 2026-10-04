package com.moleculesearch.dto;

public record MoleculeResult(
        Long id,
        String canonicalSmiles,
        String compoundName,
        Double molecularWeight,
        double similarityScore
) {
}
