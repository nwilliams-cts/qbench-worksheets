/**
 * Condition Fields module for QBench/Confident Cannabis integration
 * Creates individual QWML condition fields for each analyte result
 */

export class ConditionFields {
    constructor(config) {
        this.config = config;
    }

    initialize() {
        console.log('Initializing condition fields module...');
        
        // Set up event listener for final results generation
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for final results generation to populate condition fields
        const generateBtn = document.getElementById('generate-final-results-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                setTimeout(() => this.populateConditionFields(), 100);
            });
        }
    }

    /**
     * Main function to populate all condition fields
     */
    populateConditionFields() {
        console.log('Populating condition fields for Confident Cannabis integration...');
        
        const analytes = this.getAnalyteList();
        const unitConfig = window.getUnitConfig();
        
        analytes.forEach(analyte => {
            const analyteData = this.getAnalyteData(analyte);
            
            if (analyteData) {
                this.createConditionFieldsForAnalyte(analyte, analyteData, unitConfig);
            }
        });
        
        console.log('Condition fields population complete');
    }

    /**
     * Get list of all analytes from the worksheet
     */
    getAnalyteList() {
        const analytes = new Set();
        
        // Get analytes from summary table
        const summaryRows = document.querySelectorAll('#ws-summary-body tr[data-ws-analyte]');
        summaryRows.forEach(row => {
            const analyte = row.getAttribute('data-ws-analyte');
            if (analyte) analytes.add(analyte);
        });
        
        return Array.from(analytes);
    }

    /**
     * Get calculated data for a specific analyte
     */
    getAnalyteData(analyte) {
        // Get mean result from summary table
        const summaryRow = document.querySelector(`#ws-summary-body tr[data-ws-analyte="${analyte}"]`);
        if (!summaryRow) return null;

        // Get the result for the primary unit (first selected unit)
        const calculations = window.QBenchWorksheet.getModule('calculations');
        const selectedUnits = calculations.getSelectedOutputUnits();
        const primaryUnit = selectedUnits[0];
        
        const resultCell = summaryRow.querySelector(`[name="ws_mean_${analyte}_${primaryUnit}"]`);
        const limitCell = summaryRow.querySelector('.ws-summary-limit');
        const statusCell = summaryRow.querySelector('.ws-summary-status');

        return {
            result: this.parseResultValue(resultCell?.textContent),
            limit: this.parseLimitValue(limitCell?.textContent),
            status: statusCell?.textContent?.trim(),
            unit: primaryUnit,
            lod: this.getLODValue(analyte),
            loq: this.getLOQValue(analyte)
        };
    }

    /**
     * Parse result value for Confident Cannabis (must be numeric)
     */
    parseResultValue(resultText) {
        if (!resultText) return 0;
        
        const text = resultText.trim();
        
        // Handle special values
        if (text === 'NT' || text === 'ND') {
            return 0;
        }
        
        // Handle <LOQ values - convert to LOQ value
        if (text.startsWith('<')) {
            const numMatch = text.match(/[\d.]+/);
            return numMatch ? parseFloat(numMatch[0]) : 0;
        }
        
        // Parse numeric value
        const numValue = parseFloat(text);
        return isNaN(numValue) ? 0 : numValue;
    }

    /**
     * Parse limit value
     */
    parseLimitValue(limitText) {
        if (!limitText) return null;
        
        const numValue = parseFloat(limitText.trim());
        return isNaN(numValue) ? null : numValue;
    }

    /**
     * Get LOD value for analyte
     */
    getLODValue(analyte) {
        const unitConfig = window.getUnitConfig();
        
        // Try to get from limits data
        if (unitConfig.limits && unitConfig.limits[analyte]) {
            return unitConfig.limits[analyte].lod || 0;
        }
        
        // Default LOD
        return 0;
    }

    /**
     * Get LOQ value for analyte
     */
    getLOQValue(analyte) {
        const unitConfig = window.getUnitConfig();
        
        // Try to get from limits data
        if (unitConfig.limits && unitConfig.limits[analyte]) {
            return unitConfig.limits[analyte].loq || 0;
        }
        
        // Default LOQ
        return 0;
    }

    /**
     * Create condition fields for a specific analyte
     */
    createConditionFieldsForAnalyte(analyte, analyteData, unitConfig) {
        const fieldPrefix = this.sanitizeAnalyteName(analyte);
        
        // Create the four required fields for Confident Cannabis
        this.createConditionField(`${fieldPrefix}_cc_result`, analyteData.result);
        this.createConditionField(`${fieldPrefix}_cc_lod`, analyteData.lod);
        this.createConditionField(`${fieldPrefix}_cc_loq`, analyteData.loq);
        this.createConditionField(`${fieldPrefix}_cc_action_limit`, analyteData.limit);
        
        console.log(`Created condition fields for ${analyte}:`, {
            result: analyteData.result,
            lod: analyteData.lod,
            loq: analyteData.loq,
            limit: analyteData.limit
        });
    }

    /**
     * Sanitize analyte name for use as field name
     */
    sanitizeAnalyteName(analyte) {
        // Convert to lowercase and replace spaces/special chars with underscores
        return analyte.toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    /**
     * Create or update a QBench condition field
     */
    createConditionField(fieldName, value) {
        // Check if field already exists
        let field = document.querySelector(`[name="${fieldName}"]`);
        
        if (!field) {
            // Create new hidden field
            field = document.createElement('input');
            field.type = 'hidden';
            field.name = fieldName;
            document.body.appendChild(field);
        }
        
        // Set the value (ensure it's numeric for Confident Cannabis)
        const numericValue = this.ensureNumericValue(value);
        field.value = numericValue;
        
        console.log(`Set condition field ${fieldName} = ${numericValue}`);
    }

    /**
     * Ensure value is numeric for Confident Cannabis compatibility
     */
    ensureNumericValue(value) {
        if (value === null || value === undefined) {
            return '0';
        }
        
        if (typeof value === 'number') {
            return value.toString();
        }
        
        const numValue = parseFloat(value);
        return isNaN(numValue) ? '0' : numValue.toString();
    }

    /**
     * Clear all condition fields (useful for reprocessing)
     */
    clearConditionFields() {
        const conditionFields = document.querySelectorAll('[name$="_cc_result"], [name$="_cc_lod"], [name$="_cc_loq"], [name$="_cc_action_limit"]');
        conditionFields.forEach(field => field.remove());
        console.log('Cleared all condition fields');
    }

    /**
     * Get all current condition fields (for debugging)
     */
    getConditionFields() {
        const fields = {};
        const conditionFields = document.querySelectorAll('[name$="_cc_result"], [name$="_cc_lod"], [name$="_cc_loq"], [name$="_cc_action_limit"]');
        
        conditionFields.forEach(field => {
            fields[field.name] = field.value;
        });
        
        return fields;
    }
}
