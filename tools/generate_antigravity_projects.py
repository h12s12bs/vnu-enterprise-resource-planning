# -*- coding: utf-8 -*-
"""
萬能科技大學 企業資源規劃 (ERP) ✕ Agentic AI
18 週 Antigravity 電腦教室實戰專案產生器
讓學生在一人一機的電腦教室中，每週使用 Antigravity 親自動手做出實務系統與產出檔案！
"""
import os
import sys
import json
import zipfile

# Ensure UTF-8 console output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTS_DIR = os.path.join(BASE_DIR, "02_每週Antigravity實作專案")
STATIC_ZIP_DIR = os.path.join(BASE_DIR, "static", "projects")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(PROJECTS_DIR, exist_ok=True)
os.makedirs(STATIC_ZIP_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

MISSIONS = [
    {
        "week": 1,
        "folder": "Week01_企業資料結構與主檔實體建模",
        "title": "ERP 核心主檔資料結構與防呆驗證器",
        "tag": "主檔資料建模 (Master Data)",
        "scenario": "企業各部門常因客戶名稱、統編或料號定義不一而陷入『資訊孤島』。本週任務要求學生使用 Antigravity 定義企業客戶、物料與庫房之 Schema，並實作資料校驗防呆器。",
        "prompt": "你是一位 ERP 系統架構師。請使用 Python 建立企業主檔（Customer 與 Item）的驗證器。讀取 sample_data.json，檢查：1. 統編是否為 8 碼數字；2. 物料安全庫存量是否大於 0；3. 價格欄位不可為負數。最後將合法資料與不合規清單分別輸出至 master_data_clean.json 與 error_log.txt。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 01 實作任務：企業主檔資料結構與防呆驗證
學生姓名：__________   學號：__________
"""
import json

def validate_master_data(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    valid_customers = []
    valid_items = []
    errors = []

    # TODO: 使用 Antigravity 擴充檢核邏輯
    # 1. 客戶統編 (tax_id) 必須剛好 8 碼且為數字
    # 2. 物料安全庫存 (safety_stock) 必須 >= 0
    # 3. 物料標準單價 (standard_price) 必須 > 0
    
    for c in data.get("customers", []):
        tax_id = str(c.get("tax_id", ""))
        if len(tax_id) == 8 and tax_id.isdigit():
            valid_customers.append(c)
        else:
            errors.append(f"客戶主檔錯誤 [{c.get('name')}]: 統編 {tax_id} 不符 8 碼規格")

    for item in data.get("items", []):
        if item.get("standard_price", 0) > 0 and item.get("safety_stock", 0) >= 0:
            valid_items.append(item)
        else:
            errors.append(f"物料主檔錯誤 [{item.get('sku')}]: 價格或安全存量異常")

    output = {
        "valid_customers": valid_customers,
        "valid_items": valid_items,
        "total_valid_customers": len(valid_customers),
        "total_valid_items": len(valid_items)
    }
    
    with open("master_data_clean.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
        
    with open("error_log.txt", "w", encoding="utf-8") as f:
        f.write("\\n".join(errors))
        
    print(f"[OK] 驗證完成！合法客戶: {len(valid_customers)}, 合法物料: {len(valid_items)}, 異常數: {len(errors)}")

if __name__ == "__main__":
    validate_master_data()
''',
        "sample_data": {
            "customers": [
                {"id": "C001", "name": "台灣宏達數位科技", "tax_id": "12345678", "credit_limit": 500000},
                {"id": "C002", "name": "台北連網實業", "tax_id": "8765432", "credit_limit": 300000},
                {"id": "C003", "name": "桃聯智慧製造", "tax_id": "23456789", "credit_limit": 1000000}
            ],
            "items": [
                {"sku": "BIKE-001", "name": "26吋碳纖維登山車", "standard_price": 28500, "safety_stock": 20},
                {"sku": "FRAME-01", "name": "超輕量鋁合金車架", "standard_price": -500, "safety_stock": 10},
                {"sku": "WHEEL-02", "name": "26吋越野跑胎輪組", "standard_price": 3200, "safety_stock": 40}
            ]
        },
        "deliverable": "master_data_clean.json 與 error_log.txt"
    },
    {
        "week": 2,
        "folder": "Week02_BPR流程狀態機實作",
        "title": "BPR 訂單到收款 (O2C) 嚴格狀態轉移機",
        "tag": "企業流程再造 (BPR)",
        "scenario": "許多傳統企業業務員在未經信用審核前就通知倉庫私自發貨。本週實作狀態機，嚴格約束訂單生命週期轉移，杜絕越權出貨。",
        "prompt": "請在 Antigravity 中實作 Order-to-Cash (O2C) 流程狀態機。定義狀態：DRAFT ➔ QUOTE ➔ ORDER_APPROVED ➔ DELIVERED ➔ INVOICED ➔ CLOSED。若有人試圖從 DRAFT 直接跳轉到 DELIVERED，必須拋出 IllegalProcessTransitionError 異常並紀錄至 audit_trail.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
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
''',
        "sample_data": {"test_order_id": "SO-2026-001", "actions": ["QUOTE", "DELIVERED", "ORDER_APPROVED", "DELIVERED", "INVOICED"]},
        "deliverable": "o2c_flow_result.json"
    },
    {
        "week": 3,
        "folder": "Week03_SD_ATP即時試算Agent",
        "title": "銷售配銷 SD - ATP (可承諾量) 即時推導 Agent",
        "tag": "銷售與配銷 (SD)",
        "scenario": "重要客戶致電欲緊急採購 120 台登山車，業務員必須在 3 秒內精確計算現有庫存與排程預計入庫量，回覆能立即交貨的數量與剩餘欠交之承諾交期。",
        "prompt": "使用 Antigravity 撰寫一個 ATP (Available To Promise) 即時試算腳本。讀取 sample_data.json 中的在手庫存、客戶已保留量與排程入庫計畫。計算第 1 期與第 2 期的 ATP 可用量，並判定若新訂單為 80 台，業務應如何回覆承諾交期，產出 atp_result.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 03 實作任務：ATP (可承諾量) 演算法與交期試算
學生姓名：__________   學號：__________
"""
import json

def calculate_atp(data_path="sample_data.json"):
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    on_hand = data["on_hand_stock"]
    safety_stock = data["safety_stock"]
    periods = data["periods"]
    
    results = []
    current_inventory = on_hand
    
    for idx, p in enumerate(periods):
        planned_receipt = p.get("planned_receipt", 0)
        committed_orders = p.get("committed_orders", 0)
        
        atp = (current_inventory + planned_receipt) - committed_orders - (safety_stock if idx == 0 else 0)
        atp = max(0, atp)
        current_inventory = current_inventory + planned_receipt - committed_orders
        
        results.append({
            "period": p["period"],
            "planned_receipt": planned_receipt,
            "committed_orders": committed_orders,
            "calculated_atp": atp,
            "ending_inventory": current_inventory
        })
        
    output = {
        "initial_on_hand": on_hand,
        "safety_stock": safety_stock,
        "period_atp_analysis": results
    }
    
    with open("atp_result.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("[OK] ATP 計算完畢！已產出 atp_result.json")

if __name__ == "__main__":
    calculate_atp()
''',
        "sample_data": {
            "on_hand_stock": 100,
            "safety_stock": 20,
            "periods": [
                {"period": "W1", "planned_receipt": 0, "committed_orders": 45},
                {"period": "W2", "planned_receipt": 50, "committed_orders": 30},
                {"period": "W3", "planned_receipt": 80, "committed_orders": 60}
            ]
        },
        "deliverable": "atp_result.json"
    },
    {
        "week": 4,
        "folder": "Week04_SD_出貨扣帳與會計傳票生成",
        "title": "銷售配銷 SD - 出貨單 (DN) 扣庫與自動會計分錄",
        "tag": "銷配扣帳與財務整合",
        "scenario": "倉庫確認出貨並點選完成交貨後，ERP 必須自動執行兩大動作：1. 扣減物料實體庫存量；2. 自動產生借貸相等的會計傳票 (借：應收帳款，貸：銷貨收入；借：銷貨成本，貸：存貨)。",
        "prompt": "在 Antigravity 中實作出貨過帳引擎。讀取 delivery_note.json，執行：1. 扣減現有庫存；2. 根據出貨售價與移動平均成本，生成借貸平衡的雙重會計傳票（AR/Revenue 與 COGS/Inventory）；3. 將結果輸出至 accounting_voucher.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 04 實作任務：出貨扣庫存與自動生成會計分錄
學生姓名：__________   學號：__________
"""
import json

def process_delivery_and_post_gl(dn_file="sample_data.json"):
    with open(dn_file, "r", encoding="utf-8") as f:
        dn = json.load(f)
        
    order_id = dn["order_id"]
    customer = dn["customer"]
    items = dn["items"]
    
    total_sales_amount = 0
    total_cost_amount = 0
    inventory_deductions = []
    
    for item in items:
        qty = item["qty"]
        unit_price = item["unit_price"]
        unit_cost = item["unit_cost"]
        line_sales = qty * unit_price
        line_cost = qty * unit_cost
        total_sales_amount += line_sales
        total_cost_amount += line_cost
        
        inventory_deductions.append({
            "sku": item["sku"],
            "deduct_qty": qty,
            "unit_cost": unit_cost,
            "total_cogs": line_cost
        })
        
    entries = [
        {"account": "1143 應收帳款", "debit": total_sales_amount, "credit": 0},
        {"account": "4111 銷貨收入", "debit": 0, "credit": total_sales_amount},
        {"account": "5111 銷貨成本", "debit": total_cost_amount, "credit": 0},
        {"account": "1210 製成品存貨", "debit": 0, "credit": total_cost_amount}
    ]
    
    voucher = {
        "voucher_id": f"VOUCH-{order_id}",
        "reference_dn": order_id,
        "customer": customer,
        "is_balanced": sum(e["debit"] for e in entries) == sum(e["credit"] for e in entries),
        "total_debit": sum(e["debit"] for e in entries),
        "total_credit": sum(e["credit"] for e in entries),
        "journal_entries": entries,
        "inventory_deductions": inventory_deductions
    }
    
    with open("accounting_voucher.json", "w", encoding="utf-8") as f:
        json.dump(voucher, f, ensure_ascii=False, indent=2)
    print(f"[OK] 出貨過帳成功！借貸平衡檢查: {voucher['is_balanced']}, 總額: {voucher['total_debit']}")

if __name__ == "__main__":
    process_delivery_and_post_gl()
''',
        "sample_data": {
            "order_id": "DN-2026-088",
            "customer": "捷安特旗艦經銷",
            "items": [
                {"sku": "BIKE-001", "name": "碳纖維登山車", "qty": 10, "unit_price": 28000, "unit_cost": 18500},
                {"sku": "HELMET-05", "name": "極輕流線安全帽", "qty": 20, "unit_price": 1800, "unit_cost": 750}
            ]
        },
        "deliverable": "accounting_voucher.json"
    },
    {
        "week": 5,
        "folder": "Week05_MM_庫存水位監控與自動請購",
        "title": "採購與庫存 MM - 再訂購點 (ROP) 監控與 PR 生成",
        "tag": "採購與物料管理 (MM)",
        "scenario": "製造業最怕突發性停工待料。本週讓學生使用 Antigravity 監控倉儲 10 項關鍵物料，依據交期天數、日消耗率與安全存量計算 ROP，一旦低於門檻即自動產出採購請購單 (PR)。",
        "prompt": "使用 Antigravity 撰寫庫存自動監控與請購引擎。公式：ROP = (日平均耗用量 * 採購前置天數) + 安全存量。當現有庫存 <= ROP 時，自動產生建議採購量 EOQ 並開立 PR 請購單輸出至 generated_pr_orders.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 05 實作任務：ROP 再訂購點監控與自動開立請購單 (PR)
學生姓名：__________   學號：__________
"""
import json

def check_rop_and_generate_pr(stock_file="sample_data.json"):
    with open(stock_file, "r", encoding="utf-8") as f:
        materials = json.load(f)
        
    pr_list = []
    for mat in materials:
        sku = mat["sku"]
        name = mat["name"]
        current_stock = mat["current_stock"]
        daily_usage = mat["daily_usage"]
        lead_time_days = mat["lead_time_days"]
        safety_stock = mat["safety_stock"]
        eoq = mat["economic_order_qty"]
        
        rop = (daily_usage * lead_time_days) + safety_stock
        
        if current_stock <= rop:
            pr_qty = eoq
            pr_list.append({
                "pr_id": f"PR-{sku}-2026",
                "sku": sku,
                "name": name,
                "current_stock": current_stock,
                "rop_threshold": rop,
                "suggested_purchase_qty": pr_qty,
                "urgency": "HIGH" if current_stock < safety_stock else "NORMAL"
            })
            
    output = {
        "alert_count": len(pr_list),
        "purchase_requisitions": pr_list
    }
    
    with open("generated_pr_orders.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 庫存掃描完畢！共觸發 {len(pr_list)} 筆自動請購單。")

if __name__ == "__main__":
    check_rop_and_generate_pr()
''',
        "sample_data": [
            {"sku": "TIRE-01", "name": "26吋外胎", "current_stock": 45, "daily_usage": 10, "lead_time_days": 5, "safety_stock": 20, "economic_order_qty": 100},
            {"sku": "BRAKE-02", "name": "油壓碟煞組", "current_stock": 80, "daily_usage": 8, "lead_time_days": 4, "safety_stock": 15, "economic_order_qty": 50},
            {"sku": "CHAIN-09", "name": "11速高耐磨鏈條", "current_stock": 15, "daily_usage": 5, "lead_time_days": 7, "safety_stock": 10, "economic_order_qty": 60}
        ],
        "deliverable": "generated_pr_orders.json"
    },
    {
        "week": 6,
        "folder": "Week06_MM_採購三向比對稽核除錯引擎",
        "title": "採購與庫存 MM - 三向比對 (Three-Way Matching) 稽核器",
        "tag": "採購防弊與內控稽核",
        "scenario": "企業財務最大的舞弊與漏損常發生在付款階段。本週實作三向比對引擎，比對 PO (採購單)、GR (驗收單)、Invoice (供應商發票) 的品號、單價、數量與稅額，阻斷詐騙與溢付。",
        "prompt": "請在 Antigravity 中開發採購三向比對稽核程式。比對採購單 PO、驗收單 GR、供應商發票 Invoice。判定標準：1. 單價不可高於 PO 簽核價；2. 開票數量不可大於實際收料數量；3. 若差異在 1% 稅差內標記為小額稅差允許放行，若超過則拒絕過帳。將審計結果輸出為 audit_report.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 06 實作任務：採購三向比對 (Three-Way Matching) 稽核除錯引擎
學生姓名：__________   學號：__________
"""
import json

def audit_three_way_matching(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        cases = json.load(f)
        
    audit_results = []
    for case in cases:
        cid = case["case_id"]
        po = case["purchase_order"]
        gr = case["goods_receipt"]
        inv = case["invoice"]
        
        status = "PASSED"
        discrepancies = []
        
        if inv["unit_price"] > po["unit_price"]:
            status = "REJECTED"
            discrepancies.append(f"單價浮報：發票單價 ${inv['unit_price']} 高於 PO 簽核價 ${po['unit_price']}")
            
        if inv["qty"] > gr["accepted_qty"]:
            status = "REJECTED"
            discrepancies.append(f"開票數量溢開：發票數量 {inv['qty']} 大於品管驗收合格量 {gr['accepted_qty']}")
            
        expected_total = gr["accepted_qty"] * po["unit_price"]
        actual_total = inv["qty"] * inv["unit_price"]
        
        audit_results.append({
            "case_id": cid,
            "supplier": po["supplier"],
            "sku": po["sku"],
            "audit_status": status,
            "discrepancies": discrepancies,
            "expected_amount": expected_total,
            "invoice_amount": actual_total
        })
        
    with open("audit_report.json", "w", encoding="utf-8") as f:
        json.dump(audit_results, f, ensure_ascii=False, indent=2)
    print(f"[OK] 稽核比對完畢！已審查 {len(audit_results)} 筆交易案件，輸出 audit_report.json")

if __name__ == "__main__":
    audit_three_way_matching()
''',
        "sample_data": [
            {
                "case_id": "CASE-01",
                "purchase_order": {"po_id": "PO-101", "supplier": "台灣鏈條實業", "sku": "CHN-11", "qty": 100, "unit_price": 450},
                "goods_receipt": {"gr_id": "GR-501", "accepted_qty": 100},
                "invoice": {"inv_id": "INV-901", "qty": 100, "unit_price": 450}
            },
            {
                "case_id": "CASE-02",
                "purchase_order": {"po_id": "PO-102", "supplier": "捷峰金屬鑄造", "sku": "FRAME-AL", "qty": 50, "unit_price": 3200},
                "goods_receipt": {"gr_id": "GR-502", "accepted_qty": 40},
                "invoice": {"inv_id": "INV-902", "qty": 50, "unit_price": 3200}
            }
        ],
        "deliverable": "audit_report.json"
    },
    {
        "week": 7,
        "folder": "Week07_PP_多階BOM展開與損耗計算",
        "title": "生產規劃 PP - 樹狀多階 BOM 遞迴展開與成本加總",
        "tag": "生產規劃與控制 (PP)",
        "scenario": "一輛自行車由車架組、傳動組與煞車組構成，每個組件又由多個子零件構成。學生將使用 Antigravity 實作多階 BOM 展開遞迴演算法，計算生產 500 台自行車時各底層物料之總需求與標準成本。",
        "prompt": "請在 Antigravity 中實作多階物料清單 (BOM) 遞迴展開演算法。輸入父階產品代號與生產數量，考慮零件損耗率 (Scrap Rate: 需求量 * (1 + 損耗率))，展開所有最底層採購件之總數量與材料成本，產出 bom_explosion_result.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 07 實作任務：樹狀多階 BOM 遞迴展開與材料需求計算
學生姓名：__________   學號：__________
"""
import json

def explode_bom(target_sku, target_qty, bom_database):
    raw_material_requirements = {}
    
    def recursive_explode(sku, required_qty, current_level=1):
        item = bom_database.get(sku)
        if not item: return
        children = item.get("components", [])
        if not children:
            if sku not in raw_material_requirements:
                raw_material_requirements[sku] = {
                    "sku": sku, "name": item.get("name"), "total_qty": 0, "unit_cost": item.get("cost", 0)
                }
            raw_material_requirements[sku]["total_qty"] += required_qty
            return

        for child in children:
            child_sku = child["sku"]
            qty_per_parent = child["qty_per"]
            scrap_rate = child.get("scrap_rate", 0.0)
            child_demand = required_qty * qty_per_parent * (1.0 + scrap_rate)
            recursive_explode(child_sku, child_demand, current_level + 1)

    recursive_explode(target_sku, target_qty)
    return raw_material_requirements

def main():
    with open("sample_data.json", "r", encoding="utf-8") as f:
        bom_db = json.load(f)
    production_order = {"target_sku": "BIKE-EXPERT", "qty": 100}
    materials = explode_bom(production_order["target_sku"], production_order["qty"], bom_db)
    total_cost = sum(m["total_qty"] * m["unit_cost"] for m in materials.values())
    output = {
        "production_order": production_order,
        "total_material_cost": round(total_cost, 2),
        "required_parts": list(materials.values())
    }
    with open("bom_explosion_result.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] BOM 展開完畢！總材料成本: ${total_cost:,.2f}，輸出 bom_explosion_result.json")

if __name__ == "__main__":
    main()
''',
        "sample_data": {
            "BIKE-EXPERT": {
                "name": "高階碳纖登山車",
                "components": [
                    {"sku": "FRAME-CARBON", "qty_per": 1, "scrap_rate": 0.02},
                    {"sku": "WHEEL-SET", "qty_per": 2, "scrap_rate": 0.05}
                ]
            },
            "FRAME-CARBON": {
                "name": "碳纖車架主體",
                "components": [
                    {"sku": "RAW-CARBON-FIBER", "qty_per": 3.5, "scrap_rate": 0.1},
                    {"sku": "EPOXY-RESIN", "qty_per": 1.2, "scrap_rate": 0.05}
                ]
            },
            "WHEEL-SET": {
                "name": "26吋輪圈組",
                "components": [
                    {"sku": "RIM-ALU", "qty_per": 1, "scrap_rate": 0.01},
                    {"sku": "SPOKE-STEEL", "qty_per": 32, "scrap_rate": 0.03}
                ]
            },
            "RAW-CARBON-FIBER": {"name": "高模數碳紗", "cost": 1200},
            "EPOXY-RESIN": {"name": "航太級環氧樹脂", "cost": 350},
            "RIM-ALU": {"name": "陽極雙層鋁輪圈", "cost": 850},
            "SPOKE-STEEL": {"name": "不銹鋼高拉力輻條", "cost": 15}
        },
        "deliverable": "bom_explosion_result.json"
    },
    {
        "week": 8,
        "folder": "Week08_PP_MRP物料需求推導與排程",
        "title": "生產規劃 PP - 九宮格 MRP 淨需求推導與排程引擎",
        "tag": "物料需求規劃 (MRP)",
        "scenario": "工廠如果太早進料會造成資金積壓爆倉，太晚進料則會造成斷料停工。本週學生需實作標準 MRP 九宮格推導演算法，根據前置時間 (Lead Time) 倒排計畫開工與下單時間。",
        "prompt": "使用 Antigravity 實作 MRP 九宮格推導引擎。讀取主生產排程 (MPS)、現有庫存與採購前置天數。計算每期的總需求、預計入庫、淨需求、預計在手量、計畫產出 (PPO) 與計畫下單 (PPR)，產出 mrp_schedule_output.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 08 實作任務：MRP 物料需求九宮格淨需求推導
學生姓名：__________   學號：__________
"""
import json

def calculate_mrp(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        params = json.load(f)
        
    lead_time = params["lead_time_periods"]
    lot_size = params["lot_size"]
    periods = params["periods"]
    current_stock = params["initial_stock"]
    
    mrp_table = []
    for idx, p in enumerate(periods):
        gross_req = p["gross_requirements"]
        scheduled_receipt = p["scheduled_receipts"]
        available = current_stock + scheduled_receipt
        net_req = max(0, gross_req - available)
        
        planned_order_receipt = 0
        if net_req > 0:
            planned_order_receipt = ((net_req + lot_size - 1) // lot_size) * lot_size
            
        current_stock = available + planned_order_receipt - gross_req
        
        mrp_table.append({
            "period": idx + 1,
            "gross_req": gross_req,
            "scheduled_receipt": scheduled_receipt,
            "projected_on_hand": current_stock,
            "net_req": net_req,
            "planned_order_receipt": planned_order_receipt,
            "planned_order_release_period": max(1, idx + 1 - lead_time) if planned_order_receipt > 0 else None
        })
        
    with open("mrp_schedule_output.json", "w", encoding="utf-8") as f:
        json.dump({"sku": params["sku"], "mrp_grid": mrp_table}, f, ensure_ascii=False, indent=2)
    print(f"[OK] MRP 九宮格推導完畢！輸出 mrp_schedule_output.json")

if __name__ == "__main__":
    calculate_mrp()
''',
        "sample_data": {
            "sku": "FRAME-CARBON", "initial_stock": 25, "lead_time_periods": 2, "lot_size": 50,
            "periods": [
                {"gross_requirements": 30, "scheduled_receipts": 0},
                {"gross_requirements": 40, "scheduled_receipts": 50},
                {"gross_requirements": 60, "scheduled_receipts": 0},
                {"gross_requirements": 20, "scheduled_receipts": 0}
            ]
        },
        "deliverable": "mrp_schedule_output.json"
    },
    {
        "week": 9,
        "folder": "Week09_期中整合_端到端流程管線",
        "title": "期中綜合專案 - 端到端 ERP 跨模組資料流整合管線",
        "tag": "端到端整合 (End-to-End Pipeline)",
        "scenario": "檢驗前 8 週的學習成果。學生需用 Antigravity 串接：[SD 訂單] ➔ [檢查 ATP] ➔ [PP 展開 BOM] ➔ [MRP 計算淨需求] ➔ [MM 觸發請購 PR] 的完整全自動流程！",
        "prompt": "使用 Antigravity 建立端到端 ERP 串接管線。模擬客戶下單 200 台車，系統自動依序呼叫 ATP 驗證、BOM 展開、MRP 推導並產出採購請購單清單，最後生成一份完整的 end_to_end_pipeline_log.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 09 期中整合實戰：端到端 ERP 核心流程自動化管線
學生姓名：__________   學號：__________
"""
import json

def run_end_to_end_pipeline():
    print("=== [期中實戰] 啟動 ERP 端到端自動化管線 ===")
    order = {"order_id": "SO-MIDTERM-01", "sku": "BIKE-001", "order_qty": 150}
    current_inventory = 30
    atp_shortage = max(0, order["order_qty"] - current_inventory)
    
    bom_ratio = {"FRAME": 1, "WHEEL": 2, "CHAIN": 1}
    required_materials = {part: atp_shortage * ratio for part, ratio in bom_ratio.items()}
    
    pr_orders = [
        {"pr_id": f"PR-{part}-MID", "sku": part, "purchase_qty": qty, "lead_time_days": 7}
        for part, qty in required_materials.items()
    ]
    
    log = {
        "status": "PIPELINE_SUCCESS",
        "sales_order": order,
        "atp_shortage": atp_shortage,
        "bom_exploded": required_materials,
        "generated_purchase_requisitions": pr_orders
    }
    
    with open("end_to_end_pipeline_log.json", "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)
    print("[OK] 期中整合管線執行完成！輸出 end_to_end_pipeline_log.json")

if __name__ == "__main__":
    run_end_to_end_pipeline()
''',
        "sample_data": {"order_id": "SO-MIDTERM-01", "sku": "BIKE-001", "order_qty": 150},
        "deliverable": "end_to_end_pipeline_log.json"
    },
    {
        "week": 10,
        "folder": "Week10_FI_自動會計分錄與試算表",
        "title": "財務會計 FI - 自動總帳過帳與試算表 (Trial Balance) 產出",
        "tag": "財務與會計模組 (FI/CO)",
        "scenario": "企業每日產生採購進貨、銷貨出庫、水電雜支與員工報銷。本週學生使用 Antigravity 實作自動日記帳過帳引擎，檢核借貸平衡並產生會計期末試算表。",
        "prompt": "使用 Antigravity 建立總帳會計過帳程式。讀取 transactions.json，將每筆營運事件（銷貨、採購、付款）過帳至科目明細。計算各科目期末餘額，產出借貸平衡的試算表 trial_balance.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 10 實作任務：總帳過帳與借貸試算表 (Trial Balance) 生成
學生姓名：__________   學號：__________
"""
import json

def generate_trial_balance(tx_file="sample_data.json"):
    with open(tx_file, "r", encoding="utf-8") as f:
        transactions = json.load(f)
        
    ledger = {}
    for tx in transactions:
        for entry in tx.get("entries", []):
            acc = entry["account"]
            debit = entry.get("debit", 0)
            credit = entry.get("credit", 0)
            if acc not in ledger:
                ledger[acc] = {"debit_total": 0, "credit_total": 0}
            ledger[acc]["debit_total"] += debit
            ledger[acc]["credit_total"] += credit
            
    tb_rows = []
    total_debit = 0
    total_credit = 0
    for acc, amounts in sorted(ledger.items()):
        deb = amounts["debit_total"]
        crd = amounts["credit_total"]
        total_debit += deb
        total_credit += crd
        tb_rows.append({"account": acc, "debit": deb, "credit": crd})
        
    is_balanced = (total_debit == total_credit)
    output = {
        "is_balanced": is_balanced,
        "grand_total_debit": total_debit,
        "grand_total_credit": total_credit,
        "trial_balance_rows": tb_rows
    }
    with open("trial_balance.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 試算表生成完畢！借貸平衡: {is_balanced}，借方: ${total_debit:,}，貸方: ${total_credit:,}")

if __name__ == "__main__":
    generate_trial_balance()
''',
        "sample_data": [
            {
                "tx_id": "TX-01", "desc": "現金銷貨",
                "entries": [
                    {"account": "1101 銀行存款", "debit": 150000, "credit": 0},
                    {"account": "4111 銷貨收入", "debit": 0, "credit": 150000}
                ]
            },
            {
                "tx_id": "TX-02", "desc": "賒購原物料",
                "entries": [
                    {"account": "1210 原物料存貨", "debit": 80000, "credit": 0},
                    {"account": "2141 應付帳款", "debit": 0, "credit": 80000}
                ]
            }
        ],
        "deliverable": "trial_balance.json"
    },
    {
        "week": 11,
        "folder": "Week11_HR_考勤結算與薪資扣繳清冊",
        "title": "人力資源 HR - 考勤打卡分析與實發薪資自動清算",
        "tag": "人力資源管理 (HR)",
        "scenario": "企業每月需核算全體同仁之出缺勤打卡紀錄，計算平日加班、休假日加班與遲到曠職扣款，並扣除勞保、健保與所得稅代扣額，產出薪資發放清冊。",
        "prompt": "使用 Antigravity 實作 HR 薪資結算腳本。讀取員工打卡記錄與底薪設定，計算：1. 加班費 (時薪 * 1.34 / 1.67)；2. 勞健保個人負擔；3. 實發淨額 (Net Pay)。結果輸出至 payroll_summary.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
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
''',
        "sample_data": [
            {"id": "EMP01", "name": "陳建宏", "base_salary": 45000, "overtime_hours": 12, "late_minutes": 0},
            {"id": "EMP02", "name": "林雅筑", "base_salary": 52000, "overtime_hours": 4, "late_minutes": 30},
            {"id": "EMP03", "name": "張志強", "base_salary": 38000, "overtime_hours": 0, "late_minutes": 60}
        ],
        "deliverable": "payroll_summary.json"
    },
    {
        "week": 12,
        "folder": "Week12_SCM_長鞭效應量化與VMI補貨",
        "title": "供應鏈管理 SCM - 長鞭效應量化與 VMI 平抑補貨",
        "tag": "供應鏈管理 (SCM)",
        "scenario": "當終端顧客需求只微幅變動 10% 時，上游零件廠的訂單變異卻高達 80%！本週用 Antigravity 計算各層級訂單變異數比率 (Variance Ratio)，並透過 VMI 演算法減少庫存震盪。",
        "prompt": "使用 Antigravity 實作供應鏈長鞭效應分析腳本。讀取零售商、批發商與製造商訂單序列，計算各階層訂單變異數 (Variance)。展示啟用 VMI (供應商管理庫存) 資訊共享後，製造商端之訂單變異數如何下降超過 50%，輸出 bullwhip_analysis.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 12 實作任務：長鞭效應 (Bullwhip Effect) 量化與 VMI 資訊共享
學生姓名：__________   學號：__________
"""
import json
import statistics

def analyze_bullwhip(data_file="sample_data.json"):
    with open(data_file, "r", encoding="utf-8") as f:
        orders = json.load(f)
        
    retail = orders["retail_orders"]
    wholesale = orders["wholesale_orders"]
    factory = orders["factory_orders"]
    
    var_retail = statistics.variance(retail)
    var_wholesale = statistics.variance(wholesale)
    var_factory = statistics.variance(factory)
    bw_ratio_traditional = var_factory / var_retail
    
    vmi_factory_orders = [round(r * 1.05) for r in retail]
    var_vmi_factory = statistics.variance(vmi_factory_orders)
    bw_ratio_vmi = var_vmi_factory / var_retail
    
    output = {
        "traditional_variances": {
            "retail": round(var_retail, 2),
            "wholesale": round(var_wholesale, 2),
            "factory": round(var_factory, 2),
            "bullwhip_amplification_ratio": round(bw_ratio_traditional, 2)
        },
        "vmi_collaborative_results": {
            "factory_variance_with_vmi": round(var_vmi_factory, 2),
            "vmi_bullwhip_ratio": round(bw_ratio_vmi, 2),
            "variance_reduction_percentage": f"{round((1 - var_vmi_factory/var_factory)*100, 1)}%"
        }
    }
    
    with open("bullwhip_analysis.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 長鞭效應量化完成！傳統放大倍率: {bw_ratio_traditional:.2f}x, VMI 降幅: {output['vmi_collaborative_results']['variance_reduction_percentage']}")

if __name__ == "__main__":
    analyze_bullwhip()
''',
        "sample_data": {
            "retail_orders": [100, 105, 98, 102, 110, 95, 105, 100],
            "wholesale_orders": [95, 115, 90, 120, 125, 85, 115, 95],
            "factory_orders": [80, 140, 75, 150, 160, 60, 145, 80]
        },
        "deliverable": "bullwhip_analysis.json"
    },
    {
        "week": 13,
        "folder": "Week13_CRM_RFM客戶分群與價值模型",
        "title": "顧客關係管理 CRM - RFM 顧客金字塔模型分群實作",
        "tag": "客戶關係管理 (CRM)",
        "scenario": "企業 80% 的利潤往往來自 20% 的忠誠客戶。本週使用 Antigravity 讀取客戶歷史消費交易，計算最近購買日 (R)、消費頻率 (F)、消費總額 (M)，將客戶精準歸類至 VIP、潛力客戶或流失高風險客戶。",
        "prompt": "使用 Antigravity 實作 RFM 顧客分群模型。讀取 customer_transactions.json，計算每位客戶的 Recency (天數)、Frequency (次數) 與 Monetary (總額)。依分位數或門檻給予標籤（黃金VIP、重要挽留客、新客戶、沉睡客），輸出 rfm_customer_segments.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 13 實作任務：RFM 顧客價值金字塔模型分群
學生姓名：__________   學號：__________
"""
import json

def compute_rfm_segments(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        customers = json.load(f)
        
    segments = []
    for c in customers:
        cid = c["customer_id"]
        name = c["name"]
        recency = c["recency_days"]
        freq = c["frequency_count"]
        monetary = c["monetary_amount"]
        
        if recency <= 30 and freq >= 10 and monetary >= 100000:
            tag = "🌟 頂級核心 VIP"
            action = "指派專屬業務主管、提供 VIP 專屬量身折扣與優先配貨"
        elif recency <= 60 and freq >= 5:
            tag = "🚀 潛力高價值客"
            action = "推播新品資訊、發送滿額折價券提高客單價"
        elif recency > 90 and monetary >= 50000:
            tag = "⚠️ 重要挽留高風險客"
            action = "客服主動電訪關懷、了解流失原因並提供回流專案"
        else:
            tag = "💤 一般/沉睡客"
            action = "低成本 EDM 自動化喚醒推播"
            
        segments.append({
            "customer_id": cid, "name": name,
            "rfm_scores": {"r": recency, "f": freq, "m": monetary},
            "segment_tag": tag, "recommended_strategy": action
        })
        
    with open("rfm_customer_segments.json", "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)
    print(f"[OK] RFM 客戶分群完成！共分析 {len(segments)} 位客戶，輸出 rfm_customer_segments.json")

if __name__ == "__main__":
    compute_rfm_segments()
''',
        "sample_data": [
            {"customer_id": "VIP-01", "name": "台北極限單車行", "recency_days": 12, "frequency_count": 18, "monetary_amount": 250000},
            {"customer_id": "POT-02", "name": "台中捷輪單車精品", "recency_days": 45, "frequency_count": 8, "monetary_amount": 88000},
            {"customer_id": "RISK-03", "name": "高雄休閒單車俱樂部", "recency_days": 120, "frequency_count": 12, "monetary_amount": 180000},
            {"customer_id": "NORM-04", "name": "花蓮漫遊租車行", "recency_days": 150, "frequency_count": 2, "monetary_amount": 15000}
        ],
        "deliverable": "rfm_customer_segments.json"
    },
    {
        "week": 14,
        "folder": "Week14_BI_營運資料ETL與戰情儀表板",
        "title": "商業智慧 BI - 營運大數據 ETL 與經營層 KPI 產出",
        "tag": "商業智慧與大數據 (BI)",
        "scenario": "總經理每週一早會需要綜觀全公司的經營績效（總營收、毛利率、庫存週轉天數、交期達交率）。本週實作 ETL (Extract-Transform-Load) 管線，將分散資料彙整為即時 KPI 戰情報表。",
        "prompt": "使用 Antigravity 實作 BI 資料抽取與指標計算腳本。提取銷售交易與庫存紀錄，轉換並計算：1. 總營收與毛利率；2. 訂單準時達交率 (OTD %)；3. 滯銷品庫存警示。最後輸出 executive_dashboard_kpis.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 14 實作任務：BI 商業智慧 ETL 與高階經營戰情指標計算
學生姓名：__________   學號：__________
"""
import json

def run_bi_etl_pipeline(data_file="sample_data.json"):
    with open(data_file, "r", encoding="utf-8") as f:
        raw = json.load(f)
        
    sales = raw["sales_orders"]
    inventory = raw["inventory_snapshots"]
    
    total_revenue = sum(s["revenue"] for s in sales)
    total_cost = sum(s["cost"] for s in sales)
    gross_profit = total_revenue - total_cost
    gross_margin_pct = round((gross_profit / total_revenue) * 100, 2) if total_revenue > 0 else 0
    
    on_time_count = sum(1 for s in sales if s.get("actual_delivery_date") <= s.get("promise_delivery_date"))
    otd_rate = round((on_time_count / len(sales)) * 100, 2)
    
    slow_moving_items = [item for item in inventory if item.get("days_in_warehouse", 0) > 90]
    
    dashboard = {
        "kpi_metrics": {
            "total_revenue": total_revenue,
            "total_gross_profit": gross_profit,
            "gross_margin_percentage": f"{gross_margin_pct}%",
            "on_time_delivery_rate": f"{otd_rate}%",
            "slow_moving_skus_count": len(slow_moving_items)
        },
        "slow_moving_alerts": slow_moving_items
    }
    
    with open("executive_dashboard_kpis.json", "w", encoding="utf-8") as f:
        json.dump(dashboard, f, ensure_ascii=False, indent=2)
    print(f"[OK] BI ETL 執行完畢！營收: ${total_revenue:,}，毛利率: {gross_margin_pct}%，達交率: {otd_rate}%")

if __name__ == "__main__":
    run_bi_etl_pipeline()
''',
        "sample_data": {
            "sales_orders": [
                {"order_id": "SO-01", "revenue": 120000, "cost": 75000, "promise_delivery_date": "2026-05-01", "actual_delivery_date": "2026-05-01"},
                {"order_id": "SO-02", "revenue": 85000, "cost": 50000, "promise_delivery_date": "2026-05-03", "actual_delivery_date": "2026-05-05"},
                {"order_id": "SO-03", "revenue": 210000, "cost": 130000, "promise_delivery_date": "2026-05-10", "actual_delivery_date": "2026-05-09"}
            ],
            "inventory_snapshots": [
                {"sku": "OLD-GEAR-01", "name": "庫存 8 速齒盤", "qty": 150, "days_in_warehouse": 120},
                {"sku": "NEW-TIRE-02", "name": "新款防刺外胎", "qty": 80, "days_in_warehouse": 25}
            ]
        },
        "deliverable": "executive_dashboard_kpis.json"
    },
    {
        "week": 15,
        "folder": "Week15_系統導入藍圖與SRS規格生成",
        "title": "系統導入方法論 - 痛點訪談轉 TO-BE 系統規格書 (SRS)",
        "tag": "ERP 系統導入方法論",
        "scenario": "顧問導入 ERP 成功關鍵在於從現況 (AS-IS) 差距分析 (Gap Analysis) 轉化為目標 (TO-BE) 系統需求規格書。本週使用 Antigravity 自動剖析企業訪談逐字稿並產出結構化規格書。",
        "prompt": "你是一位資深 ERP 導入顧問。使用 Antigravity 讀取 interview_transcript.txt 中的各部門痛點訪談，進行 Gap Analysis，並自動生成包含 5 大模組需求與人機協同機制的 TO-BE 系統需求規格書 srs_specification.md。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 15 實作任務：訪談逐字稿剖析與 TO-BE 系統需求規格書 (SRS) 自動產出
學生姓名：__________   學號：__________
"""
import json

def generate_srs(input_file="sample_data.json"):
    with open(input_file, "r", encoding="utf-8") as f:
        interviews = json.load(f)
        
    srs_content = "# 企業 ERP 系統升級與導入需求規格書 (TO-BE SRS)\\n\\n"
    srs_content += "## 1. 企業現況差距分析 (Gap Analysis)\\n\\n"
    
    for dept in interviews.get("departments", []):
        srs_content += f"### 【{dept['name']}】\\n"
        srs_content += f"- **AS-IS 現況痛點**：{dept['as_is_pain']}\\n"
        srs_content += f"- **TO-BE 解決方案**：{dept['to_be_solution']}\\n"
        srs_content += f"- **對應 ERP 模組**：`{dept['erp_module']}`\\n\\n"
        
    srs_content += "## 2. 導入上線關鍵成功因素 (CSF)\\n"
    srs_content += "1. 高階主管全力支持與組織變革承諾\\n"
    srs_content += "2. 堅持標準功能導入，客製化率低於 15%\\n"
    srs_content += "3. 主檔資料 (Master Data) 全面清洗防呆\\n"
    
    with open("srs_specification.md", "w", encoding="utf-8") as f:
        f.write(srs_content)
    print("[OK] SRS 需求規格書生成完畢！輸出 srs_specification.md")

if __name__ == "__main__":
    generate_srs()
''',
        "sample_data": {
            "departments": [
                {"name": "業務部", "as_is_pain": "手動以 LINE/Email 接單，庫存不準經常發生超賣客訴", "to_be_solution": "導入 SD ATP 可承諾量即時試算，並串接 AI 訂單解析", "erp_module": "SD 銷售配銷"},
                {"name": "採購部", "as_is_pain": "發票常與收料單數量不符，財務人工核對費時且常發生溢付款", "to_be_solution": "啟用 MM 三向比對稽核引擎，自動勾稽 PO ✕ GR ✕ Invoice", "erp_module": "MM 採購庫存"},
                {"name": "生管部", "as_is_pain": "手動 Excel 算料耗時兩天，經常算錯造成現場停工待料", "to_be_solution": "導入 PP 多階 BOM 展開與九宮格 MRP 自動排程", "erp_module": "PP 生產規劃"}
            ]
        },
        "deliverable": "srs_specification.md"
    },
    {
        "week": 16,
        "folder": "Week16_Agentic_AI_ReAct自主訂單處理",
        "title": "Agentic AI 核心實戰 - ReAct 自主企業訂單處理 Agent",
        "tag": "Agentic AI 實務核心",
        "scenario": "本週為全課程最核心前瞻實作！學生將在 Antigravity 中實作完整的 ReAct (Thought ➔ Action ➔ Observation ➔ Decision) 自主 Agent，自主調用 ERP API 並具備主管審批安全防線。",
        "prompt": "使用 Antigravity 實作一個完整的 ReAct Agent。給定客戶發來的訂單文字需求，Agent 必須：1. Thought: 思考需萃取的實體；2. Action: 呼叫 erp_check_stock 工具；3. Observation: 獲得庫存數據；4. Guardrails: 若訂單總金額 > 10 萬元，觸發 Human-in-the-Loop 主管核准；5. Final Decision: 產出正式訂單，記錄完整思考軌跡至 agent_react_trace.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
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
    print("\\n[OK] Agentic AI 執行完畢！完整 ReAct 推理日誌已輸出至 agent_react_trace.json")

if __name__ == "__main__":
    main()
''',
        "sample_data": {"customer_id": "CUST-TW-88", "sku": "BIKE-PRO", "qty": 15, "unit_price": 28000},
        "deliverable": "agent_react_trace.json"
    },
    {
        "week": 17,
        "folder": "Week17_Agentic_AI_企業內控合規審計",
        "title": "Agentic AI 實戰 - 企業內控異常交易合規自動審計 Agent",
        "tag": "AI 內控與合規審計",
        "scenario": "企業舞弊多半隱藏在深夜改價、拆單規避主管簽核或越權放行中。本週讓學生使用 Antigravity 實作主動式 Audit Agent，自動掃描 ERP 交易稽核軌跡 (Audit Log)，揪出異常並產出警示通報。",
        "prompt": "使用 Antigravity 建立合規監控 Agent。分析 erp_audit_logs.json，檢查三項違規特徵：1. 拆單規避主管簽核（同一客戶同天多筆小額訂單剛好低於 10 萬）；2. 員工與客戶銀行帳號雷同（舞弊自肥）；3. 非上班時間未授權修改單價。將違規案件輸出至 compliance_audit_alert.json。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 17 實作任務：Agentic AI 企業內控與交易軌跡自動審計
學生姓名：__________   學號：__________
"""
import json

def audit_compliance(log_file="sample_data.json"):
    with open(log_file, "r", encoding="utf-8") as f:
        logs = json.load(f)
        
    violations = []
    for entry in logs:
        log_id = entry["log_id"]
        tx_type = entry["tx_type"]
        user = entry["operator"]
        amount = entry.get("amount", 0)
        time_str = entry.get("timestamp", "")
        
        hour = int(time_str.split(" ")[1].split(":")[0])
        if hour >= 23 or hour <= 5:
            violations.append({
                "log_id": log_id, "type": "OFF_HOURS_MODIFICATION", "severity": "HIGH",
                "detail": f"操作員 {user} 於非工作時間 {time_str} 執行 {tx_type}，金額: ${amount:,}"
            })
            
        if 95000 <= amount < 100000 and "UNAPPROVED" in entry.get("flags", []):
            violations.append({
                "log_id": log_id, "type": "STRUCTURING_AVOID_APPROVAL", "severity": "CRITICAL",
                "detail": f"操作員 {user} 開立金額 ${amount:,} 之單據，疑似刻意拆單規避 10 萬主管審批"
            })
            
    output = {
        "total_logs_scanned": len(logs),
        "total_violations_found": len(violations),
        "violations": violations
    }
    with open("compliance_audit_alert.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"[OK] 合規審查完畢！共掃描 {len(logs)} 筆軌跡，抓出 {len(violations)} 筆異常，輸出 compliance_audit_alert.json")

if __name__ == "__main__":
    audit_compliance()
''',
        "sample_data": [
            {"log_id": "LOG-01", "tx_type": "PO_UPDATE", "operator": "USER_DEV", "amount": 45000, "timestamp": "2026-06-01 14:20:00", "flags": []},
            {"log_id": "LOG-02", "tx_type": "PRICE_OVERRIDE", "operator": "USER_SALES_03", "amount": 80000, "timestamp": "2026-06-01 02:15:30", "flags": []},
            {"log_id": "LOG-03", "tx_type": "SO_CREATE", "operator": "USER_SALES_05", "amount": 99500, "timestamp": "2026-06-01 16:45:00", "flags": ["UNAPPROVED"]}
        ],
        "deliverable": "compliance_audit_alert.json"
    },
    {
        "week": 18,
        "folder": "Week18_期末成果_AI_ERP綜合專案發布",
        "title": "期末成果發表 - 企業 AI-ERP 整合專案成果發布與驗收",
        "tag": "期末專案發表 (10% 專題)",
        "scenario": "整合全學期 18 週所學之 ERP 核心模組與 Agentic AI 技術，各組學生使用 Antigravity 打包完成包含流程圖、ReAct 執行成果與量化效益之企劃書與成果包。",
        "prompt": "使用 Antigravity 整理你的期末專題。將組別、選定之企業流程痛點、所設計之 Agentic AI 工作流架構、驗證數據與預期效益指標，自動生成最終驗收報告 final_project_report.md 與驗證包。",
        "starter_code": '''# -*- coding: utf-8 -*-
"""
Week 18 期末成果驗收：AI 賦能 ERP 流程優化專案發布
學生姓名：__________   學號：__________
"""
import json

def finalize_project_submission(config_file="sample_data.json"):
    with open(config_file, "r", encoding="utf-8") as f:
        proj = json.load(f)
        
    md_content = f"""# 萬能科技大學 企業資源規劃 (ERP) ✕ Agentic AI 期末專題成果報告

## 專案主題：{proj.get('project_title')}
- **組別**：{proj.get('group_name')}
- **組員名單**：{proj.get('team_members')}
- **指導教授**：邱俊維 博士

---

### 一、企業痛點與改善動機
{proj.get('pain_points')}

### 二、所建構之 Agentic AI 核心架構與工具調用 (Tool Calling)
{proj.get('agent_architecture')}

### 三、量化改善效益評估 (KPIs)
- 作業時間改善：由原本 20 分鐘縮減為 1.5 秒 (提升 99%)
- 錯誤率改善：消除手動登打，降至 0.05% 以下
- 達交率預估提升：由 82% 提升至 95%

### 四、結論與證照職涯加分
本組已完成全真題庫練習，全員報考 AI-ERP 相關專業認證，落實課堂實作與證照加分！
"""

    with open("final_project_report.md", "w", encoding="utf-8") as f:
        f.write(md_content)
    with open("submission_status.json", "w", encoding="utf-8") as f:
        json.dump({"status": "SUBMITTED", "timestamp": "2026-06-25 17:00:00", "score_eligible": True}, f, indent=2)
    print("[OK] 期末成果發布成功！輸出 final_project_report.md 與 submission_status.json")

if __name__ == "__main__":
    finalize_project_submission()
''',
        "sample_data": {
            "project_title": "基於 Agentic AI 之 O2C 智慧訂單自動化與庫存 ATP 調度系統",
            "group_name": "第 3 組",
            "team_members": "王小明 (1150101)、李大華 (1150102)、張雅婷 (1150103)",
            "pain_points": "傳統業務助理每日需耗費 3 小時手工處理非結構化訂單，打錯品號與超賣頻傳。",
            "agent_architecture": "採用 ReAct 模式，包含 Email 監聽 ➔ LLM 實體抽取 ➔ ERP API 查庫存與信用 ➔ 10 萬元審批 Guardrail ➔ 自動建單過帳。"
        },
        "deliverable": "final_project_report.md 與 submission_status.json"
    }
]

def generate_all_projects():
    print("[START] 開始為 18 週各建立專屬 Antigravity 實戰專案包...")
    projects_metadata = []
    
    for m in MISSIONS:
        w = m["week"]
        folder_name = f"{w:02d}_{m['folder']}"
        week_dir = os.path.join(PROJECTS_DIR, folder_name)
        os.makedirs(week_dir, exist_ok=True)
        
        # 1. Write README.md (Mission Brief)
        readme_path = os.path.join(week_dir, "README.md")
        readme_content = f"""# 第 {w:02d} 週 Antigravity 電腦教室實戰任務：{m['title']}

**授課班級：** 進企四系4甲 ｜ **授課時間：** 週四 16:20 ~ 17:50 ｜ **授課地點：** 電腦教室  
**授課教師：** 邱俊維 博士 ｜ **核心模組：** {m['tag']}  
**★ 課堂激勵：** 考取 AI 賦能 ERP 或相關證照直接加分！

---

## 🏢 企業模擬業務情境
{m['scenario']}

---

## 🤖 Antigravity AI Agent 提示詞 (請直接複製貼入 Antigravity)

```text
{m['prompt']}
```

---

## 💻 本週實戰操作步驟 (一人一機動手做出東西)

1. **開啟終端機或 Antigravity**，切換至本週目錄：
   ```bash
   cd {folder_name}
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
   - 確認目錄下已成功產生：`{m['deliverable']}`。
   - 執行驗證腳本：
     ```bash
     python verify.py
     ```

---

## 🎯 預期交付成果與驗收標準
- **必備產出檔案**：`{m['deliverable']}`
- **驗收標準**：執行無錯誤，資料格式正確，數值借貸平衡或邏輯推導合規！
"""
        with open(readme_path, "w", encoding="utf-8") as f:
            f.write(readme_content)
            
        # 2. Write starter.py
        starter_path = os.path.join(week_dir, "starter.py")
        with open(starter_path, "w", encoding="utf-8") as f:
            f.write(m["starter_code"])
            
        # 3. Write sample_data.json
        data_path = os.path.join(week_dir, "sample_data.json")
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(m["sample_data"], f, ensure_ascii=False, indent=2)
            
        # 4. Write verify.py
        verify_path = os.path.join(week_dir, "verify.py")
        verify_content = f"""# -*- coding: utf-8 -*-
\"\"\"
第 {w:02d} 週實作成果自動驗證腳本
\"\"\"
import os
import sys

deliv_files = [f.strip() for f in "{m['deliverable']}".split("與")]
passed = True
print(f"=== [驗證作業] 第 {w:02d} 週: {m['title']} ===")

for df in deliv_files:
    if os.path.exists(df):
        sz = os.path.getsize(df)
        if sz > 0:
            print(f"[PASS] 成果檔案 {{df}} 存在且非空 ({{sz}} bytes)")
        else:
            print(f"[FAIL] 成果檔案 {{df}} 為 0 bytes 空檔！")
            passed = False
    else:
        print(f"[FAIL] 尚未找到產出檔案: {{df}}，請先執行 python starter.py 產生！")
        passed = False

if passed:
    print("\\n[SUCCESS] 恭喜！第 {w:02d} 週 Antigravity 實作任務 100% 驗收通過！")
else:
    print("\\n[FAILED] 驗收未通過，請檢查程式碼或使用 Antigravity 協助除錯！")
"""
        with open(verify_path, "w", encoding="utf-8") as f:
            f.write(verify_content)
            
        # 5. Build ZIP package for web download
        zip_filename = f"Week{w:02d}_Antigravity_Project.zip"
        zip_filepath = os.path.join(STATIC_ZIP_DIR, zip_filename)
        
        with zipfile.ZipFile(zip_filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(week_dir):
                for file in files:
                    file_p = os.path.join(root, file)
                    arcname = os.path.relpath(file_p, os.path.dirname(week_dir))
                    zipf.write(file_p, arcname)
                    
        print(f"[OK] 第 {w:02d} 週專案建立完畢並打包: {zip_filename}")
        
        projects_metadata.append({
            "week": w,
            "folder_name": folder_name,
            "title": m["title"],
            "tag": m["tag"],
            "scenario": m["scenario"],
            "prompt": m["prompt"],
            "deliverable": m["deliverable"],
            "zip_url": f"/static/projects/{zip_filename}",
            "zip_filename": zip_filename,
            "starter_code_preview": m["starter_code"][:400] + "..."
        })
        
    meta_path = os.path.join(DATA_DIR, "antigravity_missions.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(projects_metadata, f, ensure_ascii=False, indent=2)
        
    print(f"\\n[DONE] 全部 18 週 Antigravity 實戰專案產生完畢！中繼檔保存在 {meta_path}")

if __name__ == "__main__":
    generate_all_projects()
