# QBench Worksheet Core Library

A modular, configurable worksheet system for QBench LIMS that enables rapid deployment across multiple instances with minimal site-specific configuration.

## Features

- **Modular Architecture**: Core functionality separated into reusable modules
- **Configuration-Driven**: Site-specific field mappings and feature toggles
- **Multi-Unit Support**: Dynamic output in multiple units (mg/g, %, ppm, mg/serving, etc.)
- **Data Integrity**: Protection against unauthorized changes with deviation tracking
- **Condition Fields**: Confident Cannabis integration for regulatory compliance
- **Real-time Calculations**: Automatic calculations with configurable precision
- **Audit Trail**: Complete tracking of all changes and deviations
- **Responsive UI**: Modern interface that works across devices

## Quick Start

### 1. Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.qbench.com/qbench-core/1.0.0/qbench-core.css">
</head>
<body>
    <div id="qbench-worksheet">
        <!-- Your worksheet HTML -->
    </div>

    <script type="module">
        import QBenchWorksheet from 'https://cdn.qbench.com/qbench-core/1.0.0/qbench-worksheet.esm.min.js';

        // Site-specific configuration
        const config = {
            fields: {
                sampleWeight: 'input[name="sample_weight"]',
                sampleId: 'input[name="sample_id"]',
                instrumentResults: 'textarea[name="ws_instrument_results"]',
                finalResults: 'textarea[name="ws_final_results"]'
            },
            features: {
                multiUnit: true,
                dataIntegrity: true,
                conditionFields: true
            }
        };

        // Initialize worksheet
        const worksheet = new QBenchWorksheet(config);
    </script>
</body>
</html>
```

### 2. Local Development

```bash
# Clone or download the library
git clone https://github.com/qbench/qbench-worksheets.git
cd qbench-worksheets/qbench-core

# Install dependencies
npm install

# Build the library
npm run build

# Start development server
npm run serve
```

## Configuration

### Field Mappings

Map your QBench field names to the core library functions:

```javascript
const config = {
    fields: {
        // Required mappings
        sampleWeight: 'input[name="sample_weight"]',           // Sample weight field
        sampleId: 'input[name="sample_id"]',                   // Sample ID field
        instrumentResults: 'textarea[name="ws_instrument_results"]', // Instrument data
        finalResults: 'textarea[name="ws_final_results"]',     // Final results storage
        
        // Optional mappings
        liveResults: 'textarea[name="ws_live_results"]',       // Live calculation results
        deviations: 'textarea[name="ws_deviations"]',          // Deviation tracking
        
        // UI selectors
        unitConfig: '#ws-unit-config',                         // Unit configuration data
        sampleInfo: '#ws-sample-info',                         // Sample information
        isomersMap: '#ws-isomers-map',                         // Isomer relationships
        
        // Input selectors
        calculationInputs: '.ws-instrument',                   // Input fields for calculations
        includeCheckboxes: '.ws-include'                       // Include/exclude checkboxes
    }
};
```

### Feature Configuration

Enable or disable specific features:

```javascript
const config = {
    features: {
        multiUnit: true,            // Multi-unit output support
        dataIntegrity: true,        // Data integrity protection
        conditionFields: true,      // Confident Cannabis condition fields
        autoCalculate: true,        // Automatic recalculation
        auditTrail: true           // Change tracking
    }
};
```

### Calculation Settings

Configure calculation behavior:

```javascript
const config = {
    calculations: {
        precision: 3,               // Significant figures
        roundingMode: 'round',      // 'round', 'ceil', 'floor'
        units: ['mg/g', '%', 'ppm', 'mg/serving', 'mg/package'],
        defaultUnit: 'mg/g'
    }
};
```

## Modules

### Core Modules

#### Calculations
Handles all mathematical operations, unit conversions, and result formatting.

```javascript
const calculations = worksheet.getModule('calculations');
await calculations.calculate();
```

#### UI Manager
Manages tabs, modals, tooltips, and user interface interactions.

```javascript
const ui = worksheet.getModule('uiManager');
ui.showModal('deviation-modal');
```

#### Data Integrity
Protects against unauthorized changes and tracks deviations.

```javascript
const integrity = worksheet.getModule('dataIntegrity');
integrity.lockData();
```

#### Multi-Unit Support
Enables output in multiple units simultaneously.

```javascript
const multiUnit = worksheet.getModule('multiUnit');
multiUnit.setSelectedUnits(['mg/g', '%', 'mg/serving']);
```

#### Condition Fields
Creates QBench condition fields for regulatory compliance.

```javascript
const conditions = worksheet.getModule('conditionFields');
conditions.updateConditionFields(results);
```

## API Reference

### QBenchWorksheet Class

#### Constructor
```javascript
const worksheet = new QBenchWorksheet(config);
```

#### Methods

##### `getFieldValue(fieldKey)`
Get value from a configured field.

```javascript
const sampleWeight = worksheet.getFieldValue('sampleWeight');
```

##### `setFieldValue(fieldKey, value)`
Set value on a configured field.

```javascript
worksheet.setFieldValue('sampleWeight', '1.0234');
```

##### `calculate()`
Trigger calculations and update results.

```javascript
const results = await worksheet.calculate();
```

##### `getSampleData()`
Get current sample data.

```javascript
const data = worksheet.getSampleData();
```

##### `getModule(name)`
Get reference to a specific module.

```javascript
const calculations = worksheet.getModule('calculations');
```

### Global Helpers

The library provides global helper functions for backward compatibility:

```javascript
// Quick field access
const value = QBenchHelpers.getField('sampleWeight');
QBenchHelpers.setField('sampleWeight', '1.0234');

