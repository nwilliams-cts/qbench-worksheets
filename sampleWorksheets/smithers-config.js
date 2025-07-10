/**
 * Smithers QBench Worksheet Configuration
 * Maps existing Jinja-templated worksheet structure to QBench Core modular system
 */

const SmithersWorksheetConfig = {
  // Basic worksheet identification
  worksheetName: "Smithers Cannabinoids Analysis",
  version: "2.0.0",
  
  // Company branding and theming
  branding: {
    companyName: "Smithers",
    colors: {
      primary: "#003a70",        // smithers-navy
      secondary: "#236092",      // smithers-blue  
      accent: "#f6cd3e",         // smithers-yellow
      darkAccent: "#0a2240",     // smithers-navy-dark
      lightGray: "#e7eaec",      // smithers-gray-light
      mediumGray: "#cdcfd0"      // smithers-gray
    },
    logo: null  // Can be added later if needed
  },
  
  // Feature toggles - maps to KVStore settings
  features: {
    multiUnitOutput: true,              // Enable multi-unit result display
    moistureCorrection: true,           // Enable moisture correction features
    dataIntegrity: true,                // Enable data locking/protection
    rsdChecking: true,                  // Enable RSD calculation and status
    complianceMode: true,               // Enable Pass/Fail status checking
    uncertaintyMode: true,              // Enable measurement uncertainty
    confidantCannabis: false,           // Disable CC integration for now
    conditionFields: true,              // Enable conditional field display
    tabNavigation: true,                // Enable tab-based navigation
    summaryStatistics: true,            // Enable summary statistics tab
    individualTests: true,              // Enable individual test tabs
    settingsTab: true,                  // Enable settings/configuration tab
    sampleInfoTab: true                 // Enable sample information tab
  },
  
  // Field mappings - tells modular system where to find Jinja-injected data
  fieldMappings: {
    // JSON data containers (populated by Jinja)
    instrumentData: "ws-instrument-json",     // {{ instrument_data | tojson }}
    liveData: "ws-live-json",                // {{ live_data | tojson }}
    sampleInfo: "ws-sample-info",            // Sample metadata from Jinja
    unitConfig: "ws-unit-config",            // KVStore configuration
    isomersMap: "ws-isomers-map",            // {{ kvstore.get("isomers_map") | tojson }}
    
    // Form fields for persistence
    liveResultsField: "input[name='ws_live_results']",  // Hidden field for QBench integration
    
    // UI element containers
    tabContainer: "#ws-tabs",
    summaryBody: "#ws-summary-body",
    statisticsBody: "#ws-statistics-body",
    statusBanner: "#overall-status-banner",
    unitCheckboxes: "#unit-checkboxes"
  },
  
  // CSS selectors for worksheet elements (maintains existing structure)
  selectors: {
    // Input elements
    instrumentInput: ".ws-instrument",           // Instrument result inputs
    includeCheckbox: ".ws-include",              // Include/exclude checkboxes
    sigFigInput: "#sig-fig-input",               // Significant figures setting
    unitSelector: "#unit-selector",              // Display unit selector
    
    // Display elements  
    finalResult: ".ws-final",                    // Final calculated results
    lodCell: ".ws-lod",                         // LOD display cells
    loqCell: ".ws-loq",                         // LOQ display cells
    limitCell: ".ws-limit",                     // Limit display cells
    statusCell: ".ws-status",                   // Pass/Fail status cells
    rsdCell: ".ws-rsd",                         // RSD percentage cells
    
    // Navigation elements
    tabButton: ".ws-tab-btn",                   // Tab navigation buttons
    tabContent: ".ws-tab-content",              // Tab content containers
    
    // Data rows
    analyteRow: "[data-ws-analyte]",            // Analyte data rows
    testRow: "[data-ws-test]",                  // Test-specific rows
    summaryRow: "#ws-summary-body tr",          // Summary table rows
    
    // Settings and controls
    moistureCorrectionEnabled: "#moisture-correction-enabled",
    moistureReportingEnabled: "#moisture-reporting-enabled", 
    rsdCheckEnabled: "#rsd-check-enabled",
    complianceModeEnabled: "#compliance-mode-enabled",
    uncertaintyModeEnabled: "#uncertainty-mode-enabled",
    lockDataBtn: "#lock-data-btn",
    unlockDataBtn: "#unlock-data-btn",
    protectionStatus: "#protection-status"
  },
  
  // Unit conversion settings - integrates with existing wsScaling
  units: {
    // Base scaling factors (maintains existing logic)
    scaling: {
      'ppb': 1,
      'ng/mL': 1,
      'µg/mL': 1e3,
      'ppm': 1e3,
      '%': 1e7,
      'cfu/g': 1,
      'mg/g': 1e6,
      'mg/mL': 1e6
      // mg/serving and mg/package handled separately with sample metadata
    },
    
    // Special units requiring sample metadata
    specialUnits: ['mg/serving', 'mg/package'],
    
    // Default settings (overridden by KVStore)
    defaults: {
      input: 'ppb',
      display: 'ppb', 
      limit: 'ppb',
      report: 'ppb'
    }
  },
  
  // RSD checking configuration
  rsd: {
    defaultWarningLimit: 15,
    defaultFailLimit: 25,
    enabledByDefault: true,
    tooltipsEnabled: true
  },
  
  // Moisture correction settings
  moisture: {
    enabledByDefault: false,  // Only enable if explicitly set in KVStore
    formula: "corrected = raw / (1 - moisture/100)",  // As-tested to dry weight
    indicator: "🌿",          // Icon for moisture-corrected results
    requiresValue: true       // Must have valid moisture value to enable
  },
  
  // Data integrity settings
  dataIntegrity: {
    lockingEnabled: true,
    defaultState: "unlocked",
    confirmationRequired: true,
    lockedMessage: "Data is locked to prevent modifications",
    unlockedMessage: "Data can be modified"
  },
  
  // Table and display settings
  display: {
    defaultSigFigs: 3,
    minSigFigs: 1,
    maxSigFigs: 6,
    
    // Status icons
    statusIcons: {
      pass: "✓",
      fail: "✗", 
      warning: "⚠",
      unknown: "–"
    },
    
    // Result type indicators
    resultTypes: {
      notTested: "NT",
      notDetected: "ND", 
      belowLOQ: "<LOQ"
    }
  },
  
  // Tab configuration - matches existing Jinja structure
  tabs: {
    summary: {
      id: "ws-tab-summary",
      label: "Summary",
      active: true,
      enabled: true
    },
    // Individual test tabs generated dynamically from Jinja {% for t in tests %}
    statistics: {
      id: "ws-tab-statistics", 
      label: "Statistics",
      active: false,
      enabled: true
    },
    sampleInfo: {
      id: "ws-tab-sample-info",
      label: "Sample Info", 
      active: false,
      enabled: true
    },
    settings: {
      id: "ws-tab-settings",
      label: "Settings",
      active: false, 
      enabled: true
    }
  },
  
  // Custom calculation hooks for site-specific logic
  calculations: {
    // Custom pre-calculation hook
    beforeCalculation: function(testId, analyte, rawValue) {
      // Site-specific pre-processing can go here
      return rawValue;
    },
    
    // Custom post-calculation hook  
    afterCalculation: function(testId, analyte, result) {
      // Site-specific post-processing can go here
      console.log(`Smithers calculation complete: ${analyte} = ${result}`);
      return result;
    },
    
    // Custom status determination
    customStatusLogic: function(analyte, result, limit, config) {
      // Smithers-specific pass/fail logic can override here if needed
      return null; // Return null to use default logic
    }
  },
  
  // Integration settings for QBench persistence
  integration: {
    qbenchEnabled: true,
    autoSave: true,
    saveOnCalculation: true,
    
    // Form field names for QBench integration
    formFields: {
      liveResults: "ws_live_results",
      instrumentPrefix: "ws_instrument_",
      includePrefix: "ws_include_", 
      finalPrefix: "ws_final_"
    }
  },
  
  // Validation rules
  validation: {
    requireAllTests: false,           // Allow partial test completion
    requirePositiveValues: false,     // Allow negative/zero results
    maxRSDForPass: null,             // No automatic RSD-based failures
    
    // Custom validation function
    customValidation: function(data) {
      // Site-specific validation logic
      return { valid: true, errors: [] };
    }
  },
  
  // Error handling and logging
  errorHandling: {
    logLevel: "info",                // "debug", "info", "warn", "error"
    showUserErrors: true,            // Show calculation errors to users
    fallbackValues: {
      defaultResult: 0,
      defaultStatus: "unknown",
      defaultRSD: null
    }
  }
};

// Export for use in modular system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmithersWorksheetConfig;
} else if (typeof window !== 'undefined') {
  window.SmithersWorksheetConfig = SmithersWorksheetConfig;
}
