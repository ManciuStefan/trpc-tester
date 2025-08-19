// tRPC Tester Frontend Application

class TRPCTesterApp {
    constructor() {
        this.currentConfig = {};
        this.procedures = [];
        this.inputMode = 'json'; // 'json' or 'form'
        this.formFields = []; // Array of form field objects
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.updateInputDataLabel(); // Set initial label
        this.showStatus('Ready to test tRPC endpoints', 'info');
    }

    setupEventListeners() {
        // Auto-save configuration on input change
        document.getElementById('baseUrl').addEventListener('input', () => {
            this.validateUrl();
        });

        document.getElementById('customHeaders').addEventListener('input', () => {
            this.validateJSON();
        });

        // Enter key support for procedure path
        document.getElementById('procedurePath').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.testProcedure();
            }
        });

        // Auto-format JSON input
        document.getElementById('inputData').addEventListener('blur', () => {
            this.formatJSONInput();
        });

        // Update input data label based on HTTP method
        document.getElementById('httpMethod').addEventListener('change', () => {
            this.updateInputDataLabel();
        });

        // Auto-save test procedure settings on change
        document.getElementById('procedurePath').addEventListener('input', () => {
            this.saveTestSettings();
        });

        document.getElementById('httpMethod').addEventListener('change', () => {
            this.saveTestSettings();
        });

        document.getElementById('inputData').addEventListener('input', () => {
            this.saveTestSettings();
        });

        document.getElementById('timeout').addEventListener('input', () => {
            this.saveTestSettings();
        });

        document.getElementById('trpcFormat').addEventListener('change', () => {
            this.saveTestSettings();
        });
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            
            if (config.base_url) {
                document.getElementById('baseUrl').value = config.base_url;
                this.currentConfig.base_url = config.base_url;
            }
            
            if (config.headers && Object.keys(config.headers).length > 0) {
                const headersText = JSON.stringify(config.headers, null, 2);
                document.getElementById('customHeaders').value = headersText;
                this.currentConfig.headers = config.headers;
            }
            
            if (config.ssl_verify !== undefined) {
                document.getElementById('sslVerify').checked = config.ssl_verify;
                this.currentConfig.ssl_verify = config.ssl_verify;
            }
            
            if (config.auth_cookie) {
                document.getElementById('authCookie').value = config.auth_cookie;
                this.currentConfig.auth_cookie = config.auth_cookie;
            }
            
            // Load test procedure settings
            if (config.test_procedure_path) {
                document.getElementById('procedurePath').value = config.test_procedure_path;
                this.currentConfig.test_procedure_path = config.test_procedure_path;
            }
            
            if (config.test_http_method) {
                document.getElementById('httpMethod').value = config.test_http_method;
                this.currentConfig.test_http_method = config.test_http_method;
            }
            
            if (config.test_input_data) {
                document.getElementById('inputData').value = config.test_input_data;
                this.currentConfig.test_input_data = config.test_input_data;
            }
            
            if (config.test_timeout) {
                document.getElementById('timeout').value = config.test_timeout;
                this.currentConfig.test_timeout = config.test_timeout;
            }
            
            if (config.trpc_format) {
                document.getElementById('trpcFormat').value = config.trpc_format;
                this.currentConfig.trpc_format = config.trpc_format;
            }
            
            // Load form fields if they exist
            if (config.form_fields && Array.isArray(config.form_fields)) {
                console.log('🔍 Loading form fields from config:', config.form_fields);
                this.formFields = config.form_fields;
                this.currentConfig.form_fields = config.form_fields;
                // If we have form fields, switch to form mode and render them
                if (this.formFields.length > 0) {
                    console.log('🔍 Switching to form mode with', this.formFields.length, 'fields');
                    // Delay the form mode switch to ensure DOM is ready
                    setTimeout(() => {
                        this.setInputMode('form', true); // Skip update to avoid interference
                        this.renderFormFields();
                        console.log('🔍 Form fields rendered:', this.formFields);
                    }, 100);
                }
            }
            
            // Update input data label based on loaded method
            this.updateInputDataLabel();
            
            // Update config status
            if (config.base_url) {
                this.updateConfigStatus(`Configuration loaded from ${config.base_url}`);
            } else {
                this.updateConfigStatus('No configuration loaded');
            }
            
        } catch (error) {
            console.error('Failed to load configuration:', error);
            this.updateConfigStatus('Failed to load configuration');
        }
    }

    validateUrl() {
        const urlInput = document.getElementById('baseUrl');
        const url = urlInput.value.trim();
        
        if (url && !this.isValidUrl(url)) {
            urlInput.classList.add('input-error');
            urlInput.classList.remove('input-success');
        } else if (url) {
            urlInput.classList.remove('input-error');
            urlInput.classList.add('input-success');
        } else {
            urlInput.classList.remove('input-error', 'input-success');
        }
    }

    validateJSON() {
        const headersInput = document.getElementById('customHeaders');
        const headersText = headersInput.value.trim();
        
        if (headersText) {
            try {
                JSON.parse(headersText);
                headersInput.classList.add('input-success');
                headersInput.classList.remove('input-error');
            } catch (error) {
                headersInput.classList.add('input-error');
                headersInput.classList.remove('input-success');
            }
        } else {
            headersInput.classList.remove('input-error', 'input-success');
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    updateInputDataLabel() {
        const method = document.getElementById('httpMethod').value;
        const label = document.getElementById('inputDataLabel');
        const input = document.getElementById('inputData');
        
        if (method === 'GET') {
            label.textContent = 'Query Parameters (JSON)';
            input.placeholder = '{"page": 1, "limit": 10}';
        } else {
            label.textContent = 'Input Data (JSON)';
            input.placeholder = '{"name": "John", "email": "john@example.com"}';
        }
    }

    updateConfigStatus(message) {
        const statusElement = document.getElementById('configStatus');
        if (statusElement) {
            if (message.includes('loaded from')) {
                statusElement.innerHTML = '<i class="fas fa-circle text-green-500 mr-1"></i>' + message;
            } else if (message.includes('Failed')) {
                statusElement.innerHTML = '<i class="fas fa-circle text-red-500 mr-1"></i>' + message;
            } else if (message.includes('No configuration')) {
                statusElement.innerHTML = '<i class="fas fa-circle text-yellow-500 mr-1"></i>' + message;
            } else {
                statusElement.innerHTML = '<i class="fas fa-circle text-blue-500 mr-1"></i>' + message;
            }
        }
    }

    async saveTestSettings() {
        const procedurePath = document.getElementById('procedurePath').value.trim();
        const httpMethod = document.getElementById('httpMethod').value;
        const inputData = document.getElementById('inputData').value.trim();
        const timeout = parseInt(document.getElementById('timeout').value) || 30;
        const trpcFormat = document.getElementById('trpcFormat').value;

        try {
            console.log('🔍 Frontend DEBUG: Sending trpc_format:', trpcFormat);
            const response = await fetch('/api/test-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    procedure_path: procedurePath,
                    http_method: httpMethod,
                    input_data: inputData,
                    timeout: timeout,
                    trpc_format: trpcFormat,
                    form_fields: this.formFields
                })
            });

            const result = await response.json();
            console.log('🔍 Frontend DEBUG: Response received:', result);
            
            if (result.success) {
                // Update current config
                this.currentConfig.test_procedure_path = procedurePath;
                this.currentConfig.test_http_method = httpMethod;
                this.currentConfig.test_input_data = inputData;
                this.currentConfig.test_timeout = timeout;
                this.currentConfig.trpc_format = trpcFormat;
                
                console.log('🔍 Frontend DEBUG: Updated currentConfig.trpc_format to:', trpcFormat);
                
                // Show subtle feedback
                this.showStatus('Test settings saved', 'success');
            }
        } catch (error) {
            console.error('Failed to save test settings:', error);
        }
    }

    formatJSONInput() {
        const input = document.getElementById('inputData');
        const text = input.value.trim();
        
        if (text) {
            try {
                const parsed = JSON.parse(text);
                input.value = JSON.stringify(parsed, null, 2);
            } catch (error) {
                // Don't format if it's not valid JSON
            }
        }
    }

    async saveConfig() {
        const baseUrl = document.getElementById('baseUrl').value.trim();
        const headersText = document.getElementById('customHeaders').value.trim();
        const sslVerify = document.getElementById('sslVerify').checked;
        const authCookie = document.getElementById('authCookie').value.trim();
        
        if (!baseUrl) {
            this.showStatus('Base URL is required', 'error');
            return;
        }

        if (!this.isValidUrl(baseUrl)) {
            this.showStatus('Please enter a valid URL', 'error');
            return;
        }

        let headers = {};
        if (headersText) {
            try {
                headers = JSON.parse(headersText);
            } catch (error) {
                this.showStatus('Invalid JSON in headers', 'error');
                return;
            }
        }

        try {
            this.updateConfigStatus('Saving configuration...');
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    base_url: baseUrl,
                    headers: headers,
                    ssl_verify: sslVerify,
                    auth_cookie: authCookie
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentConfig = { base_url: baseUrl, headers: headers, ssl_verify: sslVerify, auth_cookie: authCookie };
                this.showStatus('Configuration saved successfully', 'success');
                this.updateConfigStatus(`Configuration saved to ${baseUrl}`);
                this.validateUrl();
                this.validateJSON();
            } else {
                this.showStatus('Failed to save configuration', 'error');
            }
        } catch (error) {
            this.showStatus('Error saving configuration', 'error');
            console.error('Save config error:', error);
        }
    }

    async testConnection() {
        if (!this.currentConfig.base_url) {
            this.showStatus('Please save configuration first', 'warning');
            return;
        }

        this.showStatus('Testing connection...', 'info');
        
        try {
            const response = await fetch('/api/health');
            const result = await response.json();
            
            if (result.status === 'healthy') {
                this.showStatus('Connection successful!', 'success');
            } else {
                this.showStatus('Connection failed', 'error');
            }
        } catch (error) {
            this.showStatus('Connection test failed', 'error');
            console.error('Connection test error:', error);
        }
    }

    async loadProcedures() {
        if (!this.currentConfig.base_url) {
            this.showStatus('Please save configuration first', 'warning');
            return;
        }

        this.showStatus('Loading procedures...', 'info');
        
        try {
            const response = await fetch('/api/procedures');
            const result = await response.json();
            
            if (result.procedures) {
                this.procedures = result.procedures;
                this.displayProcedures();
                this.showStatus(`Loaded ${this.procedures.length} procedures`, 'success');
            } else if (result.error) {
                this.showStatus(result.error, 'error');
            }
        } catch (error) {
            this.showStatus('Failed to load procedures', 'error');
            console.error('Load procedures error:', error);
        }
    }

    displayProcedures() {
        const proceduresSection = document.getElementById('proceduresSection');
        const proceduresList = document.getElementById('proceduresList');
        
        if (this.procedures.length === 0) {
            proceduresList.innerHTML = '<p class="text-gray-500">No procedures found</p>';
        } else {
            proceduresList.innerHTML = this.procedures.map(proc => `
                <div class="procedure-item p-3 border border-gray-200 rounded-md hover:bg-gray-50" 
                     onclick="app.selectProcedure('${proc}')">
                    <div class="flex items-center justify-between">
                        <span class="font-mono text-sm text-blue-600">${proc}</span>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            `).join('');
        }
        
        proceduresSection.style.display = 'block';
    }

    selectProcedure(procedurePath) {
        document.getElementById('procedurePath').value = procedurePath;
        document.getElementById('procedurePath').focus();
        
        // Highlight selected procedure
        document.querySelectorAll('.procedure-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        event.currentTarget.classList.add('selected');
    }

    async testProcedure() {
        const procedurePath = document.getElementById('procedurePath').value.trim();
        const method = document.getElementById('httpMethod').value;
        const inputDataText = document.getElementById('inputData').value.trim();
        const timeout = parseInt(document.getElementById('timeout').value) || 30;
        
        if (!procedurePath) {
            this.showStatus('Please enter a procedure path', 'warning');
            return;
        }

        if (!this.currentConfig.base_url) {
            this.showStatus('Please save configuration first', 'warning');
            return;
        }

        let inputData = {};
        if (inputDataText) {
            try {
                inputData = JSON.parse(inputDataText);
            } catch (error) {
                this.showStatus('Invalid JSON in input data', 'error');
                return;
            }
        }

        this.showStatus(`Testing procedure with ${method} method...`, 'info');
        
        // Log what we're sending for debugging
        console.log('Sending test request:', {
            procedure_path: procedurePath,
            method: method,
            input_data: inputData,
            base_url: this.currentConfig.base_url
        });
        
        try {
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    procedure_path: procedurePath,
                    input_data: inputData,
                    method: method,
                    timeout: timeout
                })
            });

            const result = await response.json();
            this.displayResults(result, procedurePath, method, inputData);
            
            if (result.error) {
                this.showStatus('Test failed: ' + result.error, 'error');
            } else {
                this.showStatus('Test completed successfully', 'success');
            }
        } catch (error) {
            this.showStatus('Test failed', 'error');
            console.error('Test error:', error);
        }
    }

    async testAuth() {
        if (!this.currentConfig.base_url) {
            this.showStatus('Please save configuration first', 'warning');
            return;
        }

        if (!this.currentConfig.auth_cookie) {
            this.showStatus('No authentication cookie set', 'warning');
            return;
        }

        this.showStatus('Testing authentication...', 'info');
        
        try {
            // Test with a simple GET request to see if auth works
            const response = await fetch('/api/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    procedure_path: 'auth/test',  // Common auth test endpoint
                    input_data: {},
                    method: 'GET'
                })
            });

            const result = await response.json();
            
            if (result.error) {
                this.showStatus('Auth test failed: ' + result.error, 'error');
            } else if (result.status_code === 401 || result.status_code === 403) {
                this.showStatus('Authentication failed - invalid credentials', 'error');
            } else if (result.status_code >= 200 && result.status_code < 300) {
                this.showStatus('Authentication successful!', 'success');
            } else {
                this.showStatus(`Auth test completed with status: ${result.status_code}`, 'info');
            }
        } catch (error) {
            this.showStatus('Auth test failed', 'error');
            console.error('Auth test error:', error);
        }
    }

    async resetConfig() {
        if (confirm('Are you sure you want to reset all configuration to defaults? This cannot be undone.')) {
            this.showStatus('Resetting configuration...', 'info');
            
            try {
                const response = await fetch('/api/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    this.showStatus('Configuration reset successfully', 'success');
                    this.loadConfig(); // Reload the empty config
                    this.updateConfigStatus('No configuration loaded');
                } else {
                    this.showStatus('Failed to reset configuration', 'error');
                }
            } catch (error) {
                this.showStatus('Failed to reset configuration', 'error');
                console.error('Reset error:', error);
            }
        }
    }

    displayResults(result, procedurePath, method, inputData) {
        const resultsSection = document.getElementById('resultsSection');
        
        // Request details
        const finalUrl = result.url || `${this.currentConfig.base_url}/${procedurePath}`;
        document.getElementById('requestUrl').textContent = finalUrl;
        document.getElementById('requestMethod').textContent = method;
        
        // Show headers and cookies
        let requestHeaders = { ...this.currentConfig.headers };
        if (this.currentConfig.auth_cookie) {
            requestHeaders['Cookie'] = this.currentConfig.auth_cookie;
        }
        document.getElementById('requestHeaders').textContent = JSON.stringify(requestHeaders, null, 2);
        
        // Update the label based on method
        const bodyLabel = document.getElementById('requestBodyLabel');
        if (method.toUpperCase() === 'GET') {
            bodyLabel.textContent = 'Query Parameters:';
        } else {
            bodyLabel.textContent = 'Body:';
        }

        // Log debug information to console
        if (result.debug_info) {
            console.log('🔍 tRPC Debug Info:', result.debug_info);
        }

        // For GET requests, show query parameters instead of body
        if (method.toUpperCase() === 'GET') {
            // Show the actual query parameters that were sent
            if (result.sent_query_params) {
                document.getElementById('requestBody').textContent = JSON.stringify(result.sent_query_params, null, 2);
            } else {
                document.getElementById('requestBody').textContent = 'No query parameters sent';
            }
        } else {
            // Show the actual tRPC formatted body that was sent
            if (result.sent_body) {
                document.getElementById('requestBody').textContent = JSON.stringify(result.sent_body, null, 2);
            } else {
                document.getElementById('requestBody').textContent = JSON.stringify(inputData, null, 2);
            }
        }
        
        // Response details
        if (result.error) {
            document.getElementById('responseStatus').textContent = 'Error';
            document.getElementById('responseStatus').className = 'font-bold text-red-600';
            document.getElementById('responseHeaders').textContent = 'N/A';
            document.getElementById('responseBody').textContent = result.error;
        } else {
            const statusClass = result.status_code >= 200 && result.status_code < 300 ? 'text-green-600' : 'text-red-600';
            document.getElementById('responseStatus').textContent = result.status_code;
            document.getElementById('responseStatus').className = `font-bold ${statusClass}`;
            document.getElementById('responseHeaders').textContent = JSON.stringify(result.headers, null, 2);
            
            try {
                const formattedResponse = JSON.stringify(JSON.parse(result.response), null, 2);
                document.getElementById('responseBody').textContent = formattedResponse;
            } catch (error) {
                document.getElementById('responseBody').textContent = result.response;
            }
        }
        
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showStatus(message, type = 'info') {
        const statusBar = document.getElementById('statusBar');
        const statusMessage = document.getElementById('statusMessage');
        
        statusMessage.textContent = message;
        statusBar.className = `fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg toast ${type}`;
        statusBar.style.display = 'block';
        
        setTimeout(() => {
            statusBar.style.display = 'none';
        }, 5000);
    }

    // Form Mode Methods
    setInputMode(mode) {
        this.inputMode = mode;
        
        // Update button states
        document.getElementById('jsonModeBtn').classList.toggle('active', mode === 'json');
        document.getElementById('formModeBtn').classList.toggle('active', mode === 'form');
        
        // Show/hide appropriate sections
        document.getElementById('jsonMode').classList.toggle('hidden', mode !== 'json');
        document.getElementById('formMode').classList.toggle('hidden', mode !== 'form');
        
        // If switching to form mode and no fields exist, add some default fields
        if (mode === 'form' && this.formFields.length === 0) {
            this.addFormField('limit', '10', 'number', true);
            this.addFormField('offset', '0', 'number', true);
            this.addFormField('enabled', 'true', 'boolean', true);
        }
        
        // Update the input data when switching modes
        this.updateInputDataFromForm();
    }

    addFormField(key = '', value = '', type = 'string', enabled = true) {
        const fieldId = Date.now() + Math.random().toString(36).substr(2, 9);
        const field = {
            id: fieldId,
            key: key,
            value: value,
            type: type,
            enabled: enabled
        };
        
        this.formFields.push(field);
        this.renderFormFields();
        this.updateInputDataFromForm();
    }

    removeFormField(fieldId) {
        this.formFields = this.formFields.filter(field => field.id !== fieldId);
        this.renderFormFields();
        this.updateInputDataFromForm();
    }

    updateFormField(fieldId, property, value) {
        const field = this.formFields.find(f => f.id === fieldId);
        if (field) {
            field[property] = value;
            this.updateInputDataFromForm();
        }
    }

    toggleFormField(fieldId) {
        const field = this.formFields.find(f => f.id === fieldId);
        if (field) {
            field.enabled = !field.enabled;
            this.renderFormFields();
            this.updateInputDataFromForm();
        }
    }

    renderFormFields() {
        console.log('🔍 Rendering form fields:', this.formFields);
        const container = document.getElementById('formFields');
        if (!container) {
            console.error('🔍 Form fields container not found!');
            return;
        }
        container.innerHTML = '';
        
        this.formFields.forEach(field => {
            const fieldElement = this.createFormFieldElement(field);
            container.appendChild(fieldElement);
        });
        console.log('🔍 Form fields rendered successfully');
    }

    createFormFieldElement(field) {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        fieldDiv.innerHTML = `
            <input type="text" 
                   placeholder="Field name" 
                   value="${field.key}" 
                   onchange="app.updateFormField('${field.id}', 'key', this.value)"
                   ${!field.enabled ? 'disabled' : ''}>
            
            <select onchange="app.updateFormField('${field.id}', 'type', this.value)" 
                    ${!field.enabled ? 'disabled' : ''}>
                <option value="string" ${field.type === 'string' ? 'selected' : ''}>String</option>
                <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                <option value="boolean" ${field.type === 'boolean' ? 'selected' : ''}>Boolean</option>
                <option value="object" ${field.type === 'object' ? 'selected' : ''}>Object</option>
                <option value="array" ${field.type === 'array' ? 'selected' : ''}>Array</option>
            </select>
            
            <input type="text" 
                   placeholder="Value" 
                   value="${field.value}" 
                   onchange="app.updateFormField('${field.id}', 'value', this.value)"
                   ${!field.enabled ? 'disabled' : ''}>
            
            <button onclick="app.toggleFormField('${field.id}')" 
                    class="field-toggle ${field.enabled ? 'enabled' : 'disabled'}">
                ${field.enabled ? 'Enabled' : 'Disabled'}
            </button>
            
            <button onclick="app.removeFormField('${field.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        return fieldDiv;
    }

    updateInputDataFromForm() {
        if (this.inputMode === 'form') {
            const data = {};
            
            this.formFields.forEach(field => {
                if (field.enabled && field.key.trim()) {
                    let parsedValue = field.value;
                    
                    // Parse value based on type
                    switch (field.type) {
                        case 'number':
                            parsedValue = field.value === '' ? 0 : parseFloat(field.value);
                            if (isNaN(parsedValue)) parsedValue = 0;
                            break;
                        case 'boolean':
                            parsedValue = field.value.toLowerCase() === 'true';
                            break;
                        case 'object':
                            try {
                                parsedValue = JSON.parse(field.value);
                            } catch (e) {
                                parsedValue = field.value;
                            }
                            break;
                        case 'array':
                            try {
                                parsedValue = JSON.parse(field.value);
                            } catch (e) {
                                parsedValue = field.value.split(',').map(item => item.trim());
                            }
                            break;
                    }
                    
                    data[field.key] = parsedValue;
                }
            });
            
            // Update the hidden input data field
            document.getElementById('inputData').value = JSON.stringify(data, null, 2);
            
            // Save test settings
            this.saveTestSettings();
        }
    }
}

// Global functions for onclick handlers
function saveConfig() {
    app.saveConfig();
}

function testConnection() {
    app.testConnection();
}

function loadProcedures() {
    app.loadProcedures();
}

function testProcedure() {
    app.testProcedure();
}

function testAuth() {
    app.testAuth();
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TRPCTesterApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                saveConfig();
                break;
            case 't':
                e.preventDefault();
                testProcedure();
                break;
            case 'p':
                e.preventDefault();
                loadProcedures();
                break;
        }
    }
});
