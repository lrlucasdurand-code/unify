from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sys
import os
import stripe
from dotenv import load_dotenv

# Load environment variables from .env file
# Load environment variables from .env file
base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(base_path, '.env')
load_dotenv(dotenv_path=env_path)

# Configure Stripe with API key from environment
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

# Add the parent directory to sys.path to import antigravity_ads
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from antigravity_ads.connectors.sales_connector import MockSalesConnector
from antigravity_ads.connectors.google_sheet_connector import GoogleSheetConnector
from antigravity_ads.connectors.ad_connector import MockAdConnector
from antigravity_ads.connectors.google_drive_service import GoogleDriveService
from antigravity_ads.engine.rules import BudgetOptimizer
import yaml

app = FastAPI(title="Antigravity Ads API")

from fastapi.middleware.cors import CORSMiddleware

# Get allowed origins from environment variable, default to "*" if not set
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select
from app.database import create_db_and_tables, get_session, engine
from app.models import User, Token, Organization
from app.auth import verify_password, create_access_token, get_password_hash
from datetime import timedelta

# --- Auth & Dependencies ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    from jose import jwt, JWTError
    from app.auth import SECRET_KEY, ALGORITHM
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if user is None:
        raise credentials_exception
    return user

# --- Data Models ---

class GoogleSheetsConfig(BaseModel):
    spreadsheet_id: str
    range_name: str
    drive_folder_id: Optional[str] = None

class AdPlatformConfig(BaseModel):
    enabled: bool
    access_token: Optional[str] = ""
    ad_account_id: Optional[str] = ""
    app_id: Optional[str] = ""
    app_secret: Optional[str] = ""
    dry_run: Optional[bool] = True

class AdPlatforms(BaseModel):
    meta: AdPlatformConfig
    google: AdPlatformConfig
    snap: AdPlatformConfig
    tiktok: Optional[AdPlatformConfig] = None

class CRMConfig(BaseModel):
    enabled: bool

class CRMProviders(BaseModel):
    hubspot: Optional[CRMConfig] = None
    salesforce: Optional[CRMConfig] = None
    pipedrive: Optional[CRMConfig] = None

class BotSettings(BaseModel):
    global_budget_cap: int = 5000
    target_roas: float = 2.5
    optimization_frequency: str = "daily"
    auto_scaling_enabled: bool = True

class BillingConfig(BaseModel):
    current_plan: str = "free"
    status: str = "inactive"

class ConfigModel(BaseModel):
    sales_source_type: str
    google_sheets: GoogleSheetsConfig
    ad_platforms: AdPlatforms
    crm: Optional[CRMProviders] = None
    bot_settings: Optional[BotSettings] = None
    billing: Optional[BillingConfig] = None
    custom_integrations: List[dict] = []

# --- Configuration & Helpers (DB Based) ---

def load_config_from_db(user: User):
    """
    Constructs the config dictionary from the User's Organization in DB.
    Fallback to settings.yaml is removed/deprecated for SaaS mode.
    """
    if not user.organization:
        return {}
    
    org = user.organization
    
    # 1. Base Config Structure
    config = {
        "sales_source_type": "google_sheets" if org.google_sheet_id else "mock",
        "google_sheets": {
            "spreadsheet_id": org.google_sheet_id or "",
            "range_name": "Feuille 1!A2:C",
            "drive_folder_id": org.drive_folder_id
        },
        "ad_platforms": {
            "meta": {"enabled": False}, # Defaults, to be expanded with Integration Table
            "google": {"enabled": False},
            "snap": {"enabled": False}
        },
        "billing": {
            "current_plan": org.plan or "free",
            "status": "active"
        }
    }
    
    # Check Integrations Table (Not fully implemented in UI yet, but structure is ready)
    if org.integrations:
        for integration in org.integrations:
            if integration.provider in config["ad_platforms"]:
                config["ad_platforms"][integration.provider] = {
                    "enabled": integration.is_enabled,
                    **integration.credentials
                }
                
    return config

