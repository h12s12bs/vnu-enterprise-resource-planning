# 第 05 週 Antigravity 電腦教室實戰任務：採購與庫存 MM - 再訂購點 (ROP) 監控與 PR 生成

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 採購與物料管理 (MM)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
製造業最怕突發性停工待料。本週讓學生使用 Antigravity 監控倉儲 10 項關鍵物料，依據交期天數、日消耗率與安全存量計算 ROP，一旦低於門檻即自動產出採購請購單 (PR)。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 撰寫庫存自動監控與請購引擎。公式：ROP = (日平均耗用量 * 採購前置天數) + 安全存量。當現有庫存 <= ROP 時，自動產生建議採購量 EOQ 並開立 PR 請購單輸出至 generated_pr_orders.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 05_Week05_MM_庫存水位監控與自動請購
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
   - 確認目錄下已成功產生：`generated_pr_orders.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`generated_pr_orders.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
