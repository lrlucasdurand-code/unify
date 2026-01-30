export type CampaignMetrics = {
    actual: number;
    objective: number;
    name?: string; // "Currency" or "CVR"
};

export type BudgetRecommendation = {
    action: "INCREASE" | "DECREASE" | "MAINTAIN";
    multiplier: number;
    reason: string;
};

export type Campaign = {
    id: string;
    name: string;
    metrics: CampaignMetrics;
    budget_recommendation: BudgetRecommendation;
    current_budget: number;
};