def get_connectors(config):
    sales_source_type = config.get("sales_source_type", "mock")
    if sales_source_type == "google_sheets":
        sales_connector = GoogleSheetConnector(config.get("google_sheets", {}))
    else:
        sales_connector = MockSalesConnector()
    
    from antigravity_ads.connectors.meta_connector import MetaAdsConnector
    
    # Ad Connector Logic
    meta_config = config.get("ad_platforms", {}).get("meta", {})
    if meta_config.get("enabled") and meta_config.get("access_token") and meta_config.get("ad_account_id"):
         ad_connector = MetaAdsConnector(meta_config)
    else:
         ad_connector = MockAdConnector(platform_name="Meta Ads (Mock)", config=config)
         
    return sales_connector, ad_connector

# --- Endpoints ---

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60 * 24)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    company_name: str

@app.post("/register", response_model=Token)
def register_user(user_in: UserRegister, session: Session = Depends(get_session)):
    # 1. Check if user exists
    existing_user = session.exec(select(User).where(User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # 2. Create Organization (Free Tier)
    org = Organization(name=user_in.company_name)
    session.add(org)
    session.commit()
    session.refresh(org)
    
    # 3. Create User
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        organization_id=org.id,
        is_superuser=False,
        role="user"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # 4. Generate Token
    access_token_expires = timedelta(minutes=60 * 24)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    config = load_config_from_db(current_user)
    plan = config.get("billing", {}).get("current_plan", "free")
    
    return {
        "email": current_user.email,
        "role": "admin" if current_user.is_superuser else current_user.role,
        "organization": current_user.organization.name if current_user.organization else None,
        "plan": plan
    }

@app.get("/api/config")
def get_config(current_user: User = Depends(get_current_user)):
    return load_config_from_db(current_user)

@app.post("/api/config")
def update_config(new_config: ConfigModel, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Update Organization in DB
    if not current_user.organization:
        raise HTTPException(status_code=400, detail="User has no organization")
    
    org = current_user.organization
    
    # Update Sheet Config
    org.google_sheet_id = new_config.google_sheets.spreadsheet_id
    org.drive_folder_id = new_config.google_sheets.drive_folder_id
    
    session.add(org)
    session.commit()
    session.refresh(org)
    
    return {"status": "updated", "config": load_config_from_db(current_user)}

@app.get("/api/campaigns")
def get_campaigns(current_user: User = Depends(get_current_user)):
    config = load_config_from_db(current_user)
    sales_connector, ad_connector = get_connectors(config)
    optimizer = BudgetOptimizer(config)
    
    # 1. Fetch Data
    sales_payload = sales_connector.get_performance_data()
    
    # Handle Polymorphism
    if "campaigns" in sales_payload:
        sales_data = sales_payload["campaigns"]
        global_cap = sales_payload.get("global_cap")
    else:
        sales_data = sales_payload
        global_cap = None
        
    ad_campaigns = ad_connector.get_campaigns()
    
    results = []
    
    # Global Capacity Logic
    total_leads_current = 0
    if global_cap:
        for cid, a_data in ad_campaigns.items():
            budget = a_data.get("daily_budget", 50)
            total_leads_current += (budget / 20.0) 
            
        global_scaling_factor = 1.0
        if total_leads_current > 0 and global_cap > 0:
            if total_leads_current > global_cap:
                global_scaling_factor = global_cap / total_leads_current
    else:
        global_scaling_factor = 1.0

    # Merge Data
    all_campaign_ids = set(sales_data.keys())
    
    ad_campaigns_by_name = {}
    for cid, data in ad_campaigns.items():
        norm_name = data.get("name", "").lower().strip()
        if norm_name:
            ad_campaigns_by_name[norm_name] = data

    for cid in all_campaign_ids:
        s_data = sales_data.get(cid, {"actual": 0, "objective": 0})
        s_name = s_data.get("name", "").strip()
        s_name_norm = s_name.lower()
        
        a_data = ad_campaigns_by_name.get(s_name_norm)
        
        if not a_data:
             a_data = ad_campaigns.get(cid)

        if not a_data:
            a_data = {
                "name": s_name if s_name else f"Campaign {cid}", 
                "daily_budget": 0.0, 
                "status": "NOT_FOUND",
                "platform_id": None
            }
        
        decision = optimizer.calculate_adjustment(s_data, global_scaling_factor)
        
        # Attach Platform ID
        if a_data.get("platform_id"):
             decision["platform_id"] = a_data["platform_id"]

        results.append({
            "id": cid,
            "name": a_data.get("name"),
            "status": a_data.get("status", "ACTIVE"),
            "metrics": {
                "actual": s_data["actual"],
                "objective": s_data["objective"],
                "name": s_data.get("metric_name", "Currency")
            },
            "budget_recommendation": decision,
            "current_budget": a_data.get("daily_budget", 0)
        })
        
    return results

@app.post("/api/optimize")
def run_optimization(dry_run: bool = True, current_user: User = Depends(get_current_user)):
    return get_campaigns(current_user=current_user)

# --- Stripe Checkout ---

class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str

@app.get("/api/global-status")
def get_global_status(current_user: User = Depends(get_current_user)):
    """Returns the current global capacity vs actual usage."""
    config = load_config_from_db(current_user)
    sales_connector, ad_connector = get_connectors(config)
    
    # 1. Fetch Sales Payload
    sales_payload = sales_connector.get_performance_data()
    
    # Defaults
    if "campaigns" in sales_payload:
        global_cap_daily = sales_payload.get("global_cap")
        global_cap_weekly = sales_payload.get("global_cap_weekly")
    else:
        global_cap_daily = None
        global_cap_weekly = None

    # 2. Calculate Current Usage
    ad_campaigns = ad_connector.get_campaigns()
    total_leads_daily_current = 0
    
    for cid, a_data in ad_campaigns.items():
        budget = a_data.get("daily_budget", 0)
        total_leads_daily_current += (budget / 20.0)
        
    return {
        "daily": {
            "cap": global_cap_daily,
            "current": total_leads_daily_current,
            "unit": "Leads/Day"
        },
        "weekly": {
            "cap": global_cap_weekly,
            "current": total_leads_daily_current * 5,
            "unit": "Leads/Week"
        }
    }

@app.post("/api/checkout")
def create_checkout_session(request: CheckoutRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe API key not configured")

    try:
        org = current_user.organization
        if not org:
             raise HTTPException(status_code=400, detail="User has no organization")

        # Get or create Stripe Customer
        customer_id = org.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=org.name,
                metadata={"organization_id": org.id}
            )
            customer_id = customer.id
            org.stripe_customer_id = customer_id
            session.add(org)
            session.commit()
            session.refresh(org)

        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[{
                "price": request.price_id,
                "quantity": 1,
            }],
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )
        return {"url": checkout_session.url, "session_id": checkout_session.id}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/billing/invoices")
def get_invoices(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Fetch invoice history from Stripe"""
    if not stripe.api_key:
        return []
    
    org = current_user.organization
    if not org or not org.stripe_customer_id:
        return []

    try:
        invoices = stripe.Invoice.list(
            customer=org.stripe_customer_id,
            limit=10
        )
        
        results = []
        for inv in invoices.data:
            # Format amount (cents to euros)
            amount = f"{inv.amount_paid / 100:.2f}€"
            # Format date
            date = datetime.datetime.fromtimestamp(inv.created).strftime("%b %d, %Y")
            
            results.append({
                "date": date,
                "amount": amount,
                "status": inv.status.capitalize(),
                "pdf_url": inv.invoice_pdf
            })
            
        return results
    except Exception as e:
        print(f"Error fetching invoices: {e}")
        return []

@app.post("/api/billing/activate")
def activate_billing(plan: str = "starter", current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """Activate billing for the current user's organization."""
    if not current_user.organization:
        raise HTTPException(status_code=400, detail="User has no organization")
        
    # Persist the plan in the Organization table
    # We need to add the 'plan' column to the Organization model if it's not there.
    # Assuming we will migrate/update the model, or for now just use a JSON field if available, 
    # BUT since we are using SQLModel, we should update the model definition strictly.
    
    # For this MVP step, we will assume the plan is stored in the `billing_info` JSON/dict 
    # OR we add a column. Let's add a column to Organization model in models.py first.
    # But here, let's just update the backend to EXPECT the column to exist 
    # and we will fix the model in the next step.
    
    org = current_user.organization
    org.plan = plan
    session.add(org)
    session.commit()
    session.refresh(org)
    
    return {"status": "activated", "plan": plan}

# --- Google Sheets Template ---

class CreateSheetRequest(BaseModel):
    client_name: str
    client_email: Optional[str] = None

@app.post("/api/sheets/create")
def create_client_sheet(request: CreateSheetRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    """
    Create a new Google Sheet from the template for a client.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    service_account_path = os.path.join(base_path, "service_account.json")

    try:
        # Load config from DB to get folder ID
        # Note: Before sheet creation, the user might have set folder_id in config
        org = current_user.organization
        if not org:
             raise HTTPException(status_code=400, detail="No Organization found")
             
        folder_id = org.drive_folder_id
        
        drive_service = GoogleDriveService(credentials_path=service_account_path)
        result = drive_service.copy_template(
            client_name=request.client_name,
            client_email=request.client_email,
            folder_id=folder_id
        )

        # Auto-update Organization config with new spreadsheet ID
        org.google_sheet_id = result["spreadsheet_id"]
        # folder_id remains unchanged
        
        session.add(org)
        session.commit()
        session.refresh(org)

        return {
            "status": "created",
            "spreadsheet_id": result["spreadsheet_id"],
            "spreadsheet_url": result["spreadsheet_url"],
            "title": result["title"]
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create spreadsheet: {str(e)}")

@app.get("/api/sheets/service-account")
def get_service_account_email(current_user: User = Depends(get_current_user)):
    """
    Returns the service account email so the user can share the sheet with it.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    service_account_path = os.path.join(base_path, "service_account.json")

    if not os.path.exists(service_account_path):
        return {"email": None}

    try:
        import json
        with open(service_account_path, 'r') as f:
            data = json.load(f)
            return {"email": data.get("client_email")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Admin Endpoints ---

def require_admin(current_user: User = Depends(get_current_user)):
    """Dependency that requires admin/superuser access."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@app.get("/api/admin/stats")
def get_admin_stats(current_user: User = Depends(require_admin), session: Session = Depends(get_session)):
    """Get admin dashboard statistics."""
    from sqlmodel import func

    # Count organizations
    org_count = session.exec(select(func.count(Organization.id))).one()

    # Count active users
    user_count = session.exec(select(func.count(User.id)).where(User.is_active == True)).one()

    # Calculate MRR based on plans
    plan_prices = {
        "free": 0,
        "starter": 39,
        "growth": 149,
        "super": 299
    }

    orgs = session.exec(select(Organization)).all()
    mrr = sum(plan_prices.get(org.plan, 0) for org in orgs)

    return {
        "total_organizations": org_count,
        "active_users": user_count,
        "mrr": mrr
    }

@app.get("/api/admin/organizations")
def get_admin_organizations(current_user: User = Depends(require_admin), session: Session = Depends(get_session)):
    """Get all organizations with their admin users."""
    orgs = session.exec(select(Organization)).all()

    result = []
    for org in orgs:
        # Find the admin user for this org (first user or superuser)
        admin_user = None
        for user in org.users:
            if user.is_superuser or user.role == "admin":
                admin_user = user
                break
        if not admin_user and org.users:
            admin_user = org.users[0]

        result.append({
            "id": org.id,
            "name": org.name,
            "admin_email": admin_user.email if admin_user else None,
            "user_count": len(org.users),
            "plan": org.plan,
            "google_sheet_id": org.google_sheet_id,
            "drive_folder_id": org.drive_folder_id,
            "status": "active"  # Could be extended with actual status field
        })

    return result
