# -*- coding: utf-8 -*-
"""
第 01 週實作成果自動驗證腳本
"""
import os
import sys

deliv_files = [f.strip() for f in "master_data_clean.json 與 error_log.txt".split("與")]
passed = True
print(f"=== [驗證作業] 第 01 週: ERP 核心主檔資料結構與防呆驗證器 ===")

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
    print("\n[SUCCESS] 恭喜！第 01 週 Antigravity 實作任務 100% 驗收通過！")
else:
    print("\n[FAILED] 驗收未通過，請檢查程式碼或使用 Antigravity 協助除錯！")
