# -*- coding: utf-8 -*-
"""
Week 09 期中整合實戰：端到端 ERP 核心流程自動化管線
學生姓名：__________   學號：__________
"""
import json

def run_end_to_end_pipeline():
    print("=== [期中實戰] 啟動 ERP 端到端自動化管線 ===")
    order = {"order_id": "SO-MIDTERM-01", "sku": "BIKE-001", "order_qty": 150}
    current_inventory = 30
    atp_shortage = max(0, order["order_qty"] - current_inventory)
    
    bom_ratio = {"FRAME": 1, "WHEEL": 2, "CHAIN": 1}
    required_materials = {part: atp_shortage * ratio for part, ratio in bom_ratio.items()}
    
    pr_orders = [
        {"pr_id": f"PR-{part}-MID", "sku": part, "purchase_qty": qty, "lead_time_days": 7}
        for part, qty in required_materials.items()
    ]
    
    log = {
        "status": "PIPELINE_SUCCESS",
        "sales_order": order,
        "atp_shortage": atp_shortage,
        "bom_exploded": required_materials,
        "generated_purchase_requisitions": pr_orders
    }
    
    with open("end_to_end_pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
    print("[OK] 期中整合管線執行完成！輸出 end_to_end_pipeline_log.json")

if __name__ == "__main__":
    run_end_to_end_pipeline()
