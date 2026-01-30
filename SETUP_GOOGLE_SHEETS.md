# How to Setup Google Sheets Integration

To allow the automation to read your Google Sheet, you need to set up Google Cloud credentials.

## Step 1: Create the Google Sheet
1. Create a new Google Sheet.
2. In the first row, create headers: `Campaign ID`, `Actual Sales`, `Objective`.
3. Add some data:
   ```
   campaign_1, 15000, 10000
   campaign_2, 5000, 8000
   ```
4. Copy the **Spreadsheet ID** from the URL (the long string between `/d/` and `/edit`).
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFM.../edit` -> ID is `1BxiMVs0XRA5nFM...`
5. Paste this ID into `backend/antigravity_ads/config/settings.yaml` under `spreadsheet_id`.

## Step 2: Get Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Antigravity Ads").
3. Enable the **Google Sheets API**.
4. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - You may need to configure the "OAuth consent screen" first (select "External" and fill required fields).
   - Application type: **Desktop app**.
5. Download the JSON file and rename it to `credentials.json`.
6. Place `credentials.json` in the root folder (`/Users/lucas/Antigravity_Unify/`).

## Step 3: Run the Script (Backend Authentication)
1. Open your terminal in the project root: `/Users/lucas/Antigravity_Unify`.
2. Activate the virtual environment: `source venv/bin/activate`.
3. Run the backend server to trigger authentication:
   ```bash
   uvicorn backend.app.main:app --reload
   ```
4. Open your browser at `http://localhost:8000/api/campaigns`.
5. This will trigger the Google Login flow. Allow access.
6. A `token.json` file will be created automatically.

## Troubleshooting

### "Access blocked: App has not completed the Google verification process"
This error happens because your Google Cloud project is in "Testing" mode and you haven't authorized your email address.

**Fix:**
1. Go to [Google Cloud Console > APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).
2. Look for the **"Test users"** section (usually scroll down).
3. Click **+ ADD USERS**.
4. Enter your own email address (the one you are trying to log in with).
5. Click **Save**.
6. Try logging in again.
