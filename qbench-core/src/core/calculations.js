/**
 * Core calculations module
 * Handles all mathematical operations and data processing
 */

export class Calculations {
    constructor(config) {
        this.config = config;
        this.selectedOutputUnits = [];
        this.currentDisplayUnit = 'ppb';
    }

    initialize() {
        console.log('Initializing calculations module...');
        
        // Set up event listeners for calculation triggers
        this.setupEventListeners();
        
        // Initialize unit configuration
        this.initializeUnits();
        
        // Perform initial calculations
        this.performInitialCalculations();
    }

    setupEventListeners() {
        // Listen for final results generation
        const generateBtn = document.getElementById('generate-final-results-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateFinalResults());
        }

        // Listen for settings changes that trigger recalculation
        const sigFigInput = document.getElementById('sig-fig-input');
        if (sigFigInput) {
            sigFigInput.addEventListener('change', () => this.bulkUpdateResults());
        }

        const complianceCheckbox = document.getElementById('compliance-checkbox');
        if (complianceCheckbox) {
            complianceCheckbox.addEventListener('change', () => this.bulkUpdateResults());
        }

        const uncertaintyCheckbox = document.getElementById('uncertainty-checkbox');
        if (uncertaintyCheckbox) {
            uncertaintyCheckbox.addEventListener('change', () => this.bulkUpdateResults());
        }
    }

    initializeUnits() {
        const unitConfig = window.getUnitConfig();
        const allowedUnits = unitConfig.allowed_units || ['ppb'];
        
        // Initialize selected output units
        this.selectedOutputUnits = [...allowedUnits];
        
        // Set initial display unit
        this.currentDisplayUnit = allowedUnits[0] || 'ppb';
        
        console.log('Units initialized:', {
            allowedUnits,
            selectedOutputUnits: this.selectedOutputUnits,
            currentDisplayUnit: this.currentDisplayUnit
        });
    }

    performInitialCalculations() {
        // Perform initial bulk update
        setTimeout(() => {
            this.bulkUpdateResults();
        }, 100);
    }

    /**
     * Main calculation function - updates all results
     */
    bulkUpdateResults() {
        console.log('Performing bulk results update...');
        
        const instrumentData = window.getInstrumentData();
        const liveResults = window.getLiveResults();
        const isomersMap = window.getIsomersMap();
        
        const allAnalytes = new Set([
            ...Object.keys(instrumentData || {}),
            ...Object.keys(liveResults || {})
        ]);

        // First pass: set raw inputs for all direct analytes
        for (const analyte of allAnalytes) {
            if (instrumentData[analyte]) {
                this.processAnalyteData(analyte, instrumentData[analyte]);
            }
        }

        // Second pass: recalculate synthetic analytes from isomers_map
        Object.entries(isomersMap).forEach(([syntheticAnalyte, components]) => {
            this.processSyntheticAnalyte(syntheticAnalyte, components);
        });

        // Update summary and statistics
        this.updateSummary();
        this.updateStatistics();
    }

    /**
     * Process individual analyte data
     */
    processAnalyteData(analyte, data) {
        // Implementation of analyte processing logic
        // This would contain the core calculation logic from the original file
        console.log(`Processing analyte: ${analyte}`, data);
        
        // Calculate final results for each output unit
        this.selectedOutputUnits.forEach(unit => {
            const result = this.calculateAnalyteResult(analyte, data, unit);
            this.updateAnalyteDisplay(analyte, unit, result);
        });
    }

    /**
     * Process synthetic analytes (calculated from components)
     */
    processSyntheticAnalyte(syntheticAnalyte, components) {
        console.log(`Processing synthetic analyte: ${syntheticAnalyte}`, components);
        // Implementation of synthetic analyte calculation
    }

    /**
     * Calculate analyte result for specific unit
     */
    calculateAnalyteResult(analyte, data, unit) {
        // Extract calculation factors
        const ext = parseFloat(document.getElementById('extraction')?.textContent) || 1;
        const dil = parseFloat(document.getElementById('dilution')?.textContent) || 1;
        const wt = parseFloat(document.getElementById('weight')?.textContent) || 1;
        
        const multFactor = (ext * dil) / wt;
        
        // Calculate based on unit
        let result = 0;
        
        // Implementation of unit-specific calculations
        // This would contain the unit conversion logic from the original file
        
        return result;
    }

    /**
     * Update analyte display in tables
     */
    updateAnalyteDisplay(analyte, unit, result) {
        // Update test table cells
        const testCells = document.querySelectorAll(`[name^="ws_final_${analyte}_"][data-unit="${unit}"]`);
        testCells.forEach(cell => {
            cell.textContent = this.formatResult(result);
        });

        // Update summary table cells
        const summaryCells = document.querySelectorAll(`[name^="ws_mean_${analyte}_"][data-unit="${unit}"]`);
        summaryCells.forEach(cell => {
            cell.textContent = this.formatResult(result);
        });
    }

    /**
     * Format result for display
     */
    formatResult(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'NT';
        }
        
        const sigFigs = parseInt(document.getElementById('sig-fig-input')?.value) || this.config.defaults.sigFigs;
        return value.toPrecision(sigFigs);
    }

    /**
     * Update summary table
     */
    updateSummary() {
        console.log('Updating summary...');
        // Implementation of summary update logic
    }

    /**
     * Update statistics table
     */
    updateStatistics() {
        console.log('Updating statistics...');
        // Implementation of statistics update logic
    }

    /**
     * Generate final results JSON
     */
    generateFinalResults() {
        console.log('Generating final results...');
        
        const finalResults = {
            timestamp: new Date().toISOString(),
            analytes: {},
            user_settings: this.getUserSettings(),
            overall_status: this.getOverallStatus()
        };

        // Save to final results field
        const finalField = document.querySelector(this.config.selectors.finalResults);
        if (finalField) {
            finalField.value = JSON.stringify(finalResults, null, 2);
        }

        return finalResults;
    }

    /**
     * Get current user settings
     */
    getUserSettings() {
        return {
            compliance_enabled: document.getElementById('compliance-checkbox')?.checked ?? true,
            uncertainty_enabled: document.getElementById('uncertainty-checkbox')?.checked ?? false,
            sig_figs: parseInt(document.getElementById('sig-fig-input')?.value) || this.config.defaults.sigFigs,
            selected_output_units: this.selectedOutputUnits,
            current_display_unit: this.currentDisplayUnit
        };
    }

    /**
     * Get overall compliance status
     */
    getOverallStatus() {
        const isCompliance = document.getElementById('compliance-checkbox')?.checked ?? true;
        return isCompliance ? "Pass" : "N/A";
    }

    // Getters and setters for unit management
    getSelectedOutputUnits() {
        return this.selectedOutputUnits;
    }

    setSelectedOutputUnits(units) {
        this.selectedOutputUnits = units;
        this.bulkUpdateResults();
    }

    getCurrentDisplayUnit() {
        return this.currentDisplayUnit;
    }

    setCurrentDisplayUnit(unit) {
        this.currentDisplayUnit = unit;
        this.bulkUpdateResults();
    }
}
