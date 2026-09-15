# -*- coding: utf-8 -*-
"""
Week 02 實作任務：O2C 流程狀態機與合規防呆
學生姓名：__________   學號：__________
"""
import json

VALID_TRANSITIONS = {
    "DRAFT": ["QUOTE"],
    "QUOTE": ["ORDER_APPROVED", "REJECTED"],
    "ORDER_APPROVED": ["DELIVERED"],
    "DELIVERED": ["INVOICED"],
    "INVOICED": ["CLOSED"]
}

class O2COrderMachine:
    def __init__(self, order_id, customer_name):
        self.order_id = order_id
        self.customer = customer_name
        self.state = "DRAFT"
        self.history = []

    def transition(self, new_state, operator="系統"):
        if new_state in VALID_TRANSITIONS.get(self.state, []):
            old_state = self.state
            self.state = new_state
            self.history.append({"from": old_state, "to": new_state, "operator": operator, "status": "SUCCESS"})
            print(f"[狀態轉移成功] {self.order_id}: {old_state} -> {new_state}")
            return True
        else:
            self.history.append({"from": self.state, "to": new_state, "operator": operator, "status": "BLOCKED_ILLEGAL_TRANSITION"})
            print(f"[越權警告！] 禁止從 {self.state} 直接跳轉至 {new_state}！")
            return False

def test_o2c_machine():
    order = O2COrderMachine("SO-2026-001", "宏碁電腦股份有限公司")
    order.transition("QUOTE", "業務專員")
    order.transition("DELIVERED", "倉庫人員") # 應被阻擋！
    order.transition("ORDER_APPROVED", "財務主管")
    order.transition("DELIVERED", "倉庫人員") # 成功！
    order.transition("INVOICED", "會計人員")
    
    with open("o2c_flow_result.json", "w", encoding="utf-8") as f:
        json.dump({"order_id": order.order_id, "final_state": order.state, "history": order.history}, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    test_o2c_machine()
