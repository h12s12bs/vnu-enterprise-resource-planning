# 第 13 週 Antigravity 電腦教室實戰任務：顧客關係管理 CRM - RFM 顧客金字塔模型分群實作

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 客戶關係管理 (CRM)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
企業 80% 的利潤往往來自 20% 的忠誠客戶。本週使用 Antigravity 讀取客戶歷史消費交易，計算最近購買日 (R)、消費頻率 (F)、消費總額 (M)，將客戶精準歸類至 VIP、潛力客戶或流失高風險客戶。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作 RFM 顧客分群模型。讀取 customer_transactions.json，計算每位客戶的 Recency (天數)、Frequency (次數) 與 Monetary (總額)。依分位數或門檻給予標籤（黃金VIP、重要挽留客、新客戶、沉睡客），輸出 rfm_customer_segments.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 13_Week13_CRM_RFM客戶分群與價值模型
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
   - 確認目錄下已成功產生：`rfm_customer_segments.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`rfm_customer_segments.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
