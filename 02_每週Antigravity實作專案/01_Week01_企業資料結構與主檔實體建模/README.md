# 第 01 週 Antigravity 電腦教室實戰任務：ERP 核心主檔資料結構與防呆驗證器

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** 主檔資料建模 (Master Data)  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業真實業務情境
企業各部門常因客戶名稱、統編或料號定義不一而陷入『資訊孤島』。本週任務要求學生使用 Antigravity 定義企業客戶、物料與庫房之 Schema，並實作資料校驗防呆器。

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
你是一位 ERP 系統架構師。請使用 Python 建立企業主檔（Customer 與 Item）的驗證器。讀取 sample_data.json，檢查：1. 統編是否為 8 碼數字；2. 物料安全庫存量是否大於 0；3. 價格欄位不可為負數。最後將合法資料與不合規清單分別輸出至 master_data_clean.json 與 error_log.txt。
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd 01_Week01_企業資料結構與主檔實體建模
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
   - 確認目錄下已成功產生：`master_data_clean.json 與 error_log.txt`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`master_data_clean.json 與 error_log.txt`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！

---

## 🚨 電腦教室生存法則：關機重置與成果雲端備份 (下課前必做！)
⚠️ **重要提醒**：電腦教室之電腦均安裝有系統還原卡，只要**下課關機或中途重開機，桌面與 C 槽檔案將被立即清除重置**！
每次完成實作後，請務必選擇以下任一方式將成果永久保存至雲端：
1. **個人 Google 雲端硬碟**：登入 Google Drive，將專案資料夾直接拖拉上傳。
2. **GitHub 倉庫**：使用 GitHub Desktop 執行 Commit & Push 推送到雲端。
3. **課程平台作業繳交區**：登入課程網頁「學生報告繳交」專區上傳成果檔案。
