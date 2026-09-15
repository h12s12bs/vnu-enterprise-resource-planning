# -*- coding: utf-8 -*-
"""
Week 06 實作任務：採購三向比對 (Three-Way Matching) 稽核除錯引擎
學生姓名：__________   學號：__________
"""
import json

def audit_three_way_matching(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        cases = json.load(f)
        
    audit_results = []
    for case in cases:
        cid = case["case_id"]
        po = case["purchase_order"]
        gr = case["goods_receipt"]
        inv = case["invoice"]
        
        status = "PASSED"
        discrepancies = []
        
        if inv["unit_price"] > po["unit_price"]:
            status = "REJECTED"
            discrepancies.append(f"單價浮報：發票單價 ${inv['unit_price']} 高於 PO 簽核價 ${po['unit_price']}")
            
        if inv["qty"] > gr["accepted_qty"]:
            status = "REJECTED"
            discrepancies.append(f"開票數量溢開：發票數量 {inv['qty']} 大於品管驗收合格量 {gr['accepted_qty']}")
            
        expected_total = gr["accepted_qty"] * po["unit_price"]
        actual_total = inv["qty"] * inv["unit_price"]
        
        audit_results.append({
            "case_id": cid,
            "supplier": po["supplier"],
            "sku": po["sku"],
            "audit_status": status,
            "discrepancies": discrepancies,
            "expected_amount": expected_total,
            "invoice_amount": actual_total
        })
        
    with open("audit_report.json", "w", encoding="utf-8") as f:
        json.dump(audit_results, f, ensure_ascii=False, indent=2)
    print(f"[OK] 稽核比對完畢！已審查 {len(audit_results)} 筆交易案件，輸出 audit_report.json")

if __name__ == "__main__":
    audit_three_way_matching()
