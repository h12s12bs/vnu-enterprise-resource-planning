# -*- coding: utf-8 -*-
"""
Week 16 核心實戰：ReAct 自主代理人 (Agentic AI) 企業訂單處理
學生姓名：__________   學號：__________
"""
import json

class MockErpApi:
    @staticmethod
    def query_stock(sku):
        stock_db = {"BIKE-PRO": 45, "HELMET-GT": 120}
        return stock_db.get(sku, 0)
        
    @staticmethod
    def query_credit(customer_id):
        return {"credit_limit": 500000, "used_credit": 120000, "status": "GOOD"}

class ErpOrderAgent:
    def __init__(self):
        self.trace = []

    def log_step(self, step_type, content, tool=None, result=None):
        step = {"type": step_type, "content": content}
        if tool: step["tool"] = tool
        if result is not None: step["result"] = result
        self.trace.append(step)
        print(f"[{step_type.upper()}] {content}")

    def process_order(self, customer_id, sku, qty, unit_price):
        self.log_step("thought", f"收到客戶 {customer_id} 訂購 {qty} 台 {sku}。首先需檢查 ERP 現有可用庫存。")
        stock = MockErpApi.query_stock(sku)
        self.log_step("action", "呼叫 ERP 庫存查詢 API", tool="MockErpApi.query_stock", result={"available_stock": stock})
        
        if stock < qty:
            self.log_step("thought", f"庫存不足 (現存 {stock} < 需求 {qty})，需觸發欠交與預警排產。")
            self.log_step("final_decision", "訂單暫掛：進入缺貨預警流程。")
            return self.trace
            
        self.log_step("thought", "庫存充裕，接著驗證客戶信用額度與大額防呆門檻。")
        total_amount = qty * unit_price
        
        if total_amount > 100000:
            self.log_step("guardrail", f"訂單金額 ${total_amount:,} 超過 10 萬元安全防線，啟動 Human-in-the-Loop 主管審批機制。")
            self.log_step("final_decision", "已發送審批通知給部門主管，主管核准後自動建立正式 ERP 訂單。")
        else:
            self.log_step("action", "金額在自動授權限額內，呼叫 ERP 建立銷售訂單 API")
            self.log_step("final_decision", f"正式銷售訂單建立成功！單號: SO-AI-2026-99")
            
        return self.trace

def main():
    agent = ErpOrderAgent()
    trace_output = agent.process_order(customer_id="CUST-TW-88", sku="BIKE-PRO", qty=15, unit_price=28000)
    
    with open("agent_react_trace.json", "w", encoding="utf-8") as f:
        json.dump(trace_output, f, ensure_ascii=False, indent=2)
    print("\n[OK] Agentic AI 執行完畢！完整 ReAct 推理日誌已輸出至 agent_react_trace.json")

if __name__ == "__main__":
    main()
