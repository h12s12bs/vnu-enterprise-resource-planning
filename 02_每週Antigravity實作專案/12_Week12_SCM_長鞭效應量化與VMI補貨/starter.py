# -*- coding: utf-8 -*-
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
