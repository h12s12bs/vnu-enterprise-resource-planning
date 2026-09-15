# -*- coding: utf-8 -*-
"""
Week 15 實作任務：訪談逐字稿剖析與 TO-BE 系統需求規格書 (SRS) 自動產出
學生姓名：__________   學號：__________
"""
import json

def generate_srs(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        interviews = json.load(f)
        
    srs_content = "# 企業 ERP 系統升級與導入需求規格書 (TO-BE SRS)\n\n"
    srs_content += "## 1. 企業現況差距分析 (Gap Analysis)\n\n"
    
    for dept in interviews.get("departments", []):
        srs_content += f"### 【{dept['name']}】\n"
        srs_content += f"- **AS-IS 現況痛點**：{dept['as_is_pain']}\n"
        srs_content += f"- **TO-BE 解決方案**：{dept['to_be_solution']}\n"
        srs_content += f"- **對應 ERP 模組**：`{dept['erp_module']}`\n\n"
        
    srs_content += "## 2. 導入上線關鍵成功因素 (CSF)\n"
    srs_content += "1. 高階主管全力支持與組織變革承諾\n"
    srs_content += "2. 堅持標準功能導入，客製化率低於 15%\n"
    srs_content += "3. 主檔資料 (Master Data) 全面清洗防呆\n"
    
    with open("srs_specification.md", "w", encoding="utf-8") as f:
        f.write(srs_content)
    print("[OK] SRS 需求規格書生成完畢！輸出 srs_specification.md")

if __name__ == "__main__":
    generate_srs()
