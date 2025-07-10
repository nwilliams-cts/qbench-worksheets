/**
 * Multi-unit support module
 * Handles multiple output units and dynamic table rebuilding
 */

export class MultiUnitSupport {
    constructor(config) {
        this.config = config;
        this.selectedOutputUnits = [];
        this.currentDisplayUnit = 'ppb';
    }

    initialize() {
        console.log('Initializing multi-unit support...');
        
        const unitConfig = window.getUnitConfig();
        const allowedUnits = unitConfig.allowed_units || ['ppb'];
        
        // Initialize selected units
        this.selectedOutputUnits = [...allowedUnits];
        this.currentDisplayUnit = allowedUnits[0] || 'ppb';
        
        // Set up UI components
        this.initializeMultiUnitSelector(allowedUnits);
        this.initializeDisplayUnitSelector(allowedUnits);
        
        // Rebuild tables for multi-unit display
        this.rebuildTableHeaders();
        this.rebuildTableRows();
    }

    /**
     * Initialize the multi-unit checkbox selector
     */
    initializeMultiUnitSelector(allowedUnits) {
        const container = document.getElementById("multi-unit-checkboxes");
        if (!container) return;
        
        container.innerHTML = '';
        
        allowedUnits.forEach(unit => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `output-unit-${this.escapeUnitForId(unit)}`;
            checkbox.value = unit;
            checkbox.checked = this.selectedOutputUnits.includes(unit);
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = unit;
            
            checkbox.addEventListener('change', (e) => {
                this.handleUnitCheckboxChange(unit, e.target.checked);
            });
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(label);
            container.appendChild(checkboxItem);
        });
    }

    /**
     * Initialize the display unit selector dropdown
     */
    initializeDisplayUnitSelector(allowedUnits) {
        const selector = document.getElementById("display-unit-selector");
        if (!selector) return;
        
        selector.innerHTML = '';
        
        this.selectedOutputUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            option.selected = unit === this.currentDisplayUnit;
            selector.appendChild(option);
        });
        
        selector.addEventListener('change', (e) => {
            this.handleDisplayUnitChange(e.target.value);
        });
    }

    /**
     * Handle unit checkbox changes
     */
    handleUnitCheckboxChange(unit, isChecked) {
        if (isChecked) {
            this.addOutputUnit(unit);
        } else {
            const removed = this.removeOutputUnit(unit);
            if (!removed) {
                // Reset checkbox if removal failed
                const checkbox = document.getElementById(`output-unit-${this.escapeUnitForId(unit)}`);
                if (checkbox) checkbox.checked = true;
                alert("At least one output unit must be selected.");
                return;
            }
        }
        
        // Update display unit selector
        this.updateDisplayUnitSelector();
        
        // Rebuild tables
        this.rebuildTableForMultiUnit();
    }

    /**
     * Handle display unit changes
     */
    handleDisplayUnitChange(newDisplayUnit) {
        this.currentDisplayUnit = newDisplayUnit;
        console.log("Display unit changed to:", newDisplayUnit);
        
        // Update table headers
        this.updateHeaders(newDisplayUnit);
        
        // Trigger recalculation
        const calculations = window.QBenchWorksheet.getModule('calculations');
        if (calculations) {
            calculations.setCurrentDisplayUnit(newDisplayUnit);
        }
    }

    /**
     * Add output unit
     */
    addOutputUnit(unit) {
        if (!this.selectedOutputUnits.includes(unit)) {
            this.selectedOutputUnits.push(unit);
            console.log("Added output unit:", unit);
        }
    }

    /**
     * Remove output unit
     */
    removeOutputUnit(unit) {
        if (this.selectedOutputUnits.length <= 1) {
            console.warn("Cannot remove last remaining output unit");
            return false;
        }
        
        const index = this.selectedOutputUnits.indexOf(unit);
        if (index > -1) {
            this.selectedOutputUnits.splice(index, 1);
            console.log("Removed output unit:", unit);
            return true;
        }
        return false;
    }

    /**
     * Update display unit selector options
     */
    updateDisplayUnitSelector() {
        const selector = document.getElementById("display-unit-selector");
        if (!selector) return;
        
        selector.innerHTML = '';
        
        this.selectedOutputUnits.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            option.selected = unit === this.currentDisplayUnit;
            selector.appendChild(option);
        });
        
        // If current display unit is no longer selected, switch to first available
        if (!this.selectedOutputUnits.includes(this.currentDisplayUnit)) {
            this.currentDisplayUnit = this.selectedOutputUnits[0];
            selector.value = this.currentDisplayUnit;
            this.updateHeaders(this.currentDisplayUnit);
        }
    }

    /**
     * Rebuild table headers for multi-unit display
     */
    rebuildTableHeaders() {
        const tableHeaders = document.querySelectorAll('thead tr');
        
        tableHeaders.forEach(headerRow => {
            const summaryTable = headerRow.closest('#ws-tab-summary');
            const testTable = headerRow.closest('[id^="ws-tab-"]:not(#ws-tab-summary):not(#ws-tab-statistics):not(#ws-tab-settings):not(#ws-tab-sample-info)');
            
            if (summaryTable) {
                this.rebuildSummaryTableHeaders(headerRow);
            } else if (testTable) {
                this.rebuildTestTableHeaders(headerRow);
            }
        });
    }

    /**
     * Rebuild summary table headers
     */
    rebuildSummaryTableHeaders(headerRow) {
        // Remove existing result headers
        const existingResultHeaders = headerRow.querySelectorAll('[name^="final-header"]');
        existingResultHeaders.forEach(header => header.remove());
        
        // Find insertion point
        const limitHeader = headerRow.querySelector('[name="limit-header"]');
        
        // Create new headers for each unit
        this.selectedOutputUnits.forEach(unit => {
            const newHeader = document.createElement('th');
            newHeader.setAttribute('name', `final-header-${unit}`);
            newHeader.setAttribute('class', 'summary-sortable');
            newHeader.textContent = `Result (${unit})`;
            
            if (limitHeader) {
                headerRow.insertBefore(newHeader, limitHeader);
            } else {
                headerRow.appendChild(newHeader);
            }
        });
    }

    /**
     * Rebuild test table headers
     */
    rebuildTestTableHeaders(headerRow) {
        // Remove existing final headers
        const existingFinalHeaders = headerRow.querySelectorAll('[name^="final-header"]');
        existingFinalHeaders.forEach(header => header.remove());
        
        // Find insertion point
        const limitHeader = headerRow.querySelector('[name="limit-header"]');
        
        // Create new headers for each unit
        this.selectedOutputUnits.forEach((unit, index) => {
            const newHeader = document.createElement('th');
            newHeader.setAttribute('name', `final-header-${unit}`);
            newHeader.setAttribute('class', 'test-sortable');
            newHeader.setAttribute('data-column', `4-${index}`);
            newHeader.textContent = `Final Result (${unit})`;
            
            if (limitHeader) {
                headerRow.insertBefore(newHeader, limitHeader);
            } else {
                headerRow.appendChild(newHeader);
            }
        });
    }

    /**
     * Rebuild table rows for multi-unit display
     */
    rebuildTableRows() {
        // Summary table rows
        const summaryRows = document.querySelectorAll('#ws-summary-body tr[data-ws-analyte]');
        summaryRows.forEach(row => this.rebuildSummaryTableRow(row));
        
        // Test table rows
        const testRows = document.querySelectorAll('tr[data-ws-analyte][data-ws-test]');
        testRows.forEach(row => this.rebuildTestTableRow(row));
    }

    /**
     * Rebuild summary table row
     */
    rebuildSummaryTableRow(row) {
        // Remove existing result cells
        const existingResultCells = row.querySelectorAll('[name^="ws_mean_"]');
        existingResultCells.forEach(cell => cell.remove());
        
        // Find insertion point
        const limitCell = row.querySelector('.ws-summary-limit');
        const analyte = row.getAttribute('data-ws-analyte');
        
        // Create new cells for each unit
        this.selectedOutputUnits.forEach(unit => {
            const newCell = document.createElement('td');
            newCell.setAttribute('class', 'ws-summary-mean');
            newCell.setAttribute('name', `ws_mean_${analyte}_${unit}`);
            newCell.setAttribute('data-unit', unit);
            newCell.textContent = 'NT';
            
            if (limitCell) {
                row.insertBefore(newCell, limitCell);
            } else {
                row.appendChild(newCell);
            }
        });
    }

    /**
     * Rebuild test table row
     */
    rebuildTestTableRow(row) {
        // Remove existing final cells
        const existingFinalCells = row.querySelectorAll('[name^="ws_final_"]');
        existingFinalCells.forEach(cell => cell.remove());
        
        // Find insertion point
        const limitCell = row.querySelector('.ws-limit');
        const analyte = row.getAttribute('data-ws-analyte');
        const testId = row.getAttribute('data-ws-test');
        
        // Create new cells for each unit
        this.selectedOutputUnits.forEach(unit => {
            const newCell = document.createElement('td');
            newCell.setAttribute('class', 'ws-final');
            newCell.setAttribute('name', `ws_final_${analyte}_${testId}_${unit}`);
            newCell.setAttribute('data-unit', unit);
            newCell.textContent = 'NT';
            
            if (limitCell) {
                row.insertBefore(newCell, limitCell);
            } else {
                row.appendChild(newCell);
            }
        });
    }

    /**
     * Main function to rebuild tables
     */
    rebuildTableForMultiUnit() {
        console.log("Rebuilding tables for multi-unit output");
        
        this.rebuildTableHeaders();
        this.rebuildTableRows();
        
        // Trigger recalculation
        const calculations = window.QBenchWorksheet.getModule('calculations');
        if (calculations) {
            calculations.setSelectedOutputUnits(this.selectedOutputUnits);
        }
    }

    /**
     * Update table headers with current display unit
     */
    updateHeaders(displayUnit) {
        // Update any headers that show the current display unit
        console.log("Updating headers for display unit:", displayUnit);
    }

    /**
     * Escape unit names for use in element IDs
     */
    escapeUnitForId(unit) {
        return unit.replace(/[^a-zA-Z0-9\-_]/g, function(char) {
            const charMap = {
                '/': '_per_',
                '%': '_percent_',
                ' ': '_',
                '.': '_dot_'
            };
            return charMap[char] || 'x' + char.charCodeAt(0).toString(16);
        });
    }

    // Getters for other modules
    getSelectedOutputUnits() {
        return this.selectedOutputUnits;
    }

    getCurrentDisplayUnit() {
        return this.currentDisplayUnit;
    }
}
