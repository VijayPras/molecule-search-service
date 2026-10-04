package com.moleculesearch.service;

import org.openscience.cdk.exception.CDKException;
import org.openscience.cdk.fingerprint.CircularFingerprinter;
import org.openscience.cdk.fingerprint.IBitFingerprint;
import org.openscience.cdk.interfaces.IAtomContainer;
import org.openscience.cdk.silent.SilentChemObjectBuilder;
import org.openscience.cdk.smiles.SmilesParser;
import org.openscience.cdk.tools.manipulator.AtomContainerManipulator;
import org.springframework.stereotype.Service;

import java.util.BitSet;

/**
 * Wraps CDK's molecule parsing and fingerprinting so the rest of the app
 * never touches CDK types directly.
 *
 * NOTE ON THIS FIRST DRAFT: this sandbox could not reach Maven Central to
 * compile-test this class against the real cdk-bundle jar. The CDK API
 * calls below (SmilesParser, AtomContainerManipulator,
 * CircularFingerprinter) are correct as of CDK 2.x from documentation, but
 * if `mvn -f backend/pom.xml compile` reports an error in THIS file
 * specifically, it is almost certainly a method name drift between CDK
 * versions — paste the error back and it's a quick fix.
 */
@Service
public class FingerprintService {

    private final SmilesParser smilesParser = new SmilesParser(SilentChemObjectBuilder.getInstance());

    /**
     * Parses a SMILES string into a CDK molecule and configures atom types —
     * required before fingerprinting will produce meaningful bits.
     */
    public IAtomContainer parseSmiles(String smiles) throws CDKException {
        IAtomContainer mol = smilesParser.parseSmiles(smiles);
        AtomContainerManipulator.percieveAtomTypesAndConfigureAtoms(mol); // "percieve" is CDK's (misspelled) method name
        return mol;
    }

    /** ECFP4-equivalent circular fingerprint, packed into a byte array for storage. */
    public byte[] computeFingerprint(IAtomContainer mol) throws CDKException {
        CircularFingerprinter fingerprinter = new CircularFingerprinter(CircularFingerprinter.CLASS_ECFP4);
        IBitFingerprint bitFp = fingerprinter.getBitFingerprint(mol);
        return bitSetToBytes(bitFp.asBitSet(), fingerprinter.getSize());
    }

    /**
     * Tanimoto similarity = |A ∩ B| / |A ∪ B|.
     * Computed directly on the packed bits rather than via CDK's own
     * Tanimoto helper, to keep this independent of that class's exact
     * signature across CDK versions.
     */
    public double tanimotoSimilarity(byte[] fingerprintA, byte[] fingerprintB) {
        BitSet a = bytesToBitSet(fingerprintA);
        BitSet b = bytesToBitSet(fingerprintB);

        BitSet intersection = (BitSet) a.clone();
        intersection.and(b);

        BitSet union = (BitSet) a.clone();
        union.or(b);

        int unionCount = union.cardinality();
        if (unionCount == 0) {
            return 0.0;
        }
        return (double) intersection.cardinality() / unionCount;
    }

    private byte[] bitSetToBytes(BitSet bits, int size) {
        byte[] bytes = new byte[(size + 7) / 8];
        for (int i = 0; i < size; i++) {
            if (bits.get(i)) {
                bytes[i / 8] |= (byte) (1 << (i % 8));
            }
        }
        return bytes;
    }

    private BitSet bytesToBitSet(byte[] bytes) {
        BitSet bits = new BitSet(bytes.length * 8);
        for (int i = 0; i < bytes.length * 8; i++) {
            if ((bytes[i / 8] & (1 << (i % 8))) != 0) {
                bits.set(i);
            }
        }
        return bits;
    }
}
