# -*- coding: utf-8 -*-
"""
Week 13 實作任務：RFM 顧客價值金字塔模型分群
學生姓名：__________   學號：__________
"""
import json

def compute_rfm_segments(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        customers = json.load(f)
        
    segments = []
    for c in customers:
        cid = c["customer_id"]
        name = c["name"]
        recency = c["recency_days"]
        freq = c["frequency_count"]
        monetary = c["monetary_amount"]
        
        if recency <= 30 and freq >= 10 and monetary >= 100000:
            tag = "🌟 頂級核心 VIP"
            action = "指派專屬業務主管、提供 VIP 專屬量身折扣與優先配貨"
        elif recency <= 60 and freq >= 5:
            tag = "🚀 潛力高價值客"
            action = "推播新品資訊、發送滿額折價券提高客單價"
        elif recency > 90 and monetary >= 50000:
            tag = "⚠️ 重要挽留高風險客"
            action = "客服主動電訪關懷、了解流失原因並提供回流專案"
        else:
            tag = "💤 一般/沉睡客"
            action = "低成本 EDM 自動化喚醒推播"
            
        segments.append({
            "customer_id": cid, "name": name,
            "rfm_scores": {"r": recency, "f": freq, "m": monetary},
            "segment_tag": tag, "recommended_strategy": action
        })
        
    with open("rfm_customer_segments.json", "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)
    print(f"[OK] RFM 客戶分群完成！共分析 {len(segments)} 位客戶，輸出 rfm_customer_segments.json")

if __name__ == "__main__":
    compute_rfm_segments()
