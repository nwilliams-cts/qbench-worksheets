/**
 * Migration Example - Legacy to Modular
 * This example shows how to migrate from the existing monolithic worksheet
 * to the new modular system with minimal changes.
 */

// Legacy worksheet configuration for the existing sampleWorksheet.html
const legacyConfig = {
    fields: {
        // Map existing field names to selectors
        sampleWeight: 'input[name="sample_weight"]',
        sampleId: 'input[name="sample_id"]',
        instrumentResults: 'textarea[name="ws_instrument_results"]',
        finalResults: 'textarea[name="ws_final_results"]',
        liveResults: 'textarea[name="ws_live_results"]',
        deviations: 'textarea[name="ws_deviations"]',
        
        // UI element selectors from existing worksheet
        unitConfig: '#ws-unit-config',
        sampleInfo: '#ws-sample-info',
        isomersMap: '#ws-isomers-map',
        
        // Input and control selectors
        calculationInputs: '.ws-instrument',
        includeCheckboxes: '.ws-include, .ws-include-all',
        
        // Settings controls
        sigFigs: '#sig-fig-input',
        complianceMode: '#compliance-checkbox',
        uncertaintyMode: '#uncertainty-checkbox',
        rsdCheckEnabled: '#rsd-check-enabled',
        rsdWarningLimit: '#rsd-warning-limit',
        rsdFailLimit: '#rsd-fail-limit',
        moistureCorrectionEnabled: '#moisture-correction-enabled',
        moistureReportingEnabled: '#moisture-reporting-enabled'
    },
    
    selectors: {
        // Table selectors
        summaryTable: '#ws-summary-body',
        statisticsTable: '#ws-statistics-body',
        testTables: '[id^="ws-tab-"]:not(#ws-tab-summary):not(#ws-tab-statistics)',
        
        // Tab selectors
        tabButtons: '.ws-tab-btn',
        tabContents: '.ws-tab-content',
        
        // Modal selectors
        deviationModal: '#deviation-modal',
        deviationReviewModal: '#deviation-review-modal',
        
        // Button selectors
        generateResultsBtn: '#generate-final-results-btn',
        viewResultsBtn: '#view-final-results-btn',
        unlockDataBtn: '#unlock-data-btn',
        lockDataBtn: '#lock-data-btn'
    },
    
    features: {
        multiUnit: true,
        dataIntegrity: true,
        conditionFields: true,
        autoCalculate: true,
        auditTrail: true,
        moistureCorrection: true,
        uncertaintyCalculations: true
    },
    
    calculations: {
        precision: 3,
        roundingMode: 'round',
        units: ['mg/g', '%', 'ppm', 'mg/serving', 'mg/package'],
        defaultUnit: 'mg/g'
    },
    
    dataIntegrity: {
        trackDeviations: true,
        autoLock: false,
        maxDeviation: 10
    },
    
    defaults: {
        sigFigs: 3,
        rsdWarningLimit: 15,
        rsdFailLimit: 25,
        complianceMode: true,
        uncertaintyMode: false,
        moistureCorrection: false
    }
};

export default legacyConfig;
