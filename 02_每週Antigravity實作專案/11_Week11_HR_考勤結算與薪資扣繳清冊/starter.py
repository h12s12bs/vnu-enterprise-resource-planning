# -*- coding: utf-8 -*-
"""
Week 11 實作任務：HR 考勤打卡分析與薪資結算清冊
學生姓名：__________   學號：__________
"""
import json

def calculate_payroll(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        employees = json.load(f)
        
    payroll_list = []
    for emp in employees:
        base_salary = emp["base_salary"]
        hourly_rate = base_salary / 240.0
        overtime_hours = emp.get("overtime_hours", 0)
        late_minutes = emp.get("late_minutes", 0)
        
        overtime_pay = round(overtime_hours * hourly_rate * 1.34)
        late_deduction = round((late_minutes / 60.0) * hourly_rate)
        labor_health_insurance = round(base_salary * 0.05)
        net_pay = base_salary + overtime_pay - late_deduction - labor_health_insurance
        
        payroll_list.append({
            "emp_id": emp["id"],
            "name": emp["name"],
            "base_salary": base_salary,
            "overtime_pay": overtime_pay,
            "deductions": {"late": late_deduction, "insurance": labor_health_insurance},
            "net_pay": net_pay
        })
        
    with open("payroll_summary.json", "w", encoding="utf-8") as f:
        json.dump(payroll_list, f, ensure_ascii=False, indent=2)
    print(f"[OK] 薪資結算完畢！已處理 {len(payroll_list)} 位同仁薪資，輸出 payroll_summary.json")

if __name__ == "__main__":
    calculate_payroll()
