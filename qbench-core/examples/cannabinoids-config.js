/**
 * Example configuration for a cannabinoids worksheet
 * This file shows how to configure the QBench worksheet for a specific site
 */

// Site-specific configuration for cannabinoids worksheet
const CANNABINOIDS_CONFIG = {
    // Field mappings - customize these for your QBench instance
    fieldMappings: {
        sampleWeight: "tests[0].sample.unit_weight",  // Could be "serving_weight" on other sites
        sampleId: "tests[0].sample.sample_id",
        instrumentResults: "ws_instrument_results",
        finalResults: "ws_final_results",
        liveResults: "ws_live_results",
        deviations: "ws_deviations"
    },

    // CSS selectors for JSON data elements
    selectors: {
        unitConfig: "#ws-unit-config",
        sampleInfo: "#ws-sample-info", 
        isomersMap: "#ws-isomers-map",
        instrumentResults: '[name="ws_instrument_results"]',
        finalResults: '[name="ws_final_results"]',
        liveResults: '[name="ws_live_results"]'
    },

    // Feature toggles
    features: {
        uncertaintyCalculations: true,
        multiUnitOutput: true,
        dataIntegrity: true,
        moistureCorrection: true,
        conditionFields: true,  // Enable for Confident Cannabis integration
        rsdDiagnostics: true
    },

    // Default values
    defaults: {
        sigFigs: 3,
        rsdWarningLimit: 15,
        rsdFailLimit: 25,
        complianceMode: true
    },

    // Custom calculation parameters
    calculations: {
        // Uncertainty calculation settings for USDA hemp regulations
        uncertaintyMultiplier: 1.96, // 95% confidence interval
        
        // Unit conversion factors
        unitConversions: {
            'ppb_to_mg/g': 0.001,
            'ppb_to_mg/serving': (ppb, servingWeight) => (ppb * 0.001 * servingWeight) / 1000,
            'ppb_to_mg/package': (ppb, servingWeight, servingsPerPackage) => 
                (ppb * 0.001 * servingWeight * servingsPerPackage) / 1000
        }
    },

    // Limit lookup configuration
    limits: {
        // Matrix-based limit lookup (for metals, etc.)
        matrixBased: true,
        
        // Fallback to simple limits if matrix lookup fails
        fallbackToSimple: true
    },

    // Moisture correction settings
    moisture: {
        // Enable automatic moisture correction application
        autoApply: true,
        
        // Moisture basis for reporting
        reportingBasis: "dry_weight"  // or "as_tested"
    }
};

// Export for use in worksheet
window.QBENCH_CONFIG = CANNABINOIDS_CONFIG;
