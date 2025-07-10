# QBench Worksheet Migration Guide

This guide explains how to migrate existing QBench worksheets to use the modular CDN-hosted system while preserving Jinja templating and site-specific functionality.

## Migration Strategy

The migration approach maintains **complete backward compatibility** with existing QBench workflows while introducing modular JavaScript for enhanced maintainability:

### What Stays the Same
- **Jinja templating** for server-side data injection
- **KVStore integration** for configuration management  
- **QBench field persistence** (`ws_live_results`, etc.)
- **Site-specific styling** and branding
- **Existing form structure** and field names

### What Changes
- **JavaScript logic** moves to CDN-hosted modules
- **CSS framework** becomes modular and reusable
- **Configuration** becomes declarative and standardized
- **Calculations** become unit-testable and consistent

## File Structure

```
sampleWorksheets/
├── sampleWorksheet.html              # Original worksheet (Jinja + embedded JS)
├── sampleWorksheet-modular.html      # Migrated worksheet (Jinja + CDN modules)
├── smithers-config.js                # Site-specific configuration
└── migration-notes.md                # This file
```

## Migration Process

### Step 1: Replace JavaScript Section

**Before (Embedded JavaScript):**
```html
<script>
function wsRecalculate(testId, analyte) {
  // 500+ lines of embedded calculation logic
  const raw = parseFloat(input?.value) || 0;
  let scaledRaw = wsConvert(raw, wsUnitConfig.input_unit, displayUnit) * ext * dil / wt;
  // ... complex calculation logic
}
// ... more embedded functions
</script>
```

**After (CDN Modules):**
```html
<!-- Load QBench Core CSS from CDN -->
<link rel="stylesheet" href="https://ashy-pond-044fe2b10.1.azurestaticapps.net/qbench-core.css">

<!-- Load QBench Core JavaScript from CDN -->
<script type="module" src="https://ashy-pond-044fe2b10.1.azurestaticapps.net/qbench-worksheet.js"></script>

<script>
// Simple initialization - complex logic handled by modules
document.addEventListener('DOMContentLoaded', function() {
  if (window.QBenchWorksheet) {
    initializeWorksheet();
  } else {
    window.addEventListener('qbench-worksheet-ready', initializeWorksheet);
  }
});

function initializeWorksheet() {
  const config = JSON.parse(document.getElementById('qbench-config')?.textContent || '{}');
  window.QBenchWorksheet.initialize(config);
  window.QBenchWorksheet.recalculateAll();
}
</script>
```

### Step 2: Add Configuration JSON

Insert a new configuration block that maps your site-specific settings:

```html
<script type="application/json" id="qbench-config">
{
  "worksheetName": "Smithers Cannabinoids Analysis",
  "features": {
    "multiUnitOutput": true,
    "moistureCorrection": true,
    "dataIntegrity": true,
    "rsdChecking": true,
    "complianceMode": true
  },
  "fieldMappings": {
    "instrumentData": "ws-instrument-json",
    "liveData": "ws-live-json",
    "unitConfig": "ws-unit-config"
  },
  "selectors": {
    "instrumentInput": ".ws-instrument",
    "finalResult": ".ws-final",
    "statusCell": ".ws-status"
  }
}
</script>
```

### Step 3: Update Function Calls

**Before:**
```html
<input type="number" onchange="wsRecalculate('{{ t.id }}', '{{ analyte }}')">
```

**After:**
```html
<input type="number" onchange="QBenchWorksheet.recalculate('{{ t.id }}', '{{ analyte }}')">
```

### Step 4: Preserve Site-Specific Styling

Keep your existing CSS for branding, but add overrides to integrate with the modular CSS:

```html
<style>
/* Preserve Smithers branding */
:root {
  --smithers-navy: #003a70;
  --smithers-blue: #236092;
  --smithers-yellow: #f6cd3e;
}

/* Override modular CSS with site-specific styling */
.qbench-worksheet-container button {
  background: linear-gradient(135deg, var(--smithers-blue) 0%, var(--smithers-navy) 100%) !important;
}
</style>
```

## Key Benefits

### 1. **Maintained Functionality**
- All existing Jinja templating works unchanged
- KVStore integration preserved
- QBench form persistence maintained
- Site-specific logic preserved

### 2. **Enhanced Maintainability**  
- JavaScript logic centralized and testable
- Consistent behavior across worksheets
- Easier updates and bug fixes
- Version-controlled improvements

### 3. **Improved Performance**
- Cached CDN resources
- Smaller HTML files
- Reduced redundant code
- Faster load times

### 4. **Future-Proof Architecture**
- Modular components for easy extension
- Standardized configuration approach
- Support for new features without HTML changes
- Cross-site code reuse

## Configuration Mapping

The modular system maps existing worksheet patterns to standardized configuration:

| Legacy Pattern | Modular Configuration |
|----------------|---------------------|
| `wsScaling` object | `config.units.scaling` |
| Embedded calculation functions | `QBenchWorksheet.calculations` module |
| Hard-coded selectors | `config.selectors` mapping |
| Inline feature flags | `config.features` object |
| Manual DOM manipulation | Automated UI management |

## Testing Migration

1. **Load both versions** side-by-side
2. **Compare calculations** with identical input data  
3. **Verify all features** work as expected
4. **Test edge cases** (empty values, extreme numbers)
5. **Validate QBench integration** (form submission)

## Rollback Plan

If issues arise, you can immediately rollback by:
1. Reverting to `sampleWorksheet.html` (original)
2. No QBench configuration changes needed
3. All existing functionality preserved

## Advanced Features

The modular system enables new capabilities:

### Multi-Unit Output
```javascript
// Automatically calculates results in multiple units
const selectedUnits = ['ppb', 'ppm', 'mg/serving'];
QBenchWorksheet.setOutputUnits(selectedUnits);
```

### Enhanced Data Integrity
```javascript
// Lock/unlock data with audit trail
QBenchWorksheet.lockData();
QBenchWorksheet.unlockData();
```

### Improved Error Handling
```javascript
// Detailed error reporting and recovery
QBenchWorksheet.onError((error) => {
  console.log(`Calculation error in ${error.analyte}: ${error.message}`);
});
```

## Next Steps

1. **Test the migrated worksheet** thoroughly
2. **Deploy to staging environment** for validation
3. **Train users** on any UI changes (minimal)
4. **Monitor performance** and error logs
5. **Plan additional worksheets** for migration

## Support

For migration assistance:
- Review the modular system documentation
- Check CDN availability and status
- Test configuration changes in development
- Validate all Jinja templates render correctly

The migration preserves all existing functionality while enabling future enhancements through the modular architecture.