// Number formatting
const formatted = QBenchHelpers.formatNumber(1.23456, 3); // "1.235"

// Unit conversion
const converted = QBenchHelpers.convertUnit(10, 'mg/g', '%'); // 1.0
```

## Events

The library dispatches custom events for integration:

```javascript
// Listen for calculation completion
document.addEventListener('qbench:calculated', (event) => {
    console.log('Results:', event.detail.results);
});

// Listen for errors
document.addEventListener('qbench:error', (event) => {
    console.error('Error:', event.detail.error);
});

// Listen for data changes
document.addEventListener('qbench:dataChange', (event) => {
    console.log('Data changed:', event.detail);
});

// Listen for unit changes
document.addEventListener('qbench:unitChange', (event) => {
    console.log('Unit changed to:', event.detail.unit);
});
```

## Examples

### Cannabinoids Worksheet

A complete example for cannabis potency testing:

```javascript
// See examples/cannabinoids-config.js and examples/cannabinoids-worksheet.html
```

### Custom Assay Configuration

```javascript
const customConfig = {
    fields: {
        sampleWeight: 'input[name="my_sample_weight"]',
        sampleId: 'input[name="my_sample_id"]',
        instrumentResults: 'textarea[name="my_instrument_data"]',
        finalResults: 'textarea[name="my_final_results"]'
    },
    features: {
        multiUnit: true,
        dataIntegrity: false,  // Disable for simpler workflows
        conditionFields: false
    },
    calculations: {
        precision: 2,
        defaultUnit: 'ppm'
    }
};

const worksheet = new QBenchWorksheet(customConfig);
```

## Deployment Options

### CDN (Recommended)

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.qbench.com/qbench-core/1.0.0/qbench-core.css">

<!-- JavaScript (ES Modules) -->
<script type="module">
    import QBenchWorksheet from 'https://cdn.qbench.com/qbench-core/1.0.0/qbench-worksheet.esm.min.js';
    // Your code here
</script>

<!-- JavaScript (UMD for older browsers) -->
<script src="https://cdn.qbench.com/qbench-core/1.0.0/qbench-worksheet.umd.min.js"></script>
<script>
    const worksheet = new QBenchWorksheet(config);
</script>
```

### Self-Hosted

1. Build the library: `npm run build`
2. Upload the `dist/` folder to your server
3. Update URLs to point to your server

### Development

```html
<link rel="stylesheet" href="src/styles/qbench-core.css">
<script type="module">
    import QBenchWorksheet from './src/qbench-worksheet.js';
    // Your code here
</script>
```

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

For older browsers, use the UMD bundle with polyfills.

## Migration from Legacy Worksheets

### Step 1: Extract Configuration

Identify your current field names and create a configuration object.

### Step 2: Update HTML

Replace legacy JavaScript with the modular system.

### Step 3: Test

Verify all functionality works with the new system.

### Step 4: Deploy

Update your QBench worksheets to use the modular system.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.qbench.com/worksheets
- Issues: https://github.com/qbench/qbench-worksheets/issues
- Email: support@qbench.com
