# -*- coding: utf-8 -*-
"""
Week 03 實作任務：ATP (可承諾量) 演算法與交期試算
學生姓名：__________   學號：__________
"""
import json

def calculate_atp(data_path="sample_data.json"):
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    on_hand = data["on_hand_stock"]
    safety_stock = data["safety_stock"]
    periods = data["periods"]
    
    results = []
    current_inventory = on_hand
    
    for idx, p in enumerate(periods):
        planned_receipt = p.get("planned_receipt", 0)
        committed_orders = p.get("committed_orders", 0)
        
        atp = (current_inventory + planned_receipt) - committed_orders - (safety_stock if idx == 0 else 0)
        atp = max(0, atp)
        current_inventory = current_inventory + planned_receipt - committed_orders
        
        results.append({
            "period": p["period"],
            "planned_receipt": planned_receipt,
            "committed_orders": committed_orders,
            "calculated_atp": atp,
            "ending_inventory": current_inventory
        })
        
    output = {
        "initial_on_hand": on_hand,
        "safety_stock": safety_stock,
        "period_atp_analysis": results
    }
    
    with open("atp_result.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("[OK] ATP 計算完畢！已產出 atp_result.json")

if __name__ == "__main__":
    calculate_atp()
