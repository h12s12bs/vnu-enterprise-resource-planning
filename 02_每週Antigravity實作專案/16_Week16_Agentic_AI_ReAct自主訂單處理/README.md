# 第 16 週 Antigravity 電腦教室實戰任務：Agentic AI 核心實戰 - ReAct 自主企業訂單處理 Agent

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** Agentic AI 實務核心  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
本週為全課程最核心前瞻實作！學生將在 Antigravity 中實作完整的 ReAct (Thought ➔ Action ➔ Observation ➔ Decision) 自主 Agent，自主調用 ERP API 並具備主管審批安全防線。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作一個完整的 ReAct Agent。給定客戶發來的訂單文字需求，Agent 必須：1. Thought: 思考需萃取的實體；2. Action: 呼叫 erp_check_stock 工具；3. Observation: 獲得庫存數據；4. Guardrails: 若訂單總金額 > 10 萬元，觸發 Human-in-the-Loop 主管核准；5. Final Decision: 產出正式訂單，記錄完整思考軌跡至 agent_react_trace.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 16_Week16_Agentic_AI_ReAct自主訂單處理
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
   - 確認目錄下已成功產生：`agent_react_trace.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`agent_react_trace.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
