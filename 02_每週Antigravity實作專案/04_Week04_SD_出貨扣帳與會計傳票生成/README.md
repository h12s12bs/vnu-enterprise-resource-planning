# 第 04 週 Antigravity 電腦教室實戰任務：銷售配銷 SD - 出貨單 (DN) 扣庫與自動會計分錄

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 銷配扣帳與財務整合  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
倉庫確認出貨並點選完成交貨後，ERP 必須自動執行兩大動作：1. 扣減物料實體庫存量；2. 自動產生借貸相等的會計傳票 (借：應收帳款，貸：銷貨收入；借：銷貨成本，貸：存貨)。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
在 Antigravity 中實作出貨過帳引擎。讀取 delivery_note.json，執行：1. 扣減現有庫存；2. 根據出貨售價與移動平均成本，生成借貸平衡的雙重會計傳票（AR/Revenue 與 COGS/Inventory）；3. 將結果輸出至 accounting_voucher.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 04_Week04_SD_出貨扣帳與會計傳票生成
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
   - 確認目錄下已成功產生：`accounting_voucher.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`accounting_voucher.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
