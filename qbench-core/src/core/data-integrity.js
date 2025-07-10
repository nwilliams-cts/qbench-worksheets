/**
 * Data Integrity module
 * Handles data protection, deviation logging, and audit trails
 */

export class DataIntegrity {
    constructor(config) {
        this.config = config;
        this.state = {
            isLocked: true,
            deviations: [],
            currentDeviation: null
        };
    }

    initialize() {
        if (!this.config.features.dataIntegrity) {
            console.log('Data integrity features disabled');
            return;
        }
        
        console.log('Initializing data integrity protection...');
        
        // Load existing deviations
        this.loadExistingDeviations();
        
        // Apply protection by default
        this.applyDataProtection(true);
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Set up deviation modals
        this.setupDeviationModals();
        
        console.log('Data integrity protection initialized');
    }

    /**
     * Set up event handlers for data integrity controls
     */
    setupEventHandlers() {
        // Protection toggle
        const protectionCheckbox = document.getElementById('data-protection-enabled');
        if (protectionCheckbox) {
            protectionCheckbox.addEventListener('change', (e) => {
                this.applyDataProtection(e.target.checked);
                this.state.isLocked = e.target.checked;
                this.updateProtectionUI();
            });
        }

        // Unlock button
        const unlockBtn = document.getElementById('unlock-data-btn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                if (this.state.isLocked) {
                    this.showDeviationModal();
                }
            });
        }

        // Lock button
        const lockBtn = document.getElementById('lock-data-btn');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => {
                this.lockData();
            });
        }

        // Review deviations button
        const reviewBtn = document.getElementById('review-deviations-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                this.showDeviationReview();
            });
        }

        // Export deviations button
        const exportBtn = document.getElementById('export-deviations-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDeviations();
            });
        }
    }

    /**
     * Load existing deviations from storage
     */
    loadExistingDeviations() {
        const deviationField = document.getElementsByName(this.config.fieldMappings.deviations)[0];
        if (deviationField && deviationField.value) {
            try {
                this.state.deviations = JSON.parse(deviationField.value) || [];
            } catch (e) {
                console.warn('Failed to load existing deviations:', e);
                this.state.deviations = [];
            }
        }
        
        this.updateProtectionUI();
    }

    /**
     * Apply data protection to form elements
     */
    applyDataProtection(enable) {
        // Protect instrument result inputs
        const instrumentInputs = document.querySelectorAll('.ws-instrument');
        instrumentInputs.forEach(input => {
            if (enable) {
                input.readOnly = true;
                input.classList.add('data-locked');
                input.title = "Field is locked for data integrity. Click 'Request Data Unlock' to modify.";
            } else {
                input.readOnly = false;
                input.classList.remove('data-locked');
                input.title = "Field is unlocked for editing - deviation logged.";
            }
        });

        // Protect include checkboxes
        const includeCheckboxes = document.querySelectorAll('.ws-include, .ws-include-all');
        includeCheckboxes.forEach(checkbox => {
            if (enable) {
                checkbox.disabled = true;
                checkbox.classList.add('data-locked');
                checkbox.title = "Checkbox is locked for data integrity.";
            } else {
                checkbox.disabled = false;
                checkbox.classList.remove('data-locked');
                checkbox.title = "Checkbox is unlocked - deviation logged.";
            }
        });

        // Set up click handlers for locked elements
        if (enable) {
            this.setupLockedElementHandlers();
        } else {
            this.removeLockedElementHandlers();
        }
    }

    /**
     * Set up click handlers for locked elements
     */
    setupLockedElementHandlers() {
        const instrumentInputs = document.querySelectorAll('.ws-instrument');
        const includeCheckboxes = document.querySelectorAll('.ws-include, .ws-include-all');

        instrumentInputs.forEach(input => {
            input.addEventListener('click', this.handleLockedFieldClick.bind(this));
        });

        includeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', this.handleLockedCheckboxClick.bind(this));
        });
    }

    /**
     * Remove click handlers for locked elements
     */
    removeLockedElementHandlers() {
        const instrumentInputs = document.querySelectorAll('.ws-instrument');
        const includeCheckboxes = document.querySelectorAll('.ws-include, .ws-include-all');

        instrumentInputs.forEach(input => {
            input.removeEventListener('click', this.handleLockedFieldClick.bind(this));
        });

        includeCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('click', this.handleLockedCheckboxClick.bind(this));
        });
    }

    /**
     * Handle clicks on locked input fields
     */
    handleLockedFieldClick(e) {
        if (e.target.readOnly && e.target.classList.contains('data-locked')) {
            e.preventDefault();
            const proceed = confirm(
                "⚠️ DATA INTEGRITY PROTECTION ACTIVE\n\n" +
                "This field contains instrument data and is protected from unauthorized changes.\n\n" +
                "To edit this field, you must log a deviation explaining why manual entry is necessary.\n\n" +
                "Would you like to request data unlock permission?"
            );
            
            if (proceed) {
                this.showDeviationModal();
            }
        }
    }

    /**
     * Handle clicks on locked checkboxes
     */
    handleLockedCheckboxClick(e) {
        if (e.target.disabled && e.target.classList.contains('data-locked')) {
            e.preventDefault();
            e.stopPropagation();
            
            const proceed = confirm(
                "⚠️ DATA INTEGRITY PROTECTION ACTIVE\n\n" +
                "This checkbox is protected to prevent unauthorized exclusion of analytes from calculations.\n\n" +
                "To modify analyte inclusion, you must log a deviation explaining the scientific justification.\n\n" +
                "Would you like to request data unlock permission?"
            );
            
            if (proceed) {
                this.showDeviationModal();
            }
            
            return false;
        }
    }

    /**
     * Set up deviation modal functionality
     */
    setupDeviationModals() {
        // Deviation logging modal
        const deviationModal = document.getElementById('deviation-modal');
        if (deviationModal) {
            this.setupDeviationModal();
        }

        // Deviation review modal
        const reviewModal = document.getElementById('deviation-review-modal');
        if (reviewModal) {
            this.setupDeviationReviewModal();
        }
    }

    /**
     * Set up deviation logging modal
     */
    setupDeviationModal() {
        // Close buttons
        const closeButtons = document.querySelectorAll('.deviation-close, #cancel-deviation');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideDeviationModal());
        });

        // Form submission
        const form = document.getElementById('deviation-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDeviationSubmission();
            });
        }

        // Click outside to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('deviation-modal');
            if (e.target === modal) {
                this.hideDeviationModal();
            }
        });
    }

    /**
     * Set up deviation review modal
     */
    setupDeviationReviewModal() {
        // Close buttons
        const closeButtons = document.querySelectorAll('.deviation-review-close, #close-deviation-review');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.hideDeviationReview());
        });

        // Click outside to close
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('deviation-review-modal');
            if (e.target === modal) {
                this.hideDeviationReview();
            }
        });
    }

    /**
     * Show deviation logging modal
     */
    showDeviationModal() {
        const modal = document.getElementById('deviation-modal');
        if (modal) {
            modal.style.display = 'block';
            // Clear previous form data
            const form = document.getElementById('deviation-form');
            if (form) form.reset();
        }
    }

    /**
     * Hide deviation logging modal
     */
    hideDeviationModal() {
        const modal = document.getElementById('deviation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Handle deviation form submission
     */
    handleDeviationSubmission() {
        // Validate required fields
        const analystName = document.getElementById('analyst-name')?.value.trim();
        const reason = document.getElementById('deviation-reason')?.value;
        const description = document.getElementById('deviation-description')?.value.trim();
        
        if (!analystName) {
            alert('❌ Analyst name is required.');
            document.getElementById('analyst-name')?.focus();
            return;
        }
        
        if (!reason) {
            alert('❌ Please select a reason for data modification.');
            document.getElementById('deviation-reason')?.focus();
            return;
        }
        
        if (!description || description.length < 10) {
            alert('❌ Please provide a detailed description (minimum 10 characters).');
            document.getElementById('deviation-description')?.focus();
            return;
        }
        
        // Create deviation record
        const deviation = {
            id: `DEV-${Date.now()}`,
            timestamp: new Date().toISOString(),
            analyst: analystName,
            reason: reason,
            description: description,
            unlockTime: new Date().toISOString(),
            relockTime: null
        };
        
        // Store deviation
        this.state.deviations.push(deviation);
        this.state.currentDeviation = deviation;
        
        // Save to storage
        this.updateDeviationStorage();
        
        // Unlock data
        this.applyDataProtection(false);
        this.state.isLocked = false;
        
        // Update UI
        this.updateProtectionUI();
        this.hideDeviationModal();
        
        console.log('Deviation logged and data unlocked:', deviation);
        
        // Show success message
        alert(
            `✅ DEVIATION LOGGED SUCCESSFULLY\n\n` +
            `Deviation ID: ${deviation.id}\n` +
            `Analyst: ${analystName}\n` +
            `Reason: ${reason}\n` +
            `Time: ${new Date().toLocaleString()}\n\n` +
            `⚠️ Data is now unlocked for editing. Remember to lock data when finished.`
        );
    }

    /**
     * Lock data and log re-lock time
     */
    lockData() {
        // Log the re-locking if there was an active deviation
        if (this.state.currentDeviation && !this.state.isLocked) {
            this.state.currentDeviation.relockTime = new Date().toISOString();
            this.state.currentDeviation = null;
            this.updateDeviationStorage();
        }
        
        this.applyDataProtection(true);
        this.state.isLocked = true;
        this.updateProtectionUI();
        
        console.log("Data protection re-enabled");
    }

    /**
     * Update deviation storage
     */
    updateDeviationStorage() {
        let deviationField = document.getElementsByName(this.config.fieldMappings.deviations)[0];
        if (!deviationField) {
            deviationField = document.createElement('textarea');
            deviationField.name = this.config.fieldMappings.deviations;
            deviationField.style.display = 'none';
            document.body.appendChild(deviationField);
        }
        deviationField.value = JSON.stringify(this.state.deviations);
    }

    /**
     * Update protection UI elements
     */
    updateProtectionUI() {
        const statusBadge = document.getElementById('protection-status');
        const lockBtn = document.getElementById('lock-data-btn');
        const unlockBtn = document.getElementById('unlock-data-btn');
        const protectionCheckbox = document.getElementById('data-protection-enabled');
        
        if (this.state.isLocked) {
            if (statusBadge) {
                statusBadge.textContent = 'LOCKED';
                statusBadge.className = 'protection-status locked';
            }
            if (lockBtn) lockBtn.disabled = true;
            if (unlockBtn) unlockBtn.disabled = false;
            if (protectionCheckbox) protectionCheckbox.checked = true;
        } else {
            if (statusBadge) {
                statusBadge.textContent = 'UNLOCKED';
                statusBadge.className = 'protection-status unlocked';
            }
            if (lockBtn) lockBtn.disabled = false;
            if (unlockBtn) unlockBtn.disabled = true;
            if (protectionCheckbox) protectionCheckbox.checked = false;
        }
        
        this.updateDeviationSummary();
        this.updateTabIndicators();
    }

    /**
     * Update deviation summary display
     */
    updateDeviationSummary() {
        const summaryDiv = document.getElementById('deviation-summary');
        if (!summaryDiv) return;
        
        const deviationCount = this.state.deviations.length;
        
        if (deviationCount === 0) {
            summaryDiv.innerHTML = `
                <span style="color: #28a745;">✅ No deviations logged.</span><br>
                <small>All instrument data remains unmodified.</small>
            `;
        } else {
            const currentDeviation = this.state.currentDeviation;
            if (currentDeviation && !this.state.isLocked) {
                summaryDiv.innerHTML = `
                    <div style="padding: 8px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                        <strong>⚠️ Active Deviation:</strong> ${currentDeviation.id}<br>
                        <small>Data unlocked for editing. Remember to lock when finished.</small>
                    </div>
                `;
            } else {
                const lastDeviation = this.state.deviations[deviationCount-1];
                summaryDiv.innerHTML = `
                    <div style="padding: 8px; background-color: #d4edda; border: 1px solid #28a745; border-radius: 4px;">
                        <strong>📋 Total Deviations:</strong> ${deviationCount}<br>
                        <small>Last: ${lastDeviation.id} - ${new Date(lastDeviation.timestamp).toLocaleString()}</small>
                    </div>
                `;
            }
        }
    }

    /**
     * Update tab indicators with lock/unlock status
     */
    updateTabIndicators() {
        const testTabs = document.querySelectorAll('.ws-tab-btn[data-ws-tab]');
        testTabs.forEach(tab => {
            const tabText = tab.textContent;
            const baseText = tabText.replace(' 🔓', '').replace(' 🔒', '');
            
            if (!this.state.isLocked && this.state.currentDeviation) {
                tab.textContent = baseText + ' 🔓';
                tab.title = 'Data is unlocked for editing - deviation active';
            } else {
                tab.textContent = baseText + ' 🔒';
                tab.title = 'Data is protected by integrity controls';
            }
        });
    }

    /**
     * Show deviation review modal
     */
    showDeviationReview() {
        const modal = document.getElementById('deviation-review-modal');
        const content = document.getElementById('deviation-review-content');
        
        if (!modal || !content) return;
        
        if (this.state.deviations.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h4>✅ No Deviations Found</h4>
                    <p>No data integrity deviations have been logged for this worksheet.</p>
                </div>
            `;
        } else {
            content.innerHTML = this.generateDeviationReviewHTML();
        }
        
        modal.style.display = 'block';
    }

    /**
     * Hide deviation review modal
     */
    hideDeviationReview() {
        const modal = document.getElementById('deviation-review-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Generate HTML for deviation review
     */
    generateDeviationReviewHTML() {
        let html = `
            <div style="margin-bottom: 15px;">
                <strong>Total Deviations:</strong> ${this.state.deviations.length}
                <span style="margin-left: 20px; color: #666;">Click any deviation for full details</span>
            </div>
            <div class="deviation-list">
        `;
        
        this.state.deviations.forEach((deviation, index) => {
            const unlockTime = new Date(deviation.unlockTime).toLocaleString();
            const relockTime = deviation.relockTime ? new Date(deviation.relockTime).toLocaleString() : 'Still Unlocked';
            const duration = deviation.relockTime 
                ? Math.round((new Date(deviation.relockTime) - new Date(deviation.unlockTime)) / (1000 * 60)) + ' minutes'
                : 'Ongoing';
            
            const statusClass = deviation.relockTime ? 'deviation-completed' : 'deviation-active';
            const statusText = deviation.relockTime ? 'Completed' : 'Active';
            
            html += `
                <div class="deviation-item ${statusClass}" onclick="window.QBenchWorksheet.getModule('dataIntegrity').toggleDeviationDetails(${index})">
                    <div class="deviation-header">
                        <strong>${deviation.id}</strong>
                        <span class="deviation-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="deviation-summary">
                        <strong>Analyst:</strong> ${deviation.analyst} |
                        <strong>Reason:</strong> ${deviation.reason} |
                        <strong>Duration:</strong> ${duration}
                    </div>
                    <div class="deviation-details" id="deviation-details-${index}" style="display: none;">
                        <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
                            <h5>Detailed Description:</h5>
                            <p style="margin: 5px 0; white-space: pre-wrap;">${deviation.description}</p>
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
                            <div><strong>Unlock Time:</strong><br>${unlockTime}</div>
                            <div><strong>Relock Time:</strong><br>${relockTime}</div>
                            <div><strong>Duration:</strong><br>${duration}</div>
                            <div></div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Toggle deviation details display
     */
    toggleDeviationDetails(index) {
        const details = document.getElementById(`deviation-details-${index}`);
        if (details) {
            const isVisible = details.style.display !== 'none';
            details.style.display = isVisible ? 'none' : 'block';
        }
    }

    /**
     * Export deviations to CSV
     */
    exportDeviations() {
        if (this.state.deviations.length === 0) {
            alert('No deviations to export.');
            return;
        }
        
        // Get sample ID and assay display name for traceability
        const sampleInfo = window.getSampleInfo();
        const unitConfig = window.getUnitConfig();
        const sampleId = sampleInfo.sample_id || "Not specified";
        const assayDisplayName = unitConfig.assay_display_name || unitConfig.assay_name || "Not specified";
        
        // Create CSV content
        let csvContent = 'Sample ID,Assay Display Name,Deviation ID,Timestamp,Analyst,Reason,Description,Unlock Time,Relock Time,Duration (minutes)\n';
        
        this.state.deviations.forEach(deviation => {
            const unlockTime = new Date(deviation.unlockTime).toISOString();
            const relockTime = deviation.relockTime ? new Date(deviation.relockTime).toISOString() : '';
            const duration = deviation.relockTime 
                ? Math.round((new Date(deviation.relockTime) - new Date(deviation.unlockTime)) / (1000 * 60))
                : '';
            
            // Escape CSV fields
            const escapeCSV = (str) => str.toString().replace(/"/g, '""');
            
            csvContent += [
                escapeCSV(sampleId),
                escapeCSV(assayDisplayName),
                deviation.id,
                deviation.timestamp,
                escapeCSV(deviation.analyst),
                escapeCSV(deviation.reason),
                `"${escapeCSV(deviation.description)}"`,
                unlockTime,
                relockTime,
                duration
            ].join(',') + '\n';
        });
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `deviations_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Deviations exported successfully');
    }

    // Public API methods
    getDeviations() {
        return this.state.deviations;
    }

    isDataLocked() {
        return this.state.isLocked;
    }

    getCurrentDeviation() {
        return this.state.currentDeviation;
    }
}
