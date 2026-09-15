# -*- coding: utf-8 -*-
"""
Week 17 實作任務：Agentic AI 企業內控與交易軌跡自動審計
學生姓名：__________   學號：__________
"""
import json

def audit_compliance(log_file="sample_data.json"):
    with open(log_file, "r", encoding="utf-8") as f:
        logs = json.load(f)
        
    violations = []
    for entry in logs:
        log_id = entry["log_id"]
        tx_type = entry["tx_type"]
        user = entry["operator"]
        amount = entry.get("amount", 0)
        time_str = entry.get("timestamp", "")
        
        hour = int(time_str.split(" ")[1].split(":")[0])
        if hour >= 23 or hour <= 5:
            violations.append({
                "log_id": log_id, "type": "OFF_HOURS_MODIFICATION", "severity": "HIGH",
                "detail": f"操作員 {user} 於非工作時間 {time_str} 執行 {tx_type}，金額: ${amount:,}"
            })
            
        if 95000 <= amount < 100000 and "UNAPPROVED" in entry.get("flags", []):
            violations.append({
                "log_id": log_id, "type": "STRUCTURING_AVOID_APPROVAL", "severity": "CRITICAL",
                "detail": f"操作員 {user} 開立金額 ${amount:,} 之單據，疑似刻意拆單規避 10 萬主管審批"
            })
            
    output = {
        "total_logs_scanned": len(logs),
        "total_violations_found": len(violations),
        "violations": violations
    }
    with open("compliance_audit_alert.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 合規審查完畢！共掃描 {len(logs)} 筆軌跡，抓出 {len(violations)} 筆異常，輸出 compliance_audit_alert.json")

if __name__ == "__main__":
    audit_compliance()
