# -*- coding: utf-8 -*-
"""
Week 01 實作任務：企業主檔資料結構與防呆驗證
學生姓名：__________   學號：__________
"""
import json

def validate_master_data(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    valid_customers = []
    valid_items = []
    errors = []

    # TODO: 使用 Antigravity 擴充檢核邏輯
    # 1. 客戶統編 (tax_id) 必須剛好 8 碼且為數字
    # 2. 物料安全庫存 (safety_stock) 必須 >= 0
    # 3. 物料標準單價 (standard_price) 必須 > 0
    
    for c in data.get("customers", []):
        tax_id = str(c.get("tax_id", ""))
        if len(tax_id) == 8 and tax_id.isdigit():
            valid_customers.append(c)
        else:
            errors.append(f"客戶主檔錯誤 [{c.get('name')}]: 統編 {tax_id} 不符 8 碼規格")

    for item in data.get("items", []):
        if item.get("standard_price", 0) > 0 and item.get("safety_stock", 0) >= 0:
            valid_items.append(item)
        else:
            errors.append(f"物料主檔錯誤 [{item.get('sku')}]: 價格或安全存量異常")

    output = {
        "valid_customers": valid_customers,
        "valid_items": valid_items,
        "total_valid_customers": len(valid_customers),
        "total_valid_items": len(valid_items)
    }
    
    with open("master_data_clean.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        
    with open("error_log.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(errors))
        
    print(f"[OK] 驗證完成！合法客戶: {len(valid_customers)}, 合法物料: {len(valid_items)}, 異常數: {len(errors)}")

if __name__ == "__main__":
    validate_master_data()
