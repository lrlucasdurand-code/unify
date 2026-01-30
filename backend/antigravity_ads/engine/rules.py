from typing import Dict, Any

class BudgetOptimizer:
    """Core logic engine for calculating budget adjustments."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.rules = config.get("budget_rules", {})

    def calculate_adjustment(self, performance_data: Dict[str, float], global_constraint: float = 1.0) -> Dict[str, Any]:
        """
        Determines the needed budget adjustment based on CVR and Global Capacity.
        
        Args:
            performance_data: {"actual": 0.05 (CVR), "objective": 0.06 (Target)}
            global_constraint: Multiplier from Global Cap analysis (e.g. 0.9 means reduce by 10% due to capacity).
            
        Returns:
            Dict adjustment advice.
        """
        actual = performance_data.get("actual", 0.0)
        objective = performance_data.get("objective", 1.0)
        
        # 1. Performance-based Adjustment (CVR)
        perf_multiplier = 1.0
        reason_parts = []
        
        if objective > 0:
            ratio = actual / objective
            # Thresholds
            increase_thresh = self.rules.get("increase_threshold", 1.10)
            decrease_thresh = self.rules.get("decrease_threshold", 0.90)
            
            if ratio >= increase_thresh:
                perf_multiplier = 1.0 + self.rules.get("increase_percentage", 0.10)
                reason_parts.append(f"High Performance (CVR {ratio:.0%})")
            elif ratio <= decrease_thresh:
                perf_multiplier = 1.0 - self.rules.get("decrease_percentage", 0.10)
                reason_parts.append(f"Low Performance (CVR {ratio:.0%})")
            else:
                reason_parts.append("Stable Performance")
        
        # 2. Global Capacity Adjustment
        # If global_constraint < 1.0, we dampen the budget.
        # If we were going to INCREASE, we might INCREASE LESS or MAINTAIN.
        # If we were going to DECREASE, we DECREASE MORE.
        
        final_multiplier = perf_multiplier * global_constraint
        
        if global_constraint < 1.0:
            reason_parts.append(f"Global Cap Limit ({global_constraint:.0%})")
            
        # Determine Action String
        action = "MAINTAIN"
        if final_multiplier > 1.02:
            action = "INCREASE"
        elif final_multiplier < 0.98:
            action = "DECREASE"
            
        return {
            "action": action,
            "multiplier": float(f"{final_multiplier:.2f}"),
            "reason": " + ".join(reason_parts)
        }
