// qbench-worksheet-external.js
(function() {
    'use strict';
    
    console.log('External QBench script loading...');
    
    // Wait for DOM to be ready
    function initializeExternalScript() {
        // Check if our target container exists
        const container = document.querySelector('.qbench-worksheet-container');
        if (!container) {
            console.log('Container not ready, retrying...');
            setTimeout(initializeExternalScript, 100);
            return;
        }
        
        console.log('Container found, injecting Hello World...');
        
        // Create our hello world div
        const helloDiv = document.createElement('div');
        helloDiv.id = 'external-hello-world';
        helloDiv.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            animation: fadeIn 1s ease-in;
        `;
        helloDiv.innerHTML = `
            🎉 Hello World from External Script! 🎉<br>
            <small style="font-size: 14px; opacity: 0.9;">
                Loaded from: ${window.QBenchWorksheetConfig?.scriptUrl || 'External source'}<br>
                Assay ID: ${window.QBenchWorksheetConfig?.assayId || 'Not specified'}<br>
                Version: ${window.QBenchWorksheetConfig?.version || '1.0.0'}
            </small>
        `;
        
        // Add some CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // Find a good place to inject it (after the sample info section if it exists)
        const sampleInfoSection = container.querySelector('.sample-info-section');
        if (sampleInfoSection) {
            sampleInfoSection.parentNode.insertBefore(helloDiv, sampleInfoSection.nextSibling);
        } else {
            // Fallback: insert at the beginning of the container
            container.insertBefore(helloDiv, container.firstChild);
        }
        
        console.log('✅ External script initialized successfully!');
        
        // Add a simple click handler to demonstrate interactivity
        helloDiv.addEventListener('click', function() {
            this.style.background = this.style.background.includes('#FF6B6B') 
                ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                : 'linear-gradient(135deg, #FF6B6B, #FF5252)';
            
            const messages = [
                '🌟 External script is working!',
                '🚀 Ready for real functionality!',
                '💡 Click me again!',
                '🔥 Smooth external loading!'
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const small = this.querySelector('small');
            const originalContent = small.innerHTML;
            
            small.innerHTML = `<strong>${randomMessage}</strong><br>Click count: ${(parseInt(this.dataset.clicks) || 0) + 1}`;
            this.dataset.clicks = (parseInt(this.dataset.clicks) || 0) + 1;
            
            // Restore original content after 2 seconds
            setTimeout(() => {
                small.innerHTML = originalContent;
            }, 2000);
        });
        
        // Demonstrate access to QBench worksheet config
        if (window.QBenchWorksheetConfig) {
            console.log('QBench Config Available:', window.QBenchWorksheetConfig);
        }
        
        // Test finding worksheet elements
        const wsUnitConfig = document.getElementById('ws-unit-config');
        if (wsUnitConfig) {
            try {
                const config = JSON.parse(wsUnitConfig.textContent);
                console.log('Worksheet unit config loaded:', config);
            } catch (e) {
                console.log('Could not parse unit config:', e);
            }
        }
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExternalScript);
    } else {
        initializeExternalScript();
    }
})();
