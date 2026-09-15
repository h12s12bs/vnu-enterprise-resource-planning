# -*- coding: utf-8 -*-
"""
Week 08 實作任務：MRP 物料需求九宮格淨需求推導
學生姓名：__________   學號：__________
"""
import json

def calculate_mrp(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        params = json.load(f)
        
    lead_time = params["lead_time_periods"]
    lot_size = params["lot_size"]
    periods = params["periods"]
    current_stock = params["initial_stock"]
    
    mrp_table = []
    for idx, p in enumerate(periods):
        gross_req = p["gross_requirements"]
        scheduled_receipt = p["scheduled_receipts"]
        available = current_stock + scheduled_receipt
        net_req = max(0, gross_req - available)
        
        planned_order_receipt = 0
        if net_req > 0:
            planned_order_receipt = ((net_req + lot_size - 1) // lot_size) * lot_size
            
        current_stock = available + planned_order_receipt - gross_req
        
        mrp_table.append({
            "period": idx + 1,
            "gross_req": gross_req,
            "scheduled_receipt": scheduled_receipt,
            "projected_on_hand": current_stock,
            "net_req": net_req,
            "planned_order_receipt": planned_order_receipt,
            "planned_order_release_period": max(1, idx + 1 - lead_time) if planned_order_receipt > 0 else None
        })
        
    with open("mrp_schedule_output.json", "w", encoding="utf-8") as f:
        json.dump({"sku": params["sku"], "mrp_grid": mrp_table}, f, ensure_ascii=False, indent=2)
    print(f"[OK] MRP 九宮格推導完畢！輸出 mrp_schedule_output.json")

if __name__ == "__main__":
    calculate_mrp()
