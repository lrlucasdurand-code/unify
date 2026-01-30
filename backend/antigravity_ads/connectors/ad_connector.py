from typing import Dict, Any

class AdPlatformConnector:
    """Abstract base class for Ad Platforms."""
    
    def __init__(self, platform_name: str, config: Dict[str, Any]):
        self.platform_name = platform_name
        self.config = config

    def get_campaigns(self) -> Dict[str, Any]:
        """Fetches active campaigns and their current budgets."""
        raise NotImplementedError

    def update_budget(self, campaign_id: str, new_budget: float) -> bool:
        """Updates the budget for a specific campaign."""
        raise NotImplementedError

class MockAdConnector(AdPlatformConnector):
    """Mock implementation of an Ad Platform."""
    
    def __init__(self, platform_name: str = "mock_platform", config: Dict[str, Any] = None):
        super().__init__(platform_name, config or {})
        # Simulating initial state
        self._campaigns = {
            "campaign_1": {"name": "Alpha Launch", "daily_budget": 100.0, "status": "ACTIVE"},
            "campaign_2": {"name": "Beta Test", "daily_budget": 200.0, "status": "ACTIVE"},
            "campaign_3": {"name": "Charlie Promo", "daily_budget": 150.0, "status": "ACTIVE"},
        }

    def get_campaigns(self) -> Dict[str, Any]:
        print(f"[{self.platform_name}] Fetching campaigns...")
        return self._campaigns

    def update_budget(self, campaign_id: str, new_budget: float) -> bool:
        if campaign_id in self._campaigns:
            old_budget = self._campaigns[campaign_id]["daily_budget"]
            print(f"[{self.platform_name}] UPDATING BUDGET for {campaign_id}: {old_budget} -> {new_budget}")
            self._campaigns[campaign_id]["daily_budget"] = new_budget
            return True
        return False
