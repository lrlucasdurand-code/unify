import yaml
import logging
from antigravity_ads.connectors.sales_connector import MockSalesConnector
from antigravity_ads.connectors.google_sheet_connector import GoogleSheetConnector
from antigravity_ads.connectors.ad_connector import MockAdConnector
from antigravity_ads.engine.rules import BudgetOptimizer

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_config(path: str = "antigravity_ads/config/settings.yaml"):
    try:
        with open(path, 'r') as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        logger.error(f"Config file not found at {path}")
        return {}

def main():
    logger.info("Starting Antigravity Ads Automation...")
    config = load_config()
    
    # Initialize components
    sales_source_type = config.get("sales_source_type", "mock")
    
    if sales_source_type == "google_sheets":
        logger.info("Using Google Sheets Sales Connector")
        sales_connector = GoogleSheetConnector(config.get("google_sheets", {}))
    else:
        logger.info("Using Mock Sales Connector")
        sales_connector = MockSalesConnector()
        
    ad_connector = MockAdConnector(platform_name="Meta Ads (Mock)", config=config)
    optimizer = BudgetOptimizer(config)
    
    # 1. Fetch Sales Data
    logger.info("Fetching Sales Data...")
    sales_data = sales_connector.get_performance_data()
    
    # 2. Fetch Ad Campaigns
    logger.info("Fetching Ad Campaigns...")
    campaigns = ad_connector.get_campaigns()
    
    # 3. Optimize Budgets
    logger.info("Running Optimization Logic...")
    
    # For MVP, we assume a simple 1:1 mapping between Sales Campaigns and Ad Campaigns by ID
    # In real world, this might need a mapping table
    for campaign_id, s_data in sales_data.items():
        if campaign_id not in campaigns:
            logger.warning(f"Sales data found for {campaign_id} but no matching ad campaign.")
            continue
            
        decision = optimizer.calculate_adjustment(s_data)
        current_campaign = campaigns[campaign_id]
        
        logger.info(f"Campaign: {current_campaign['name']} "
                    f"| Performance: {s_data['actual']}/{s_data['objective']} "
                    f"| Decision: {decision['action']} ({decision['reason']})")
        
        if decision['action'] != "MAINTAIN":
            new_budget = current_campaign['daily_budget'] * decision['multiplier']
            if config.get("dry_run", True):
                logger.info(f"[DRY RUN] Would update budget from {current_campaign['daily_budget']} to {new_budget:.2f}")
            else:
                ad_connector.update_budget(campaign_id, new_budget)

    logger.info("Automation run complete.")

if __name__ == "__main__":
    main()
