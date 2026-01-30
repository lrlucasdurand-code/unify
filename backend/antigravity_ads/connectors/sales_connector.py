import random
from typing import Dict, List, Optional

class SalesConnector:
    """Abstract base class for fetching sales data."""
    def get_performance_data(self) -> Dict[str, Dict[str, float]]:
        """
        Returns a dictionary mapping campaign/team IDs to performance metrics.
        Format:
        {
            "team_alpha": {"actual": 15000.0, "objective": 10000.0},
            "team_beta": {"actual": 5000.0, "objective": 8000.0}
        }
        """
        raise NotImplementedError

class MockSalesConnector(SalesConnector):
    """Mock implementation returning random sales performance data."""
    def get_performance_data(self) -> Dict[str, Dict[str, float]]:
        print("[MockSalesConnector] Fetching mock sales data...")
        return {
            "campaign_1": {"actual": 12500.0, "objective": 10000.0}, # Overperforming
            "campaign_2": {"actual": 7000.0, "objective": 10000.0},  # Underperforming
            "campaign_3": {"actual": 10500.0, "objective": 10000.0}  # On track
        }
