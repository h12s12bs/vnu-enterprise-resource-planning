# 第 12 週 Antigravity 電腦教室實戰任務：供應鏈管理 SCM - 長鞭效應量化與 VMI 平抑補貨

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 供應鏈管理 (SCM)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
當終端顧客需求只微幅變動 10% 時，上游零件廠的訂單變異卻高達 80%！本週用 Antigravity 計算各層級訂單變異數比率 (Variance Ratio)，並透過 VMI 演算法減少庫存震盪。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作供應鏈長鞭效應分析腳本。讀取零售商、批發商與製造商訂單序列，計算各階層訂單變異數 (Variance)。展示啟用 VMI (供應商管理庫存) 資訊共享後，製造商端之訂單變異數如何下降超過 50%，輸出 bullwhip_analysis.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 12_Week12_SCM_長鞭效應量化與VMI補貨
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
   - 確認目錄下已成功產生：`bullwhip_analysis.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`bullwhip_analysis.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
