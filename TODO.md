# QBench Worksheet TODO List

## QOL (Quality of Life) Updates

### 1. CANCELLED Test State Handling ⏳ *COMPLETED*
- **Description**: Tests in the CANCELLED state should forcibly uncheck the include boxes so that the data cannot be used in the final summation
- **Priority**: Medium
- **Implementation Notes**: 
  - Check test status during initialization and data updates
  - Automatically uncheck and disable include checkboxes for CANCELLED tests
  - Add visual indicators (grayed out, disabled styling)
  - Prevent user from manually checking cancelled test data
- **Status**: Started - need to implement the auto-uncheck logic

### 2. LOD Column Toggle
- **Description**: For some labs and assays, LOD is meaningless and some states require no LOD reporting (meaning nothing can be "ND", only "<LOQ")
- **Priority**: Medium
- **Requirements**:
  - Toggle to show/hide LOD column across all tables
  - When LOD disabled, ensure no "ND" results (convert to "<LOQ")
  - Maintain calculation integrity when LOD column is hidden
  - Save toggle state in user settings for persistence
- **Implementation Areas**:
  - Add toggle in Settings tab
  - Update `wsRecalculate()` logic
  - Modify table header/cell generation
  - Update `wsUpdateSummary()` and `wsUpdateStatistics()`

## Major Features

### 3. Homogeneity Reporting System
- **Description**: Comprehensive homogeneity analysis for labs requiring replicate variance reporting
- **Priority**: High
- **Requirements**:
  - **Minimum Replicate Validation**: Ensure sufficient test count for homogeneity calculations
  - **Distance to Mean Calculation**: Calculate percent deviation from mean for each test/analyte
  - **Pass/Fail Criteria**: Configurable thresholds (e.g., 25% deviation limit)
  - **Dedicated Homogeneity Tab**: Separate interface for homogeneity-specific data
  - **Summary Integration**: Display homogeneity pass/fail status on main summary page
  - **Selective Reporting**: Include/exclude checkboxes for analytes subject to homogeneity limits
- **Components to Build**:
  - New tab: "Homogeneity" with dedicated table structure
  - Homogeneity calculation functions
  - Integration with existing summary calculations
  - Configuration options for thresholds and requirements
  - Visual indicators and status reporting
- **Technical Considerations**:
  - May require kvstore configuration for lab-specific homogeneity requirements
  - Need to handle edge cases (insufficient replicates, excluded analytes)
  - Integration with existing multi-unit system

### 4. Parent Test Data Inheritance
- **Description**: Clone test data from pre-final product samples to final packaged product samples
- **Priority**: High  
- **Requirements**:
  - **Parent Test Selection**: UI to select source test for data inheritance
  - **Data Cloning**: Copy instrument results, include/exclude states, and metadata
  - **Selective Inheritance**: Choose which analytes/data to inherit vs. re-test
  - **Integration Options**: Either in-worksheet AJAX or external Lambda function
  - **Audit Trail**: Track which data was inherited vs. newly generated
- **Implementation Options**:
  - **Option A**: In-worksheet AJAX to QBench API
  - **Option B**: External Lambda function with HTTP requests
  - **Option C**: Hybrid approach with validation
- **Technical Considerations**:
  - Need API endpoints for fetching available parent tests
  - Data validation and conflict resolution
  - User permissions and authorization
  - Integration with existing data integrity and deviation logging

## Implementation Priority Order
1. **CANCELLED Test State Handling** (Quick win, improves data integrity)
2. **LOD Column Toggle** (Medium complexity, high user impact)
3. **Homogeneity Reporting System** (Complex, high value for applicable labs)
4. **Parent Test Data Inheritance** (Complex, requires API/backend work)

## Notes
- All features should integrate with existing multi-unit system
- Maintain compatibility with data integrity protection
- Consider kvstore configuration for lab-specific requirements
- Document any new QBench variable formats needed for persistence
