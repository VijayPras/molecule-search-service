package com.moleculesearch.dto;

/** No similarity score here — substructure matches are binary (contains it or doesn't), unlike fingerprint similarity. */
public record SubstructureResult(
        Long id,
        String canonicalSmiles,
        String compoundName,
        Double molecularWeight
) {
}
