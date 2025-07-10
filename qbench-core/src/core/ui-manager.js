/**
 * UI Manager module
 * Handles all user interface interactions and updates
 */

export class UIManager {
    constructor(config) {
        this.config = config;
    }

    initialize() {
        console.log('Initializing UI manager...');
        
        // Set up tab switching
        this.initializeTabSwitching();
        
        // Set up modal handlers
        this.initializeModals();
        
        // Set up table sorting
        this.initializeSorting();
        
        // Set up other UI components
        this.initializeUIComponents();
    }

    /**
     * Initialize tab switching functionality
     */
    initializeTabSwitching() {
        const tabButtons = document.querySelectorAll('.ws-tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.getAttribute('data-ws-tab');
                this.switchTab(targetTab);
            });
        });
    }

    /**
     * Switch to a specific tab
     */
    switchTab(tabId) {
        // Hide all tabs
        const allTabs = document.querySelectorAll('[id^="ws-tab-"]');
        allTabs.forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all buttons
        const allButtons = document.querySelectorAll('.ws-tab-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show target tab
        const targetTab = document.getElementById(`ws-tab-${tabId}`);
        if (targetTab) {
            targetTab.style.display = 'block';
        }
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-ws-tab="${tabId}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    /**
     * Initialize modal functionality
     */
    initializeModals() {
        // Set up close buttons for all modals
        const closeButtons = document.querySelectorAll('.modal-close, [class$="-close"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Set up click-outside-to-close for modals
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    /**
     * Initialize table sorting functionality
     */
    initializeSorting() {
        this.sortStates = {};
        
        // Initialize sorting for summary table
        this.initializeSummaryTableSorting();
        
        // Initialize sorting for statistics table
        this.initializeStatisticsTableSorting();
    }

    /**
     * Initialize summary table sorting
     */
    initializeSummaryTableSorting() {
        const summaryHeaders = document.querySelectorAll('#ws-tab-summary .summary-sortable');
        
        summaryHeaders.forEach((header, index) => {
            header.addEventListener('click', () => {
                const tableBody = document.querySelector('#ws-summary-body');
                this.sortTable(tableBody, index, 'summary', summaryHeaders);
            });
        });
    }

    /**
     * Initialize statistics table sorting
     */
    initializeStatisticsTableSorting() {
        const statsHeaders = document.querySelectorAll('#ws-tab-statistics .stats-sortable');
        
        statsHeaders.forEach((header, index) => {
            header.addEventListener('click', () => {
                const tableBody = document.querySelector('#ws-statistics-body');
                this.sortTable(tableBody, index, 'statistics', statsHeaders);
            });
        });
    }

    /**
     * Sort table by column
     */
    sortTable(tableBody, columnIndex, tableId, headers) {
        if (!this.sortStates[tableId]) this.sortStates[tableId] = {};
        if (!this.sortStates[tableId][columnIndex]) this.sortStates[tableId][columnIndex] = 'none';
        
        // Toggle sort direction
        let newDirection;
        if (this.sortStates[tableId][columnIndex] === 'none' || this.sortStates[tableId][columnIndex] === 'desc') {
            newDirection = 'asc';
        } else {
            newDirection = 'desc';
        }
        
        this.sortStates[tableId][columnIndex] = newDirection;
        
        // Clear other column indicators
        headers.forEach((h, i) => {
            if (i !== columnIndex) {
                h.classList.remove('sort-asc', 'sort-desc');
                if (this.sortStates[tableId][i]) this.sortStates[tableId][i] = 'none';
            }
        });
        
        // Update visual indicators
        const header = headers[columnIndex];
        header.classList.remove('sort-asc', 'sort-desc');
        header.classList.add(newDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        
        // Perform the sort
        this.performTableSort(tableBody, columnIndex, newDirection === 'asc');
    }

    /**
     * Perform the actual table sorting
     */
    performTableSort(tableBody, columnIndex, ascending) {
        const rows = Array.from(tableBody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const cellA = a.cells[columnIndex];
            const cellB = b.cells[columnIndex];
            
            if (!cellA || !cellB) return 0;
            
            const valueA = this.getSortValue(cellA);
            const valueB = this.getSortValue(cellB);
            
            let comparison = 0;
            
            if (typeof valueA.sortOrder === 'string' && typeof valueB.sortOrder === 'string') {
                comparison = valueA.sortOrder.localeCompare(valueB.sortOrder);
            } else {
                comparison = valueA.sortOrder - valueB.sortOrder;
            }
            
            return ascending ? comparison : -comparison;
        });
        
        // Re-append sorted rows
        rows.forEach(row => tableBody.appendChild(row));
    }

    /**
     * Get sort value from table cell
     */
    getSortValue(cell) {
        const text = cell.textContent.trim();
        
        // Handle empty/no data cases
        if (text === '' || text === '-' || text === 'NT') {
            return { type: 'empty', value: text, sortOrder: 9999 };
        }
        
        // Handle special analytical values
        if (text === 'ND') {
            return { type: 'special', value: text, sortOrder: -9999 };
        }
        
        if (text.startsWith('<') || text.includes('LOQ')) {
            const numMatch = text.match(/[\d.]+/);
            const numValue = numMatch ? parseFloat(numMatch[0]) : 0;
            return { type: 'special', value: text, sortOrder: numValue - 0.001 };
        }
        
        // Handle percentage values
        if (text.endsWith('%')) {
            const numValue = parseFloat(text.replace('%', ''));
            return { type: 'numeric', value: isNaN(numValue) ? 0 : numValue, sortOrder: numValue };
        }
        
        // Handle numeric values
        const numValue = parseFloat(text);
        if (!isNaN(numValue)) {
            return { type: 'numeric', value: numValue, sortOrder: numValue };
        }
        
        // Handle status values (Pass/Fail)
        const cleanText = text.replace(/[✓✗⚠–]/g, '').trim();
        if (cleanText === 'Pass') {
            return { type: 'status', value: cleanText, sortOrder: 1 };
        }
        if (cleanText === 'Fail') {
            return { type: 'status', value: cleanText, sortOrder: 2 };
        }
        
        // Handle text values
        return { type: 'text', value: text, sortOrder: text.toLowerCase() };
    }

    /**
     * Initialize other UI components
     */
    initializeUIComponents() {
        // Set up tooltips
        this.initializeTooltips();
        
        // Set up form validations
        this.initializeFormValidations();
        
        // Set up dynamic content updates
        this.initializeDynamicUpdates();
    }

    /**
     * Initialize tooltips (like RSD diagnostics)
     */
    initializeTooltips() {
        // Add tooltip functionality for RSD cells
        const rsdCells = document.querySelectorAll('.ws-rsd');
        
        rsdCells.forEach(cell => {
            cell.addEventListener('mouseenter', (e) => {
                this.showRSDTooltip(e);
            });
            
            cell.addEventListener('mouseleave', (e) => {
                this.hideRSDTooltip(e);
            });
        });
    }

    /**
     * Show RSD diagnostic tooltip
     */
    showRSDTooltip(e) {
        // Implementation for RSD tooltip
        console.log('Showing RSD tooltip');
    }

    /**
     * Hide RSD diagnostic tooltip
     */
    hideRSDTooltip(e) {
        // Implementation for hiding RSD tooltip
        console.log('Hiding RSD tooltip');
    }

    /**
     * Initialize form validations
     */
    initializeFormValidations() {
        // Add validation for numeric inputs
        const numericInputs = document.querySelectorAll('input[type="number"]');
        
        numericInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateNumericInput(e.target);
            });
        });
    }

    /**
     * Validate numeric input
     */
    validateNumericInput(input) {
        const value = parseFloat(input.value);
        
        if (isNaN(value) || value < 0) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }

    /**
     * Initialize dynamic content updates
     */
    initializeDynamicUpdates() {
        // Set up observers for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Re-initialize components for newly added elements
                    this.reinitializeForNewElements(mutation.addedNodes);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Re-initialize components for newly added elements
     */
    reinitializeForNewElements(addedNodes) {
        addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Re-initialize tooltips for new elements
                const newRsdCells = node.querySelectorAll ? node.querySelectorAll('.ws-rsd') : [];
                newRsdCells.forEach(cell => {
                    // Add tooltip handlers
                });
            }
        });
    }

    /**
     * Update UI elements based on state changes
     */
    updateUI(state) {
        // Update various UI components based on application state
        console.log('Updating UI with new state:', state);
    }

    /**
     * Show loading indicator
     */
    showLoading(message = 'Loading...') {
        // Implementation for loading indicator
        console.log('Showing loading:', message);
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        // Implementation for hiding loading indicator
        console.log('Hiding loading');
    }

    /**
     * Show notification/alert
     */
    showNotification(message, type = 'info') {
        // Implementation for notifications
        console.log(`Notification (${type}):`, message);
    }
}
