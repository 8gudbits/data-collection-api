# data-collection-api

## Overview

A full-stack system for collecting location and device information from web clients, consisting of a Flask API for the backend and JavaScript for the frontend.

## Installation

1. Clone the repository using git:
   ```bash
   git clone --depth 1 https://github.com/8gudbits/data-collection-api.git
   ```

2. Install dependencies using python3-pip:
   ```bash
   pip install flask flask-cors waitress
   ```

## Usage

1. Start the server:
   ```bash
   cd data-collection-api
   cd backend
   python main.py
   ```

2. Send POST requests to `/api` endpoint with JSON data
   - The server runs on `http://0.0.0.0:5000`

## API Endpoint Info

- URL: `/api`
- Method: `POST`
- Content-Type: `application/json`

### Static File Serving

The server also serves the frontend JavaScript file:
- URL: `/main.js`

## Data Storage

- All received data is saved as individual JSON files
- Files are stored in the `collected_data/` directory
- Filename format: `data_YYYYMMDD_HHMMSS_ffffff.json`
- Each file contains:
  - `received_at` ISO timestamp of reception
  - `data` The original info sent by the client

## Client Integration

Include the provided JavaScript (`frontend/main.js`) in your web application to automatically collect and send device information.

- You can reference the JavaScript file directly from the server:
  ```html
  <script src="http://your-server-addr:5000/main.js"></script>
  ```

- Or use the `main.js` file as a local file:
  ```html
  <script src="js/main.js"></script>
  ```

## Important Notes

- **Change the `API_URLS` list in the `frontend/main.js` (in line 2) to your publicly accessible server/domain URL.**
- **`backend/main.py` currently allows all origins via `ORIGINS = ["*"]` for simplicity. This is suitable for development but not recommended for production. To restrict access, replace `"*"` with a list of trusted domains (e.g., `["https://abc.com"]`) (in line 12).**

## Notes

- The server handles CORS for cross-origin requests
- Waitress is used as the production WSGI server
- No data validation is performed on incoming requests
- Files are overwritten if same timestamp occurs (unlikely with microsecond precision)

