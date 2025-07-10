/**
 * QBench Worksheet Core Library
 * Modular, configurable worksheet system for laboratory data analysis
 */

import { Calculations } from './core/calculations.js';
import { UIManager } from './core/ui-manager.js';
import { DataIntegrity } from './core/data-integrity.js';
import { MultiUnitSupport } from './core/multi-unit-support.js';
import { ConditionFields } from './core/condition-fields.js';

class QBenchWorksheet {
    constructor() {
        this.config = null;
        this.modules = {};
        this.initialized = false;
    }

    /**
     * Initialize the worksheet with site-specific configuration
     * @param {Object} config - Site-specific configuration
     */
    init(config) {
        this.config = this.validateConfig(config);
        
        // Initialize core modules
        this.modules.calculations = new Calculations(this.config);
        this.modules.uiManager = new UIManager(this.config);
        this.modules.dataIntegrity = new DataIntegrity(this.config);
        this.modules.multiUnit = new MultiUnitSupport(this.config);
        this.modules.conditionFields = new ConditionFields(this.config);

        // Set up global helpers using configuration
        this.setupGlobalHelpers();
        
        // Initialize the worksheet
        this.initializeWorksheet();
        
        this.initialized = true;
        console.log('QBench Worksheet initialized successfully');
    }

    /**
     * Validate and normalize the configuration
     */
    validateConfig(config) {
        const defaultConfig = {
            fieldMappings: {
                sampleWeight: "tests[0].sample.unit_weight",
                sampleId: "tests[0].sample.sample_id",
                instrumentResults: "ws_instrument_results",
                finalResults: "ws_final_results",
                liveResults: "ws_live_results",
                deviations: "ws_deviations"
            },
            selectors: {
                unitConfig: "#ws-unit-config",
                sampleInfo: "#ws-sample-info",
                isomersMap: "#ws-isomers-map",
                instrumentResults: '[name="ws_instrument_results"]',
                finalResults: '[name="ws_final_results"]',
                liveResults: '[name="ws_live_results"]'
            },
            features: {
                uncertaintyCalculations: true,
                multiUnitOutput: true,
                dataIntegrity: true,
                moistureCorrection: true,
                conditionFields: true
            },
            defaults: {
                sigFigs: 3,
                rsdWarningLimit: 15,
                rsdFailLimit: 25,
                complianceMode: true
            }
        };

        // Deep merge config with defaults
        return this.deepMerge(defaultConfig, config || {});
    }

    /**
     * Deep merge objects
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    /**
     * Set up global helper functions that respect the configuration
     */
    setupGlobalHelpers() {
        // Site-agnostic helper functions
        window.getElementById = (id) => document.getElementById(id);
        window.getElementsByName = (name) => document.getElementsByName(name);
        window.getElements = (selector) => document.querySelectorAll(selector);
        window.getElement = (selector) => document.querySelector(selector);

        // Configuration-aware data getters
        window.getInstrumentData = () => {
            const field = document.getElementsByName(this.config.fieldMappings.instrumentResults)[0];
            return JSON.parse(field?.value || "{}");
        };

        window.getLiveResults = () => {
            const field = document.getElementsByName(this.config.fieldMappings.liveResults)[0];
            return JSON.parse(field?.value || "{}");
        };

        window.getUnitConfig = () => {
            const element = document.querySelector(this.config.selectors.unitConfig);
            return JSON.parse(element?.textContent || "{}");
        };

        window.getSampleInfo = () => {
            const element = document.querySelector(this.config.selectors.sampleInfo);
            return JSON.parse(element?.textContent || "{}");
        };

        window.getIsomersMap = () => {
            const element = document.querySelector(this.config.selectors.isomersMap);
            return JSON.parse(element?.textContent || "{}");
        };
    }

    /**
     * Initialize the worksheet components
     */
    initializeWorksheet() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.doInitialization());
        } else {
            // Use timeout to ensure all elements are available
            setTimeout(() => this.doInitialization(), 0);
        }
    }

    /**
     * Perform the actual initialization
     */
    doInitialization() {
        console.log('Starting QBench Worksheet initialization...');

        // Initialize modules in order
        if (this.config.features.multiUnitOutput) {
            this.modules.multiUnit.initialize();
        }

        if (this.config.features.dataIntegrity) {
            this.modules.dataIntegrity.initialize();
        }

        this.modules.uiManager.initialize();
        this.modules.calculations.initialize();

        if (this.config.features.conditionFields) {
            this.modules.conditionFields.initialize();
        }

        console.log('QBench Worksheet initialization complete');
    }

    /**
     * Get a module instance
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Get the current configuration
     */
    getConfig() {
        return this.config;
    }
}

// Create global instance
window.QBenchWorksheet = new QBenchWorksheet();

export default QBenchWorksheet;
