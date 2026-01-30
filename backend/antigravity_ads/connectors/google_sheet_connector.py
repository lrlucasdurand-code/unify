import os
import logging
from typing import Dict, Any
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from .sales_connector import SalesConnector

logger = logging.getLogger(__name__)

# Scopes needed for reading spreadsheets
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']


class GoogleSheetConnector(SalesConnector):
    """
    Fetches performance data from a Google Sheet using a Service Account.
    Each client gets their own unique spreadsheet (copied from template).
    The service account has access to all client sheets it creates.
    """

    def __init__(self, config: Dict[str, Any]):
        self.spreadsheet_id = config.get("spreadsheet_id")
        self.range_name = config.get("range_name", "Sheet1!A2:C")

        # Service account path - relative to backend root
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.service_account_path = config.get("service_account_path", os.path.join(base_path, "service_account.json"))

        self._service = None

    def _get_service(self):
        """Get or create Google Sheets API service using service account."""
        if self._service:
            return self._service

        if not os.path.exists(self.service_account_path):
            raise FileNotFoundError(
                f"Service account file not found at {self.service_account_path}. "
                "Please download it from Google Cloud Console > IAM > Service Accounts."
            )

        creds = Credentials.from_service_account_file(self.service_account_path, scopes=SCOPES)
        self._service = build('sheets', 'v4', credentials=creds)
        return self._service

    def get_performance_data(self) -> Dict[str, Any]:
        """
        Reads the sheet and converts it to the standard format.
        Supports transposed structure (Campaigns in columns) and Global Cap.
        """
        logger.info(f"[GoogleSheetConnector] Reading data from Sheet ID: {self.spreadsheet_id}")

        if not self.spreadsheet_id:
            logger.warning("[GoogleSheetConnector] No spreadsheet_id configured, returning empty data")
            return {"campaigns": {}, "global_cap": None, "global_cap_weekly": None}

        service = self._get_service()
        sheet = service.spreadsheets()

        data = {
            "campaigns": {},
            "global_cap": None,
            "global_cap_weekly": None
        }

        # 1. Fetch Tab 1: Performance (Transposed)
        # Row 0 = Headers/Campaign Names
        # Row 7 = CVR Actual
        # Row 8 = CVR Objective
        try:
            result = sheet.values().get(
                spreadsheetId=self.spreadsheet_id,
                range="Feuille 1!A1:Z10"
            ).execute()
            rows = result.get('values', [])

            if len(rows) >= 9:
                campaign_names = rows[0]  # Row 0
                cvr_actuals = rows[7]     # Row 7
                cvr_objs = rows[8]        # Row 8

                # Start from index 2 based on template structure ['W1', '', 'Campaign 1...', ...]
                for i in range(2, len(campaign_names)):
                    if i >= len(cvr_actuals) or i >= len(cvr_objs):
                        break

                    c_name = campaign_names[i].strip()
                    if not c_name:
                        continue

                    try:
                        actual_val = self._parse_percentage(cvr_actuals[i])
                        obj_val = self._parse_percentage(cvr_objs[i])

                        # Generate ID from name (slug)
                        c_id = c_name.lower().replace(" ", "_")

                        data["campaigns"][c_id] = {
                            "name": c_name,
                            "actual": actual_val,
                            "objective": obj_val,
                            "metric_name": "CVR"
                        }
                    except (ValueError, IndexError):
                        continue

            logger.info(f"[GoogleSheetConnector] Found {len(data['campaigns'])} campaigns")

        except Exception as e:
            logger.error(f"[GoogleSheetConnector] Error fetching Performance Tab: {e}")

        # 2. Fetch Tab 2: Resources Sales (Global Cap)
        # Row 4: ['Nombre de leads...', '280', '1400']
        try:
            result_res = sheet.values().get(
                spreadsheetId=self.spreadsheet_id,
                range="Ressources Sales!A1:C10"
            ).execute()
            rows_res = result_res.get('values', [])

            if len(rows_res) > 4:
                row_cap = rows_res[4]
                if len(row_cap) > 1:
                    try:
                        # Daily cap (column B)
                        cap_val = float(row_cap[1].replace(',', '').replace(' ', ''))
                        data["global_cap"] = cap_val

                        # Weekly cap (column C)
                        if len(row_cap) > 2:
                            week_cap_val = float(row_cap[2].replace(',', '').replace(' ', ''))
                            data["global_cap_weekly"] = week_cap_val

                        logger.info(f"[GoogleSheetConnector] Global cap: {data['global_cap']} daily, {data['global_cap_weekly']} weekly")

                    except ValueError:
                        logger.warning("[GoogleSheetConnector] Could not parse global cap value")

        except Exception as e:
            logger.error(f"[GoogleSheetConnector] Error fetching Resources Tab: {e}")

        return data

    @staticmethod
    def _parse_percentage(val: str) -> float:
        """Parse percentage strings like '5%' or '6,30%' to float."""
        if not val:
            return 0.0
        val = val.replace('%', '').replace(',', '.').strip()
        return float(val) if val else 0.0
