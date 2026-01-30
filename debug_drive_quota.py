import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

SERVICE_ACCOUNT_FILE = 'backend/service_account.json'
SCOPES = ['https://www.googleapis.com/auth/drive']

def check_quota():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"File not found: {SERVICE_ACCOUNT_FILE}")
        return

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build('drive', 'v3', credentials=creds)

    # Check About info for Quota
    try:
        about = service.about().get(fields="storageQuota,user").execute()
        quota = about.get('storageQuota', {})
        user = about.get('user', {})
        
        print(f"User: {user.get('emailAddress')}")
        print(f"Limit: {quota.get('limit')}")
        print(f"Usage: {quota.get('usage')}")
        print(f"Usage In Drive: {quota.get('usageInDrive')}")
        print(f"Usage In Trash: {quota.get('usageInDriveTrash')}")

    except Exception as e:
        print(f"Error getting quota: {e}")

    # List Files
    try:
        results = service.files().list(
            pageSize=20, fields="nextPageToken, files(id, name, size, mimeType)"
        ).execute()
        items = results.get('files', [])

        print("\n--- Files in Service Account Drive ---")
        if not items:
            print("No files found.")
        else:
            for item in items:
                print(f"{item['name']} ({item['id']}) - {item.get('size', '0')} bytes")
    except Exception as e:
        print(f"Error listing files: {e}")

if __name__ == '__main__':
    check_quota()
