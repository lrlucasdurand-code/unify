
import logging
from typing import Dict, Any
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.campaign import Campaign
from .ad_connector import AdPlatformConnector

logger = logging.getLogger(__name__)

class MetaAdsConnector(AdPlatformConnector):
    """
    Real integration with Meta (Facebook) Ads Marketing API.
    Supports a 'Dry Run' mode to simulate writes without spending money.
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__("meta", config)
        self.access_token = config.get("access_token")
        self.ad_account_id = config.get("ad_account_id")
        self.app_id = config.get("app_id")
        self.app_secret = config.get("app_secret")
        self.dry_run = config.get("dry_run", True) # SAFETY DEFAULT
        
        self.api = None
        if self.access_token and self.ad_account_id:
            try:
                self.api = FacebookAdsApi.init(self.app_id, self.app_secret, self.access_token)
                logger.info(f"Meta Ads System Initialized for Account {self.ad_account_id} (Dry Run: {self.dry_run})")
            except Exception as e:
                logger.error(f"Failed to init Meta API: {e}")

    def get_campaigns(self) -> Dict[str, Any]:
        """
        Fetches active campaigns from Meta.
        """
        if not self.api:
            logger.warning("Meta API not initialized. Missing credentials.")
            return {}

        logger.info(f"Fetching campaigns from Meta Account {self.ad_account_id}...")
        
        try:
            account = AdAccount(self.ad_account_id)
            # Fetch Campaigns with insights or budget info
            # Fields: name, id, daily_budget, status
            fields = [
                Campaign.Field.name,
                Campaign.Field.id,
                Campaign.Field.daily_budget,
                Campaign.Field.status,
                Campaign.Field.objective
            ]
            params = {
                'effective_status': ['ACTIVE'],
                'limit': 50
            }
            
            remote_campaigns = account.get_campaigns(fields=fields, params=params)
            
            results = {}
            for cmp in remote_campaigns:
                # Meta returns budget in cents (usually), check currency. 
                # Assuming Account Currency matches user expectation (e.g. EUR/USD)
                # daily_budget is in 'cents' (e.g. 1000 = 10.00)
                
                budget_cents = int(cmp.get(Campaign.Field.daily_budget, 0))
                budget_human = budget_cents / 100.0
                
                c_id = cmp[Campaign.Field.id]
                c_name = cmp[Campaign.Field.name]
                
                results[c_id] = {
                    "name": c_name,
                    "daily_budget": budget_human,
                    "status": cmp[Campaign.Field.status],
                    "platform_id": c_id # Keep track of real ID
                }
                
            return results
            
        except Exception as e:
            logger.error(f"Error fetching Meta campaigns: {e}")
            return {}

    def update_budget(self, campaign_id: str, new_budget: float) -> bool:
        """
        Updates the daily budget for a specific campaign.
        If DRY_RUN is True, only logs the intent.
        """
        if not self.api:
            return False
            
        # Safety Check: Convert human budget back to cents
        new_budget_cents = int(new_budget * 100)
        
        logger.info(f"REQUEST: Update Campaign {campaign_id} to {new_budget} (currency units)")
        
        if self.dry_run:
            logger.info(f"[DRY RUN] Would execute: Campaign({campaign_id}).api_update(daily_budget={new_budget_cents})")
            return True # Pretend it worked
            
        try:
            campaign = Campaign(campaign_id)
            campaign.api_update(params={
                Campaign.Field.daily_budget: new_budget_cents
            })
            logger.info(f"SUCCESS: Updated Campaign {campaign_id} to {new_budget}")
            return True
        except Exception as e:
            logger.error(f"FAILED to update campaign {campaign_id}: {e}")
            return False
