# QBench LIMS Worksheet Project

## Overview

This project contains custom worksheet implementations for QBench LIMS (Laboratory Information Management System) used at Smithers. The worksheets are built using HTML/CSS/JavaScript with Jinja2 templating to provide advanced data processing, quality control, and reporting capabilities for analytical testing workflows.

## Project Structure

```
QBenchWorksheets/
├── sampleWorksheets/
│   ├── sampleWorksheet.html          # Main worksheet implementation
│   ├── exampleKVStores/
│   │   └── metals_il.json           # Example configuration data
│   └── sampleImages/
│       └── image.png                # Sample images for documentation
└── .github/
    └── COPILOT_TODO.md              # Task tracking
```

## QBench LIMS Context

### System Architecture
- **QBench LIMS**: Cloud-based laboratory information management system
- **Worksheets**: Custom HTML/JS/CSS forms that integrate with QBench's data model
- **Multi-instance Support**: Multiple worksheet instances can run simultaneously in the same browser session
- **Data Integration**: Worksheets read/write data to QBench's database through form fields and JSON structures

### Jinja2 Templating
- QBench processes worksheets through Jinja2 templating engine before rendering
- Templates have access to:
  - `tests`: Array of test objects with sample data
  - `kvstore`: Key-value configuration storage (assay-specific settings)
  - `worksheet`: Previous worksheet data for data persistence
  - `assay`: Assay configuration and metadata

### Data Flow
1. **Input**: QBench populates Jinja variables with test data, configurations, and previous results
2. **Processing**: JavaScript processes instrument data, applies calculations, and performs QC checks
3. **Output**: Results are saved back to QBench through hidden form fields (`ws_live_results`, `ws_final_results`, etc.)

## Key Features Implemented

### 1. Instance-Specific Scoping
- **Problem**: Multiple worksheet instances in same browser session would interfere with each other
- **Solution**: Implemented `.qbench-worksheet-container` scoping with helper functions:
  - `getElement(selector)` - Scoped element selection
  - `getElements(selector)` - Scoped element collection
  - `getElementById(id)` - Scoped element by ID
  - `getElementsByName(name)` - Scoped elements by name
- **Benefits**: Prevents cross-contamination between worksheet instances and LIMS UI interference

### 2. Moisture Correction for Plant Material Assays
- **Purpose**: Convert analytical results from "as-tested" to "dry weight" basis
- **Implementation**:
  - Jinja logic extracts moisture content from related moisture assays using namespace scoping
  - KVStore fields: `use_moisture_correction`, `moisture_assay_id`, `assay_name`
  - UI controls in settings tab for toggling correction on calculations vs. reporting
  - Formula: `Corrected Result = Raw Result ÷ (1 - Moisture% ÷ 100)`
  - Visual indicators (🌿) show when moisture correction is applied
- **Configuration**: Controlled via KVStore settings per assay type

### 3. QC Warning System
- **LOQ vs Action Limit Check**: Warns when Limit of Quantification exceeds regulatory action limits
- **Visual Indicators**: Orange highlighting on affected LOQ cells with explanatory tooltips
- **Status Impact**: Sets analyte status to "Warning" when QC issues detected
- **Reporting**: QC warnings included in final results metadata and overall status banner

### 4. Data Integrity Protection
- **Purpose**: Prevent unauthorized modification of instrument data
- **Features**:
  - Locks instrument input fields and analyte inclusion checkboxes by default
  - Requires deviation logging with supervisor approval to unlock
  - Tracks all data modifications with timestamps and justifications
  - Persistent storage of deviation records in worksheet data
- **Compliance**: Supports FDA 21 CFR Part 11 and similar data integrity requirements

### 5. Enhanced Result Processing
- **Unit Conversion**: Automatic conversion between different analytical units (ppb, ppm, mg/g, etc.)
- **Statistical Analysis**: RSD calculations with configurable warning/fail thresholds
- **Synthetic Analytes**: Support for calculated analytes (e.g., Total THC = THC + (THCa × 0.877))
- **Flexible Reporting**: Configurable significant figures and report unit overrides

## Technical Implementation Details

### CSS Scoping Strategy
- All styles prefixed with `.qbench-worksheet-container` to prevent conflicts
- Responsive design for various screen sizes
- Color-coded status indicators and result types
- Professional styling consistent with laboratory workflows

### JavaScript Architecture
- Modular functions for different calculation types
- Event-driven updates for real-time recalculation
- Robust error handling and null checks
- Console logging for debugging and audit trails

### Data Persistence
- **Live Results**: `ws_live_results` - Current instrument data and user modifications
- **Final Results**: `ws_final_results` - Processed results with metadata for reporting
- **Deviations**: `ws_deviations` - Data integrity audit trail
- **Instrument Results**: `ws_instrument_results` - Original instrument data backup

### Quality Control Features
- RSD (Relative Standard Deviation) monitoring with visual indicators
- Limit proximity warnings (approaching regulatory thresholds)
- Method adequacy checks (LOQ vs limits)
- Overall compliance status determination

## Configuration Management

### KVStore Fields
- `worksheet_analytes`: List of analytes to display
- `allowed_units`: Available units for display/calculation
- `use_moisture_correction`: Enable moisture correction features
- `moisture_assay_id`: Link to moisture determination assay
- `rsd_warning_limit`: RSD threshold for warnings (default: 15%)
- `rsd_fail_limit`: RSD threshold for failures (default: 25%)

### Assay Integration
- Reads QC units from assay configuration
- Supports multiple assay types (cannabinoids, terpenes, metals, etc.)
- Configurable per assay type via KVStore settings

## Browser Compatibility
- Modern browsers with ES6+ support
- jQuery dependency for DOM manipulation
- Responsive design for desktop and tablet use

## Security Considerations
- Input validation and sanitization
- XSS prevention through proper escaping
- Data integrity controls with audit logging
- Access control integration with QBench user permissions

## Future Enhancements
- Serving/package calculations for edibles (mg per serving/package)
- Uncertainty calculations for USDA hemp compliance
- Enhanced deviation review interface
- Advanced statistical process control features

## Development Notes
- All code must be compatible with QBench's Jinja2 processing
- Maintain backward compatibility with existing worksheet data
- Extensive testing required due to complex multi-instance scenarios
- Performance optimization important for large datasets (100+ tests)

## Known Limitations
- HTML structure must remain within single worksheet container for proper scoping
- Jinja namespace required for complex variable scoping (moisture lookups)
- Limited to QBench's supported HTML/JS subset
- Must work within QBench's iframe security constraints
