@echo off
chcp 65001 >nul
title 萬能科技大學 - 企業資源規劃 (ERP) ✕ Agentic AI 教學平台

echo ======================================================================
echo   萬能科技大學【企業資源規劃 (ERP) ✕ Agentic AI】互動教學平台
echo   授課教師：邱俊維 博士 (Dr. Chun-Wei Chiu)
echo   課程學期：11501 ｜ 電腦教室專用互動教學系統
echo ======================================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [錯誤] 找不到 Python 環境，請確認是否已安裝 Python 3。
    echo 如需單機離線使用，請直接開啟 templates\index.html
    pause
    exit /b 1
)

echo [1/2] 正在為您啟動教學伺服器...
start "" http://localhost:5000

echo [2/2] 系統已就緒！請參閱下方電腦教室學生連線網址：
echo.
python app.py

pause
