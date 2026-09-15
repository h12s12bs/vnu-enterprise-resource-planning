# 第 18 週 Antigravity 電腦教室實戰任務：期末成果發表 - 企業 AI-ERP 整合專案成果發布與驗收

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 期末專案發表 (10% 專題)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
整合全學期 18 週所學之 ERP 核心模組與 Agentic AI 技術，各組學生使用 Antigravity 打包完成包含流程圖、ReAct 執行成果與量化效益之企劃書與成果包。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 整理你的期末專題。將組別、選定之企業流程痛點、所設計之 Agentic AI 工作流架構、驗證數據與預期效益指標，自動生成最終驗收報告 final_project_report.md 與驗證包。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 18_Week18_期末成果_AI_ERP綜合專案發布
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
   - 確認目錄下已成功產生：`final_project_report.md 與 submission_status.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`final_project_report.md 與 submission_status.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
