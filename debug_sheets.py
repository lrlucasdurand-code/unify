import sys
import os
import yaml
import logging

# Setup logging to see everything
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Add parent dir to path
sys.path.append(os.getcwd())

from backend.antigravity_ads.connectors.google_sheet_connector import GoogleSheetConnector

def load_config(path: str = "backend/antigravity_ads/config/settings.yaml"):
    try:
        with open(path, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print(f"ERROR: Config file not found at {path}")
        return {}

def main():
    print("--- STARTING RAW DEBUG ---")
    config = load_config()
    sheet_config = config.get("google_sheets", {})
    spreadsheet_id = sheet_config.get("spreadsheet_id")
    
    token_path = "token.json"
    
    if not os.path.exists(token_path):
        print("ERROR: token.json not found")
        return

    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    
    creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/spreadsheets.readonly'])
    service = build('sheets', 'v4', credentials=creds)
    sheet = service.spreadsheets()
    
    # 1. Fetch Tab 1 (Performance)
    print(f"\n--- FETCHING TAB 1: Feuille 1 ---")
    try:
        result = sheet.values().get(spreadsheetId=spreadsheet_id, range="Feuille 1!A1:Z20").execute()
        rows = result.get('values', [])
        for i, row in enumerate(rows):
            print(f"Row {i}: {row}")
    except Exception as e:
        print(f"Error fetching Tab 1: {e}")

    # 2. Fetch Tab 2 (Ressources Sales)
    print(f"\n--- FETCHING TAB 2: Ressources Sales ---")
    try:
        result = sheet.values().get(spreadsheetId=spreadsheet_id, range="Ressources Sales!A1:Z20").execute()
        rows = result.get('values', [])
        for i, row in enumerate(rows):
            print(f"Row {i}: {row}")
    except Exception as e:
        print(f"Error fetching Tab 2: {e}")

if __name__ == "__main__":
    main()
