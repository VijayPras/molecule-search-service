package com.moleculesearch.service;

import org.openscience.cdk.exception.CDKException;
import org.openscience.cdk.interfaces.IAtomContainer;
import org.openscience.cdk.isomorphism.Pattern;
import org.openscience.cdk.smarts.SmartsPattern;
import org.springframework.stereotype.Service;

/**
 * Compiles SMARTS queries and tests molecules against them — the
 * "does this molecule contain this fragment" half of the service.
 *
 * NOTE: same compile-test caveat as FingerprintService — SmartsPattern /
 * Pattern is CDK's modern (2.x) substructure-matching API, documented but
 * not verified against the real jar in this environment.
 */
@Service
public class SubstructureService {

    /** Compiles a SMARTS string into a reusable, matchable pattern. */
    public Pattern compile(String smarts) throws CDKException {
        return SmartsPattern.create(smarts);
    }

    /** True if the molecule contains the fragment described by the compiled pattern. */
    public boolean matches(Pattern pattern, IAtomContainer molecule) {
        return pattern.matches(molecule);
    }
}
