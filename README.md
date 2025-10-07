# data-collection-api

## Overview

A full-stack system for collecting device and location information from web clients, consisting of a Flask backend API and configurable JavaScript frontend.

## Installation

1. Clone the repository:
    ```bash
    git clone --depth 1 https://github.com/8gudbits/data-collection-api.git
    ```

2. Install dependencies:
    ```bash
    pip install flask flask-cors waitress
    ```

## Backend Setup

1. Start the server:
    ```bash
    cd data-collection-api
    cd backend
    python main.py
    ```

2. The server runs on http://0.0.0.0:5000 and provides:
    - API endpoint: `/metrics` (POST)
    - Static file serving: `/main.js`

## Data Storage

All received data is saved as individual JSON files in the `collected_data/` directory with microsecond-precision timestamps.

## Frontend Integration

### Basic Usage

```html
<script src="http://your-server-addr:5000/main.js"></script>
<script>dropClientInfo();</script>
```

### Configuration Options

Set `API_URLS` before calling the function:

```html
<script src="main.js"></script>
<script>
    API_URLS = ["https://your-api.com/metrics"];
    dropClientInfo();
</script>
```

### Helper Functions

- `setApiUrls(urls)` - Replace API endpoints (array or string)
- `addApiUrl(url)` - Add additional endpoint
- `getApiUrls()` - Get current endpoints
- `collectDeviceInfo()` - Collect data without sending

## Security Notes

- **CORS Origins:** Modify `ORIGINS = ["*"]` in `backend/main.py` to restrict access in production
- **API URLs:** Update default endpoints in frontend JavaScript for your deployment

## Architecture

- **Backend:** Flask API with Waitress WSGI server
- **Frontend:** Configurable JavaScript telemetry collection
- **Storage:** JSON files with metadata timestamps
- **CORS:** Enabled for cross-origin requests

The system provides device fingerprinting including IP geolocation, hardware specs, browser details, and performance metrics.

