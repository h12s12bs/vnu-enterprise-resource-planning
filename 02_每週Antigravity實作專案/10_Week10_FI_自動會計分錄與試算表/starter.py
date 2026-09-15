# -*- coding: utf-8 -*-
"""
Week 10 實作任務：總帳過帳與借貸試算表 (Trial Balance) 生成
學生姓名：__________   學號：__________
"""
import json

def generate_trial_balance(tx_file="sample_data.json"):
    with open(tx_file, "r", encoding="utf-8") as f:
        transactions = json.load(f)
        
    ledger = {}
    for tx in transactions:
        for entry in tx.get("entries", []):
            acc = entry["account"]
            debit = entry.get("debit", 0)
            credit = entry.get("credit", 0)
            if acc not in ledger:
                ledger[acc] = {"debit_total": 0, "credit_total": 0}
            ledger[acc]["debit_total"] += debit
            ledger[acc]["credit_total"] += credit
            
    tb_rows = []
    total_debit = 0
    total_credit = 0
    for acc, amounts in sorted(ledger.items()):
        deb = amounts["debit_total"]
        crd = amounts["credit_total"]
        total_debit += deb
        total_credit += crd
        tb_rows.append({"account": acc, "debit": deb, "credit": crd})
        
    is_balanced = (total_debit == total_credit)
    output = {
        "is_balanced": is_balanced,
        "grand_total_debit": total_debit,
        "grand_total_credit": total_credit,
        "trial_balance_rows": tb_rows
    }
    with open("trial_balance.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 試算表生成完畢！借貸平衡: {is_balanced}，借方: ${total_debit:,}，貸方: ${total_credit:,}")

if __name__ == "__main__":
    generate_trial_balance()
