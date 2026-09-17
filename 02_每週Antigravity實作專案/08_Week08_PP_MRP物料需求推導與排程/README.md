# 第 08 週 Antigravity 電腦教室實戰任務：生產規劃 PP - 九宮格 MRP 淨需求推導與排程引擎

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 物料需求規劃 (MRP)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
工廠如果太早進料會造成資金積壓爆倉，太晚進料則會造成斷料停工。本週學生需實作標準 MRP 九宮格推導演算法，根據前置時間 (Lead Time) 倒排計畫開工與下單時間。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作 MRP 九宮格推導引擎。讀取主生產排程 (MPS)、現有庫存與採購前置天數。計算每期的總需求、預計入庫、淨需求、預計在手量、計畫產出 (PPO) 與計畫下單 (PPR)，產出 mrp_schedule_output.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 08_Week08_PP_MRP物料需求推導與排程
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
   - 確認目錄下已成功產生：`mrp_schedule_output.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`mrp_schedule_output.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
