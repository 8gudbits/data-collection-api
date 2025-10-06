# data-collection-api

## Overview

A full-stack system for collecting device and location information from web clients, consisting of a Flask backend API and JavaScript frontend.

## Requirements

- Python 3.7+

## Installation

1. Clone the repository:
    ```bash
    git clone --depth 1 https://github.com/8gudbits/data-collection-api.git
    ```

2. Install dependencies:
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

## Data Storage

- All received data is saved as individual JSON files
- Files are stored in the `collected_data/` directory
- Filename format: `data_YYYYMMDD_HHMMSS_ffffff.json`
- Each file contains:
    - `received_at` ISO timestamp of reception
    - `data` The original info sent by the client

## Client Integration

Include the provided JavaScript code (`frontend/main.js`) in your web application to automatically collect and send device information.

- Change the `API_URLS` in the `frontend/main.js` to your publicly accessible server/domain URL

## Notes

- The server handles CORS for cross-origin requests
- Waitress is used as the production WSGI server
- No data validation is performed on incoming requests
- Files are overwritten if same timestamp occurs (unlikely with microsecond precision)

