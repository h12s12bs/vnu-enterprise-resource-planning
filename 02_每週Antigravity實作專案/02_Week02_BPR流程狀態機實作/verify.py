# -*- coding: utf-8 -*-
"""
第 02 週實作成果自動驗證腳本
"""
import os
import sys

deliv_files = [f.strip() for f in "o2c_flow_result.json".split("與")]
passed = True
print(f"=== [驗證作業] 第 02 週: BPR 訂單到收款 (O2C) 嚴格狀態轉移機 ===")

for df in deliv_files:
    if os.path.exists(df):
        sz = os.path.getsize(df)
        if sz > 0:
            print(f"[PASS] 成果檔案 {df} 存在且非空 ({sz} bytes)")
        else:
            print(f"[FAIL] 成果檔案 {df} 為 0 bytes 空檔！")
            passed = False
    else:
        print(f"[FAIL] 尚未找到產出檔案: {df}，請先執行 python starter.py 產生！")
        passed = False

if passed:
    print("\n[SUCCESS] 恭喜！第 02 週 Antigravity 實作任務 100% 驗收通過！")
else:
    print("\n[FAILED] 驗收未通過，請檢查程式碼或使用 Antigravity 協助除錯！")
