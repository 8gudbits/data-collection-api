from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from waitress import serve

import json
import os


# Configure CORS origins as needed
# Allow all origins for simplicity; adjust for production use
ORIGINS = ["*"]


class DataCollectionAPI:
    def __init__(self, host="0.0.0.0", port=5000, data_dir="collected_data", cors_origins=ORIGINS):
        self.app = Flask(__name__)
        CORS(self.app, origins=cors_origins)
        self.host = host
        self.port = port
        self.data_dir = data_dir
        self._setup_routes()
        self._ensure_data_dir()

    def _ensure_data_dir(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)

    def _save_to_file(self, data):
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            filename = f"data_{timestamp}.json"
            filepath = os.path.join(self.data_dir, filename)

            data_with_metadata = {
                "received_at": datetime.now().isoformat(),
                "data": data,
            }

            with open(filepath, "w") as f:
                json.dump(data_with_metadata, f, indent=2)

            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Data saved to: {filepath}")

        except Exception as e:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Failed to save data: {e}")

    def _setup_routes(self):
        @self.app.route("/api", methods=["POST"])
        def receive_visitor_data():
            data = request.get_json()
            if not data:
                return jsonify({"status": "error", "message": "Invalid or empty JSON"}), 400
            self._save_to_file(data)
            return jsonify({"status": "ok"}), 200

        @self.app.route("/main.js")
        def serve_main_js():
            """Serve the frontend main.js file"""
            try:
                frontend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "main.js")
                return send_file(frontend_path, mimetype="application/javascript")
            except Exception as e:
                print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Failed to serve main.js: {e}")
                return jsonify({"status": "error", "message": "File not found"}), 404

    def run(self):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file_count = len(os.listdir(self.data_dir))
        print(f"[{now}] Starting DataCollectionAPI on \"http://{self.host}:{self.port}/api\"")
        print(f"[{now}] Data directory: {self.data_dir} ({file_count} files)")
        print(f"[{now}] Serving main.js on \"http://{self.host}:{self.port}/main.js\"")
        serve(self.app, host=self.host, port=self.port)


if __name__ == "__main__":
    server = DataCollectionAPI()
    server.run()

