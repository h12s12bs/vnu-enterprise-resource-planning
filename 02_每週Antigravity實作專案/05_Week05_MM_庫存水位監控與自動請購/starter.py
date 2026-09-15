# -*- coding: utf-8 -*-
"""
Week 05 實作任務：ROP 再訂購點監控與自動開立請購單 (PR)
學生姓名：__________   學號：__________
"""
import json

def check_rop_and_generate_pr(stock_file="sample_data.json"):
    with open(stock_file, "r", encoding="utf-8") as f:
        materials = json.load(f)
        
    pr_list = []
    for mat in materials:
        sku = mat["sku"]
        name = mat["name"]
        current_stock = mat["current_stock"]
        daily_usage = mat["daily_usage"]
        lead_time_days = mat["lead_time_days"]
        safety_stock = mat["safety_stock"]
        eoq = mat["economic_order_qty"]
        
        rop = (daily_usage * lead_time_days) + safety_stock
        
        if current_stock <= rop:
            pr_qty = eoq
            pr_list.append({
                "pr_id": f"PR-{sku}-2026",
                "sku": sku,
                "name": name,
                "current_stock": current_stock,
                "rop_threshold": rop,
                "suggested_purchase_qty": pr_qty,
                "urgency": "HIGH" if current_stock < safety_stock else "NORMAL"
            })
            
    output = {
        "alert_count": len(pr_list),
        "purchase_requisitions": pr_list
    }
    
    with open("generated_pr_orders.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 庫存掃描完畢！共觸發 {len(pr_list)} 筆自動請購單。")

if __name__ == "__main__":
    check_rop_and_generate_pr()
