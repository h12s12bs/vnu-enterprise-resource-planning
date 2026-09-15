# 第 03 週 Antigravity 電腦教室實戰任務：銷售配銷 SD - ATP (可承諾量) 即時推導 Agent

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 銷售與配銷 (SD)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
重要客戶致電欲緊急採購 120 台登山車，業務員必須在 3 秒內精確計算現有庫存與排程預計入庫量，回覆能立即交貨的數量與剩餘欠交之承諾交期。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 撰寫一個 ATP (Available To Promise) 即時試算腳本。讀取 sample_data.json 中的在手庫存、客戶已保留量與排程入庫計畫。計算第 1 期與第 2 期的 ATP 可用量，並判定若新訂單為 80 台，業務應如何回覆承諾交期，產出 atp_result.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 03_Week03_SD_ATP即時試算Agent
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
   - 確認目錄下已成功產生：`atp_result.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`atp_result.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
