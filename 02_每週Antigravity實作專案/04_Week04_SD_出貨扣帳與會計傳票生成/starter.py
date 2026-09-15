# -*- coding: utf-8 -*-
"""
Week 04 實作任務：出貨扣庫存與自動生成會計分錄
學生姓名：__________   學號：__________
"""
import json

def process_delivery_and_post_gl(dn_file="sample_data.json"):
    with open(dn_file, "r", encoding="utf-8") as f:
        dn = json.load(f)
        
    order_id = dn["order_id"]
    customer = dn["customer"]
    items = dn["items"]
    
    total_sales_amount = 0
    total_cost_amount = 0
    inventory_deductions = []
    
    for item in items:
        qty = item["qty"]
        unit_price = item["unit_price"]
        unit_cost = item["unit_cost"]
        line_sales = qty * unit_price
        line_cost = qty * unit_cost
        total_sales_amount += line_sales
        total_cost_amount += line_cost
        
        inventory_deductions.append({
            "sku": item["sku"],
            "deduct_qty": qty,
            "unit_cost": unit_cost,
            "total_cogs": line_cost
        })
        
    entries = [
        {"account": "1143 應收帳款", "debit": total_sales_amount, "credit": 0},
        {"account": "4111 銷貨收入", "debit": 0, "credit": total_sales_amount},
        {"account": "5111 銷貨成本", "debit": total_cost_amount, "credit": 0},
        {"account": "1210 製成品存貨", "debit": 0, "credit": total_cost_amount}
    ]
    
    voucher = {
        "voucher_id": f"VOUCH-{order_id}",
        "reference_dn": order_id,
        "customer": customer,
        "is_balanced": sum(e["debit"] for e in entries) == sum(e["credit"] for e in entries),
        "total_debit": sum(e["debit"] for e in entries),
        "total_credit": sum(e["credit"] for e in entries),
        "journal_entries": entries,
        "inventory_deductions": inventory_deductions
    }
    
    with open("accounting_voucher.json", "w", encoding="utf-8") as f:
        json.dump(voucher, f, ensure_ascii=False, indent=2)
    print(f"[OK] 出貨過帳成功！借貸平衡檢查: {voucher['is_balanced']}, 總額: {voucher['total_debit']}")

if __name__ == "__main__":
    process_delivery_and_post_gl()
