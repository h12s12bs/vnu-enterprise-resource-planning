# 第 14 週 Antigravity 電腦教室實戰任務：商業智慧 BI - 營運大數據 ETL 與經營層 KPI 產出

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 商業智慧與大數據 (BI)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
總經理每週一早會需要綜觀全公司的經營績效（總營收、毛利率、庫存週轉天數、交期達交率）。本週實作 ETL (Extract-Transform-Load) 管線，將分散資料彙整為即時 KPI 戰情報表。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作 BI 資料抽取與指標計算腳本。提取銷售交易與庫存紀錄，轉換並計算：1. 總營收與毛利率；2. 訂單準時達交率 (OTD %)；3. 滯銷品庫存警示。最後輸出 executive_dashboard_kpis.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 14_Week14_BI_營運資料ETL與戰情儀表板
   ```
2. **檢視起始程式碼與資料**：
   - 查看 `sample_data.json`：觀察企業真實資料結構。
   - 查看 `starter.py`：檢視核心架構與 `# TODO` 任務區。
3. **使用 Antigravity 進行實作**：
   - 將上方的「Antigravity AI Agent 提示詞」貼給 Antigravity，請 AI 協助你完成、除錯並擴充 `starter.py`。
4. **執行程式並產出實體成果**：
   ```bash
   python starter.py
   ```
5. **檢核交付成果 (Deliverables)**：
   - 確認目錄下已成功產生：`executive_dashboard_kpis.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`executive_dashboard_kpis.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
