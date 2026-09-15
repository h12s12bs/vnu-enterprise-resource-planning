# 第 15 週 Antigravity 電腦教室實戰任務：系統導入方法論 - 痛點訪談轉 TO-BE 系統規格書 (SRS)

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** ERP 系統導入方法論  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
顧問導入 ERP 成功關鍵在於從現況 (AS-IS) 差距分析 (Gap Analysis) 轉化為目標 (TO-BE) 系統需求規格書。本週使用 Antigravity 自動剖析企業訪談逐字稿並產出結構化規格書。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
你是一位資深 ERP 導入顧問。使用 Antigravity 讀取 interview_transcript.txt 中的各部門痛點訪談，進行 Gap Analysis，並自動生成包含 5 大模組需求與人機協同機制的 TO-BE 系統需求規格書 srs_specification.md。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 15_Week15_系統導入藍圖與SRS規格生成
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
   - 確認目錄下已成功產生：`srs_specification.md`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`srs_specification.md`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
