# 第 09 週 Antigravity 電腦教室實戰任務：期中綜合專案 - 端到端 ERP 跨模組資料流整合管線

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 端到端整合 (End-to-End Pipeline)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
檢驗前 8 週的學習成果。學生需用 Antigravity 串接：[SD 訂單] ➔ [檢查 ATP] ➔ [PP 展開 BOM] ➔ [MRP 計算淨需求] ➔ [MM 觸發請購 PR] 的完整全自動流程！

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 建立端到端 ERP 串接管線。模擬客戶下單 200 台車，系統自動依序呼叫 ATP 驗證、BOM 展開、MRP 推導並產出採購請購單清單，最後生成一份完整的 end_to_end_pipeline_log.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 09_Week09_期中整合_端到端流程管線
   ```
2. **檢視起始程式碼與資料**：
   - 查看 `sample_data.json`：觀察企業模擬情境資料結構。
   - 查看 `starter.py`：檢視核心架構與 `# TODO` 任務區。
3. **使用 Antigravity 進行實作**：
   - 將上方的「Antigravity AI Agent 提示詞」貼給 Antigravity，請 AI 協助你完成、除錯並擴充 `starter.py`。
4. **執行程式並產出實體成果**：
   ```bash
   python starter.py
   ```
5. **檢核交付成果 (Deliverables)**：
   - 確認目錄下已成功產生：`end_to_end_pipeline_log.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`end_to_end_pipeline_log.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
