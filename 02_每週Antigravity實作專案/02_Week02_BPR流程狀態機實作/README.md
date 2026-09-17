# 第 02 週 Antigravity 電腦教室實戰任務：BPR 訂單到收款 (O2C) 嚴格狀態轉移機

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 企業流程再造 (BPR)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
許多傳統企業業務員在未經信用審核前就通知倉庫私自發貨。本週實作狀態機，嚴格約束訂單生命週期轉移，杜絕越權出貨。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
請在 Antigravity 中實作 Order-to-Cash (O2C) 流程狀態機。定義狀態：DRAFT ➔ QUOTE ➔ ORDER_APPROVED ➔ DELIVERED ➔ INVOICED ➔ CLOSED。若有人試圖從 DRAFT 直接跳轉到 DELIVERED，必須拋出 IllegalProcessTransitionError 異常並紀錄至 audit_trail.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 02_Week02_BPR流程狀態機實作
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
   - 確認目錄下已成功產生：`o2c_flow_result.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`o2c_flow_result.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
