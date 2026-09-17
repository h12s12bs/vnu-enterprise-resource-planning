# 第 07 週 Antigravity 電腦教室實戰任務：生產規劃 PP - 樹狀多階 BOM 遞迴展開與成本加總

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 生產規劃與控制 (PP)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
一輛自行車由車架組、傳動組與煞車組構成，每個組件又由多個子零件構成。學生將使用 Antigravity 實作多階 BOM 展開遞迴演算法，計算生產 500 台自行車時各底層物料之總需求與標準成本。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
請在 Antigravity 中實作多階物料清單 (BOM) 遞迴展開演算法。輸入父階產品代號與生產數量，考慮零件損耗率 (Scrap Rate: 需求量 * (1 + 損耗率))，展開所有最底層採購件之總數量與材料成本，產出 bom_explosion_result.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 07_Week07_PP_多階BOM展開與損耗計算
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
   - 確認目錄下已成功產生：`bom_explosion_result.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`bom_explosion_result.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
