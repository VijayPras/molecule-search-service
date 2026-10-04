package com.moleculesearch.controller;

import com.moleculesearch.dto.MoleculeResult;
import com.moleculesearch.dto.SimilarityRequest;
import com.moleculesearch.dto.SubstructureRequest;
import com.moleculesearch.dto.SubstructureResult;
import com.moleculesearch.entity.Molecule;
import com.moleculesearch.service.MoleculeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/molecules")
@CrossOrigin(origins = "*") // fine for a local/dev tool; tighten before any public deployment
public class MoleculeController {

    private final MoleculeService moleculeService;

    public MoleculeController(MoleculeService moleculeService) {
        this.moleculeService = moleculeService;
    }

    @PostMapping("/search/similar")
    public ResponseEntity<?> searchSimilar(@RequestBody SimilarityRequest request) {
        try {
            double threshold = request.threshold() != null ? request.threshold() : 0.8;
            List<MoleculeResult> results = moleculeService.findSimilar(request.smiles(), threshold)
                    .stream()
                    .map(match -> new MoleculeResult(
                            match.molecule().getId(),
                            match.molecule().getCanonicalSmiles(),
                            match.molecule().getCompoundName(),
                            match.molecule().getMolecularWeight(),
                            match.score()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Could not process SMILES: " + request.smiles(),
                    "details", String.valueOf(e.getMessage())
            ));
        }
    }

    @PostMapping("/search/substructure")
    public ResponseEntity<?> searchSubstructure(@RequestBody SubstructureRequest request) {
        try {
            List<SubstructureResult> results = moleculeService.findBySubstructure(request.smarts())
                    .stream()
                    .map(this::toSubstructureResult)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Could not process SMARTS: " + request.smarts(),
                    "details", String.valueOf(e.getMessage())
            ));
        }
    }

    private SubstructureResult toSubstructureResult(Molecule m) {
        return new SubstructureResult(m.getId(), m.getCanonicalSmiles(), m.getCompoundName(), m.getMolecularWeight());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(Map.of("totalMolecules", moleculeService.count()));
    }
}
