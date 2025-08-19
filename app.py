import os
import json
import requests
import urllib3
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
CORS(app)

class TRPCTester:
    def __init__(self):
        self.base_url = ""
        self.headers = {}
        self.ssl_verify = False
        self.auth_cookie = None
        self.test_procedure_path = ""
        self.test_http_method = "POST"
        self.test_input_data = ""
        self.test_timeout = 30
        self.trpc_format = "standard"  # Options: "standard", "json", "modern", "legacy", "batch"
        self.form_fields = []  # Array of form field objects
        self.session = requests.Session()
        self.config_file = "config.json"
        self.load_config_from_file()
    
    def load_config_from_file(self):
        """Load configuration from file if it exists"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.base_url = config.get('base_url', '')
                    self.headers = config.get('headers', {})
                    self.ssl_verify = config.get('ssl_verify', False)
                    self.auth_cookie = config.get('auth_cookie', None)
                    self.test_procedure_path = config.get('test_procedure_path', '')
                    self.test_http_method = config.get('test_http_method', 'POST')
                    self.test_input_data = config.get('test_input_data', '')
                    self.test_timeout = config.get('test_timeout', 30)
                    self.trpc_format = config.get('trpc_format', 'standard')
                    self.form_fields = config.get('form_fields', [])
                    
                    # Restore session cookies if auth_cookie exists
                    if self.auth_cookie:
                        try:
                            cookie_value = self.auth_cookie.split(';')[0].strip()
                            if '=' in cookie_value:
                                name, value = cookie_value.split('=', 1)
                                self.session.cookies.set(name.strip(), value.strip())
                        except Exception as e:
                            print(f"Warning: Could not restore cookie: {e}")
                            
                    print(f"Configuration loaded from {self.config_file}")
        except Exception as e:
            print(f"Warning: Could not load configuration file: {e}")
    
    def save_config_to_file(self):
        """Save current configuration to file"""
        try:
            config = {
                'base_url': self.base_url,
                'headers': self.headers,
                'ssl_verify': self.ssl_verify,
                'auth_cookie': self.auth_cookie,
                'test_procedure_path': self.test_procedure_path,
                'test_http_method': self.test_http_method,
                'test_input_data': self.test_input_data,
                'test_timeout': self.test_timeout,
                'trpc_format': self.trpc_format,
                'form_fields': self.form_fields
            }
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            print(f"Configuration saved to {self.config_file}")
        except Exception as e:
            print(f"Warning: Could not save configuration file: {e}")
    
    def reset_config(self):
        """Reset configuration to defaults"""
        self.base_url = ""
        self.headers = {'Content-Type': 'application/json'}
        self.ssl_verify = False
        self.auth_cookie = None
        self.test_procedure_path = ""
        self.test_http_method = "POST"
        self.test_input_data = ""
        self.test_timeout = 30
        self.trpc_format = "standard"
        self.form_fields = []
        self.session.cookies.clear()
        self.save_config_to_file()
        print("Configuration reset to defaults")

    def set_base_url(self, url):
        """Set the base URL for the tRPC server"""
        self.base_url = url.rstrip('/')
        # Set default headers if not already set
        if not self.headers:
            self.headers = {'Content-Type': 'application/json'}
        self.save_config_to_file()
    
    def set_headers(self, headers_dict):
        """Set custom headers for requests"""
        self.headers.update(headers_dict)
        self.save_config_to_file()
    
    def set_ssl_verify(self, verify):
        """Set SSL verification setting"""
        self.ssl_verify = verify
        self.save_config_to_file()
    
    def set_auth_cookie(self, cookie):
        """Set authentication cookie"""
        self.auth_cookie = cookie
        if cookie:
            # Parse the cookie and add it to the session
            try:
                # Extract the main cookie value (before any attributes)
                cookie_value = cookie.split(';')[0].strip()
                if '=' in cookie_value:
                    name, value = cookie_value.split('=', 1)
                    self.session.cookies.set(name.strip(), value.strip())
            except Exception as e:
                print(f"Warning: Could not parse cookie: {e}")
        self.save_config_to_file()
    
    def set_test_procedure_path(self, path):
        """Set the test procedure path"""
        self.test_procedure_path = path
        self.save_config_to_file()
    
    def set_test_http_method(self, method):
        """Set the test HTTP method"""
        self.test_http_method = method
        self.save_config_to_file()
    
    def set_test_input_data(self, data):
        """Set the test input data"""
        self.test_input_data = data
        self.save_config_to_file()
    
    def set_test_timeout(self, timeout):
        """Set the test timeout"""
        self.test_timeout = timeout
        self.save_config_to_file()
    
    def set_trpc_format(self, format_type):
        """Set the tRPC request format"""
        print(f"🔍 DEBUG: Setting tRPC format to: {format_type}")
        self.trpc_format = format_type
        self.save_config_to_file()
        print(f"🔍 DEBUG: tRPC format is now: {self.trpc_format}")
    
    def set_form_fields(self, form_fields):
        """Set the form fields configuration"""
        self.form_fields = form_fields
        self.save_config_to_file()
    
    def get_procedures(self):
        """Get available procedures from the tRPC server"""
        if not self.base_url:
            return {"error": "Base URL not set"}
        
        try:
            # Try to get procedures from the tRPC server
            response = self.session.get(f"{self.base_url}/api/trpc", headers=self.headers, timeout=10, verify=self.ssl_verify)
            if response.status_code == 200:
                return {"procedures": response.json()}
            else:
                return {"error": f"Failed to get procedures: {response.status_code}"}
        except requests.exceptions.SSLError as e:
            return {"error": f"SSL Error: {str(e)}. Try enabling 'Disable SSL Verification' in settings."}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
    
    def test_procedure(self, procedure_path, input_data=None, method="POST", timeout=30):
        """Test a specific tRPC procedure"""
        if not self.base_url:
            return {"error": "Base URL not set"}
        
        print(f"🔍 DEBUG: test_procedure called with format: {self.trpc_format}")
        
        # Use the procedure path directly without prepending /api/trpc
        url = f"{self.base_url}/{procedure_path}"
        
        try:
            if method.upper() == "GET":
                # For tRPC GET requests, format query parameters based on format setting
                if input_data and isinstance(input_data, dict):
                    if self.trpc_format == "json":
                        # JSON tRPC format: input is {"json": input_data} encoded in query param
                        import json
                        from urllib.parse import quote
                        json_wrapped = {"json": input_data}
                        json_input = json.dumps(json_wrapped)
                        url = f"{url}?input={quote(json_input)}"
                    elif self.trpc_format == "legacy":
                        # Legacy tRPC format: input is {"0": {"json": input_data}} encoded in query param
                        import json
                        from urllib.parse import quote
                        legacy_wrapped = {"0": {"json": input_data}}
                        json_input = json.dumps(legacy_wrapped)
                        url = f"{url}?input={quote(json_input)}"
                    elif self.trpc_format == "batch":
                        # Batch tRPC format: input is [{"path": procedure_path, "input": input_data}] encoded in query param
                        import json
                        from urllib.parse import quote
                        batch_wrapped = [{"path": procedure_path, "input": input_data}]
                        json_input = json.dumps(batch_wrapped)
                        url = f"{url}?input={quote(json_input)}"
                    elif self.trpc_format == "modern":
                        # Modern tRPC format: input is {"input": input_data} encoded in query param
                        import json
                        from urllib.parse import quote
                        modern_wrapped = {"input": input_data}
                        json_input = json.dumps(modern_wrapped)
                        url = f"{url}?input={quote(json_input)}"
                    else:
                        # Standard tRPC format: direct key-value pairs
                        from urllib.parse import urlencode
                        query_string = urlencode(input_data)
                        if query_string:
                            url = f"{url}?{query_string}"
                
                print(f"🔍 DEBUG: GET request URL: {url}")
                response = self.session.get(url, headers=self.headers, timeout=timeout, verify=self.ssl_verify)
            else:
                # For tRPC POST requests, format the body correctly based on format setting
                print(f"🔍 DEBUG: tRPC format selected: {self.trpc_format}")
                print(f"🔍 DEBUG: Input data: {input_data}")
                if input_data and isinstance(input_data, dict):
                    if self.trpc_format == "json":
                        # JSON tRPC format: {"json": input_data}
                        trpc_body = {"json": input_data}
                    elif self.trpc_format == "legacy":
                        # Legacy tRPC format: {"0": {"json": input_data}}
                        trpc_body = {"0": {"json": input_data}}
                    elif self.trpc_format == "batch":
                        # Batch tRPC format: [{"path": procedure_path, "input": input_data}]
                        trpc_body = [{"path": procedure_path, "input": input_data}]
                    elif self.trpc_format == "modern":
                        # Modern tRPC format: {"input": input_data}
                        trpc_body = {"input": input_data}
                    else:
                        # Standard tRPC format: just the input data directly
                        trpc_body = input_data
                else:
                    trpc_body = {}
                
                print(f"🔍 DEBUG: Final trpc_body: {trpc_body}")
                response = self.session.post(url, headers=self.headers, json=trpc_body, timeout=timeout, verify=self.ssl_verify)
            
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "response": response.text,
                "url": url,
                "method": method.upper(),
                "sent_body": trpc_body if method.upper() == "POST" else None,
                "sent_query_params": input_data if method.upper() == "GET" and input_data else None,
                "debug_info": {
                    "input_data_received": input_data,
                    "trpc_format_used": self.trpc_format,
                    "final_url": url,
                    "request_headers": dict(self.headers)
                }
            }
        except requests.exceptions.SSLError as e:
            return {"error": f"SSL Error: {str(e)}. Try enabling 'Disable SSL Verification' in settings."}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}

# Global tRPC tester instance
trpc_tester = TRPCTester()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/config', methods=['GET', 'POST'])
def config():
    if request.method == 'POST':
        data = request.json
        if 'base_url' in data:
            trpc_tester.set_base_url(data['base_url'])
        if 'headers' in data:
            trpc_tester.set_headers(data['headers'])
        if 'ssl_verify' in data:
            trpc_tester.set_ssl_verify(data['ssl_verify'])
        if 'auth_cookie' in data:
            trpc_tester.set_auth_cookie(data['auth_cookie'])
        return jsonify({"success": True, "message": "Configuration updated"})
    else:
        return jsonify({
            "base_url": trpc_tester.base_url,
            "headers": trpc_tester.headers,
            "ssl_verify": trpc_tester.ssl_verify,
            "auth_cookie": trpc_tester.auth_cookie,
            "test_procedure_path": trpc_tester.test_procedure_path,
            "test_http_method": trpc_tester.test_http_method,
            "test_input_data": trpc_tester.test_input_data,
            "test_timeout": trpc_tester.test_timeout,
            "trpc_format": trpc_tester.trpc_format,
            "form_fields": trpc_tester.form_fields
        })

@app.route('/api/procedures')
def get_procedures():
    return jsonify(trpc_tester.get_procedures())

@app.route('/api/test', methods=['POST'])
def test_procedure():
    data = request.json
    procedure_path = data.get('procedure_path', '')
    input_data = data.get('input_data', {})
    method = data.get('method', 'POST')
    timeout = data.get('timeout', 30)
    
    if not procedure_path:
        return jsonify({"error": "Procedure path is required"}), 400
    
    result = trpc_tester.test_procedure(procedure_path, input_data, method, timeout)
    return jsonify(result)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "base_url": trpc_tester.base_url})

@app.route('/api/reset', methods=['POST'])
def reset_config():
    trpc_tester.reset_config()
    return jsonify({"success": True, "message": "Configuration reset to defaults"})

@app.route('/api/test-settings', methods=['GET', 'POST'])
def test_settings():
    if request.method == 'POST':
        data = request.json
        if 'procedure_path' in data:
            trpc_tester.set_test_procedure_path(data['procedure_path'])
        if 'http_method' in data:
            trpc_tester.set_test_http_method(data['http_method'])
        if 'input_data' in data:
            trpc_tester.set_test_input_data(data['input_data'])
        if 'timeout' in data:
            trpc_tester.set_test_timeout(data['timeout'])
        if 'trpc_format' in data:
            trpc_tester.set_trpc_format(data['trpc_format'])
        if 'form_fields' in data:
            trpc_tester.set_form_fields(data['form_fields'])
        return jsonify({"success": True, "message": "Test settings updated"})
    else:
        return jsonify({
            "procedure_path": trpc_tester.test_procedure_path,
            "http_method": trpc_tester.test_http_method,
            "input_data": trpc_tester.test_input_data,
            "timeout": trpc_tester.test_timeout,
            "trpc_format": trpc_tester.trpc_format,
            "form_fields": trpc_tester.form_fields
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
