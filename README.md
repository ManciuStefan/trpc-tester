# tRPC Tester

A simple Python web application for testing and debugging tRPC endpoints. Built with Flask and featuring a modern, responsive UI.

## Features

- 🚀 **Easy Configuration**: Set your tRPC server base URL and custom headers
- 🔍 **Procedure Discovery**: Automatically discover available tRPC procedures
- 🧪 **Endpoint Testing**: Test procedures with custom input data and HTTP methods
- 📊 **Detailed Results**: View comprehensive request/response details
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⌨️ **Keyboard Shortcuts**: Quick access to common actions
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Installation

1. **Clone or download the project files**
2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

### Starting the Application

1. **Run the Flask app**:
   ```bash
   python app.py
   ```

2. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

### Configuration

1. **Set Base URL**: Enter your tRPC server's base URL (e.g., `https://api.example.com`)
2. **Custom Headers**: Optionally add custom headers like authentication tokens
3. **SSL Verification**: Toggle SSL certificate verification (disable for self-signed certificates)
4. **Save Configuration**: Click "Save Configuration" to store your settings

### Testing tRPC Endpoints

1. **Load Procedures**: Click "Load Procedures" to discover available endpoints
2. **Select Procedure**: Click on a procedure from the list to auto-fill the path
3. **Set Parameters**:
   - Choose HTTP method (GET/POST)
   - Enter input data in JSON format
   - Set timeout if needed
4. **Test**: Click "Test Procedure" to execute the request
5. **View Results**: Examine detailed request/response information

## API Endpoints

The application provides several API endpoints for programmatic access:

- `GET /api/config` - Get current configuration
- `POST /api/config` - Update configuration
- `GET /api/procedures` - Get available procedures
- `POST /api/test` - Test a specific procedure
- `GET /api/health` - Health check

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save configuration
- `Ctrl/Cmd + T` - Test procedure
- `Ctrl/Cmd + P` - Load procedures

## Example Usage

### Testing a User Creation Endpoint

1. **Configuration**:
   ```
   Base URL: https://myapi.com
   Headers: {"Authorization": "Bearer your-token"}
   ```

2. **Test Parameters**:
   ```
   Procedure Path: user.create
   Method: POST
   Input Data: {"name": "John Doe", "email": "john@example.com"}
   ```

3. **Results**: View the complete request/response cycle with status codes, headers, and body content.

## File Structure

```
trpc-tester/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── README.md          # This file
├── templates/
│   └── index.html     # Main HTML template
└── static/
    ├── css/
    │   └── style.css  # Custom CSS styles
    └── js/
        └── app.js     # Frontend JavaScript
```

## Customization

### Adding Custom Headers

You can add authentication headers, API keys, or any other custom headers:

```json
{
  "Authorization": "Bearer your-jwt-token",
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}
```

### Environment Variables

Create a `.env` file in the project root to set environment-specific configurations:

```env
FLASK_ENV=development
FLASK_DEBUG=true
```

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if your tRPC server is running and accessible
2. **SSL Certificate Errors**: Disable SSL verification for development servers with self-signed certificates
3. **Invalid JSON**: Ensure your input data and headers are valid JSON
4. **CORS Issues**: The app includes CORS support, but your server may need to allow requests from `localhost:5000`

### Debug Mode

Run the app with debug mode enabled for detailed error information:

```bash
export FLASK_DEBUG=1
python app.py
```

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

This project is open source and available under the MIT License.

## Dependencies

- **Flask**: Web framework
- **requests**: HTTP library for making requests
- **python-dotenv**: Environment variable management
- **flask-cors**: Cross-origin resource sharing support

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

The application uses modern web standards and should work in all current browsers.
