package com.moleculesearch;

import com.moleculesearch.service.MoleculeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MoleculeSearchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoleculeSearchServiceApplication.class, args);
    }

    /**
     * On startup, loads the sample ChEMBL CSV into the database if it's empty.
     * This keeps the first-run experience to a single `docker-compose up` —
     * no manual data loading step.
     */
    @Bean
    CommandLineRunner loadInitialData(MoleculeService moleculeService,
                                       @Value("${app.chembl-data-path:/data/chembl_sample.csv}") String dataPath) {
        return args -> {
            MoleculeService.LoadResult result = moleculeService.loadFromCsv(dataPath);
            System.out.println("[startup] Loaded " + result.loaded() + " molecules from " + dataPath);
            if (!result.errors().isEmpty()) {
                System.out.println("[startup] " + result.errors().size() + " row(s) had issues:");
                result.errors().forEach(e -> System.out.println("  - " + e));
            }
        };
    }
}
