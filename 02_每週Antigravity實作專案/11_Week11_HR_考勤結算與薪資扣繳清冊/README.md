# 第 11 週 Antigravity 電腦教室實戰任務：人力資源 HR - 考勤打卡分析與實發薪資自動清算

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 人力資源管理 (HR)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
企業每月需核算全體同仁之出缺勤打卡紀錄，計算平日加班、休假日加班與遲到曠職扣款，並扣除勞保、健保與所得稅代扣額，產出薪資發放清冊。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
使用 Antigravity 實作 HR 薪資結算腳本。讀取員工打卡記錄與底薪設定，計算：1. 加班費 (時薪 * 1.34 / 1.67)；2. 勞健保個人負擔；3. 實發淨額 (Net Pay)。結果輸出至 payroll_summary.json。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 11_Week11_HR_考勤結算與薪資扣繳清冊
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
   - 確認目錄下已成功產生：`payroll_summary.json`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`payroll_summary.json`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
