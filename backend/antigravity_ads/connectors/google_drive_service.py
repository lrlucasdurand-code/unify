import os
import logging
from typing import Optional
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

# Template spreadsheet ID (the master template all clients copy from)
TEMPLATE_SPREADSHEET_ID = "1-nQ74vat4JXexflJdjQlMOIgymQHyvTMjLrBkdZXIGo"

# Scopes needed for copying files
SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
]


class GoogleDriveService:
    """
    Service to manage Google Drive operations like copying templates.
    Uses a Service Account for server-to-server authentication.
    """

    def __init__(self, credentials_path: str = "service_account.json"):
        self.credentials_path = credentials_path
        self._drive_service = None
        self._sheets_service = None

    def _get_credentials(self) -> Credentials:
        """Load service account credentials."""
        if not os.path.exists(self.credentials_path):
            raise FileNotFoundError(
                f"Service account file not found at {self.credentials_path}. "
                "Please download it from Google Cloud Console > IAM > Service Accounts."
            )
        return Credentials.from_service_account_file(self.credentials_path, scopes=SCOPES)

    def _get_drive_service(self):
        """Get or create Google Drive API service."""
        if not self._drive_service:
            creds = self._get_credentials()
            self._drive_service = build('drive', 'v3', credentials=creds)
        return self._drive_service

    def _get_sheets_service(self):
        """Get or create Google Sheets API service."""
        if not self._sheets_service:
            creds = self._get_credentials()
            self._sheets_service = build('sheets', 'v4', credentials=creds)
        return self._sheets_service

    def copy_template(self, client_name: str, client_email: Optional[str] = None, folder_id: Optional[str] = None) -> dict:
        """
        Copy the template spreadsheet for a new client.

        Args:
            client_name: Name of the client (used in the new spreadsheet title)
            client_email: Optional email to share the new spreadsheet with
            folder_id: Optional ID of the parent folder to create the file in (to use owner's quota)

        Returns:
            dict with 'spreadsheet_id' and 'spreadsheet_url'
        """
        drive = self._get_drive_service()

        # 1. Copy the template
        new_title = f"Antigravity - {client_name}"
        copy_metadata = {'name': new_title}
        
        if folder_id:
            copy_metadata['parents'] = [folder_id]

        try:
            copied_file = drive.files().copy(
                fileId=TEMPLATE_SPREADSHEET_ID,
                body=copy_metadata,
                supportsAllDrives=True
            ).execute()

            spreadsheet_id = copied_file.get('id')
            spreadsheet_url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"

            logger.info(f"Created new spreadsheet: {new_title} (ID: {spreadsheet_id})")

            # 2. Permissions Management
            if client_email:
                # Share with specific user
                self._share_with_user(spreadsheet_id, client_email)
            else:
                # Fallback: Make it accessible to anyone with the link (Writer)
                # This ensures the user who clicked the button can actually open it
                self._share_publicly(spreadsheet_id)

            return {
                "spreadsheet_id": spreadsheet_id,
                "spreadsheet_url": spreadsheet_url,
                "title": new_title
            }

        except Exception as e:
            logger.error(f"Error copying template: {e}")
            raise

    def _share_with_user(self, file_id: str, email: str, role: str = "writer"):
        """
        Share a file with a specific user.
        """
        drive = self._get_drive_service()

        permission = {
            'type': 'user',
            'role': role,
            'emailAddress': email
        }

        try:
            drive.permissions().create(
                fileId=file_id,
                body=permission,
                sendNotificationEmail=True
            ).execute()
            logger.info(f"Shared spreadsheet {file_id} with {email} as {role}")
        except Exception as e:
            logger.warning(f"Could not share with {email}: {e}")

    def _share_publicly(self, file_id: str, role: str = "writer"):
        """
        Make a file accessible to anyone with the link.
        """
        drive = self._get_drive_service()
        
        permission = {
            'type': 'anyone',
            'role': role
        }
        
        try:
            drive.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
            logger.info(f"Shared spreadsheet {file_id} with anyone as {role}")
        except Exception as e:
             logger.warning(f"Could not share publicly: {e}")

    def get_service_account_email(self) -> Optional[str]:
        """Get the service account email for display to users."""
        try:
            creds = self._get_credentials()
            return creds.service_account_email
        except Exception:
            return None
