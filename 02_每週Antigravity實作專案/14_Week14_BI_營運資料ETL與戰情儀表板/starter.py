# -*- coding: utf-8 -*-
"""
Week 14 實作任務：BI 商業智慧 ETL 與高階經營戰情指標計算
學生姓名：__________   學號：__________
"""
import json

def run_bi_etl_pipeline(data_file="sample_data.json"):
    with open(data_file, "r", encoding="utf-8") as f:
        raw = json.load(f)
        
    sales = raw["sales_orders"]
    inventory = raw["inventory_snapshots"]
    
    total_revenue = sum(s["revenue"] for s in sales)
    total_cost = sum(s["cost"] for s in sales)
    gross_profit = total_revenue - total_cost
    gross_margin_pct = round((gross_profit / total_revenue) * 100, 2) if total_revenue > 0 else 0
    
    on_time_count = sum(1 for s in sales if s.get("actual_delivery_date") <= s.get("promise_delivery_date"))
    otd_rate = round((on_time_count / len(sales)) * 100, 2)
    
    slow_moving_items = [item for item in inventory if item.get("days_in_warehouse", 0) > 90]
    
    dashboard = {
        "kpi_metrics": {
            "total_revenue": total_revenue,
            "total_gross_profit": gross_profit,
            "gross_margin_percentage": f"{gross_margin_pct}%",
            "on_time_delivery_rate": f"{otd_rate}%",
            "slow_moving_skus_count": len(slow_moving_items)
        },
        "slow_moving_alerts": slow_moving_items
    }
    
    with open("executive_dashboard_kpis.json", "w", encoding="utf-8") as f:
        json.dump(dashboard, f, ensure_ascii=False, indent=2)
    print(f"[OK] BI ETL 執行完畢！營收: ${total_revenue:,}，毛利率: {gross_margin_pct}%，達交率: {otd_rate}%")

if __name__ == "__main__":
    run_bi_etl_pipeline()
