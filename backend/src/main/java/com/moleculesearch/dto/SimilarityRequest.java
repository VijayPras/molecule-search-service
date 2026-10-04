package com.moleculesearch.dto;

/** threshold is optional — null means "use the default (0.8)". */
public record SimilarityRequest(String smiles, Double threshold) {
}
