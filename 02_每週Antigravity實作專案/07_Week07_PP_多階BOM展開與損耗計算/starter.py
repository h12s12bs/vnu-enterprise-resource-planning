# -*- coding: utf-8 -*-
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
