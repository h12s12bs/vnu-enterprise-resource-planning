# 第 06 週 Antigravity 電腦教室實戰任務：採購與庫存 MM - 三向比對 (Three-Way Matching) 稽核器

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 採購防弊與內控稽核  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
企業財務最大的舞弊與漏損常發生在付款階段。本週實作三向比對引擎，比對 PO (採購單)、GR (驗收單)、Invoice (供應商發票) 的品號、單價、數量與稅額，阻斷詐騙與溢付。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
請在 Antigravity 中開發採購三向比對稽核程式。比對採購單 PO、驗收單 GR、供應商發票 Invoice。判定標準：1. 單價不可高於 PO 簽核價；2. 開票數量不可大於實際收料數量；3. 若差異在 1% 稅差內標記為小額稅差允許放行，若超過則拒絕過帳。將審計結果輸出為 audit_report.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 06_Week06_MM_採購三向比對稽核除錯引擎
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
   - 確認目錄下已成功產生：`audit_report.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`audit_report.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
