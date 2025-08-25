# Water Activity Calibration Worksheet - KV Store Setup

## Overview
The Water Activity Calibration Verification worksheet uses QBench's KV store functionality to provide default values for commonly used calibration parameters. This reduces data entry time and ensures consistency.

## KV Store Key
The worksheet looks for a KV store entry with the key: `water_activity_calibration_defaults`

## Expected JSON Structure
```json
{
  "water_activity_calibration_defaults": {
    "standard_name": "Rotronic Salt Solutions",
    "standard_vendor": "Rotronic Instrument Corp.",
    "lot_number": "LOT-2024-001", 
    "lot_expiration_date": "2025-12-31",
    "calibrator_aw_value": 0.750,
    "calibrator_weight": 2.500,
    "tolerance_percentage": 10.0,
    "description": "Default values for water activity meter calibration verification",
    "last_updated": "2024-08-22"
  }
}
```

## Field Mapping
The following worksheet fields will be pre-populated from the KV store:

| Worksheet Field | KV Store Key | Description |
|---|---|---|
| Calibration Standard Name | `standard_name` | Name of the calibration standard |
| Calibration Standard Vendor | `standard_vendor` | Vendor/manufacturer of the standard |
| Lot Number | `lot_number` | Current lot number of the calibration standard |
| Lot Expiration Date | `lot_expiration_date` | Expiration date (YYYY-MM-DD format) |
| Calibrator aw Value | `calibrator_aw_value` | Expected water activity value (decimal) |
| Calibrator Weight | `calibrator_weight` | Standard weight in grams (decimal) |
| Acceptable Range | `tolerance_percentage` | Tolerance percentage for pass/fail calculation (e.g., 10.0 for ±10%) |

## Priority Order
The worksheet uses the following priority order for field values:
1. **Saved worksheet data** (if user has previously entered values)
2. **KV store defaults** (from the defaults key)
3. **Empty/calculated values** (if no defaults available)

## Dynamic Range Calculation
The worksheet automatically calculates the acceptable range based on:
- **Calibrator aw Value**: The expected water activity value
- **Tolerance Percentage**: Configurable percentage from KV store (e.g., 10.0 for ±10%)

**Example Calculation:**
- Calibrator aw Value: 0.750
- Tolerance Percentage: 10.0%
- Calculated Range: ±0.075 (10% of 0.750)
- Display: "±0.075 (10%)"
- Pass/Fail: Results within 0.675-0.825 pass, outside this range fail

This approach allows labs to easily adjust tolerance requirements by simply updating the KV store percentage value, without needing to recalculate exact ranges for different calibrator values.

## Setting Up the KV Store
1. In QBench, navigate to the KV store management interface
2. Create a new entry with key: `water_activity_calibration_defaults`
3. Use the JSON structure shown above, updating values as needed for your lab
4. Save the KV store entry

## Benefits
- **Consistency**: Ensures all technicians use the same calibration standards
- **Efficiency**: Reduces repetitive data entry
- **Accuracy**: Minimizes typing errors for commonly used values
- **Maintenance**: Easy to update standards/lots without modifying worksheet code
- **Flexible Tolerance**: Tolerance percentage is configurable and calculates exact ranges automatically
- **Dynamic Calculation**: Acceptable range is calculated in real-time based on the calibrator aw value and tolerance percentage

## Updating Defaults
When calibration standards change (new lots, different vendors, etc.):
1. Update the KV store entry with new values
2. New worksheet instances will automatically use the updated defaults
3. Existing worksheets retain their entered values unless manually updated

## Sample Use Case
A lab uses Rotronic salt solutions for water activity calibration. Instead of technicians having to:
- Remember and type "Rotronic Salt Solutions" each time
- Look up the current lot number 
- Enter the same calibrator weight repeatedly

The KV store pre-populates these values, and technicians only need to enter:
- The actual calibration results
- Notes and signatures
- Any deviations from standard values
