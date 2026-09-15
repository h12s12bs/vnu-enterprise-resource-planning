# 第 17 週 Antigravity 電腦教室實戰任務：Agentic AI 實戰 - 企業內控異常交易合規自動審計 Agent

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** AI 內控與合規審計  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
企業舞弊多半隱藏在深夜改價、拆單規避主管簽核或越權放行中。本週讓學生使用 Antigravity 實作主動式 Audit Agent，自動掃描 ERP 交易稽核軌跡 (Audit Log)，揪出異常並產出警示通報。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 建立合規監控 Agent。分析 erp_audit_logs.json，檢查三項違規特徵：1. 拆單規避主管簽核（同一客戶同天多筆小額訂單剛好低於 10 萬）；2. 員工與客戶銀行帳號雷同（舞弊自肥）；3. 非上班時間未授權修改單價。將違規案件輸出至 compliance_audit_alert.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 17_Week17_Agentic_AI_企業內控合規審計
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
   - 確認目錄下已成功產生：`compliance_audit_alert.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`compliance_audit_alert.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
