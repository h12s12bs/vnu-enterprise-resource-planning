# -*- coding: utf-8 -*-
"""
Parse 张纬良《企业资源规划》测验题库.docx and generate structured questions.json
"""
import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os

CH_NUM_MAP = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
}

def extract_paragraphs(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        tree = ET.fromstring(z.read('word/document.xml'))
        paras = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            t = ''.join([n.text for n in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if n.text])
            if t.strip():
                paras.append(t.strip())
        return paras

def split_options(text):
    pattern = r'\(([1-4])\)\s*'
    parts = re.split(pattern, text)
    if len(parts) >= 9:
        stem = parts[0].strip()
        options = {}
        for i in range(1, len(parts), 2):
            opt_num = parts[i]
            opt_val = parts[i+1].strip().rstrip('；;。')
            options[opt_num] = opt_val
        return stem, [options.get('1',''), options.get('2',''), options.get('3',''), options.get('4','')]
    else:
        return text, ["選項 1", "選項 2", "選項 3", "選項 4"]

def main():
    paras = extract_paragraphs('張緯良著_企業資源規劃：企業e化之營運管理 4e [前程]/測驗題庫.docx')
    chapters = []
    curr_ch = None
    mode = None

    for p in paras:
        m_ch = re.match(r'^第([一二三四五六七八九十]+)章\s*(.*)', p)
        if m_ch:
            ch_int = CH_NUM_MAP.get(m_ch.group(1), 1)
            curr_ch = {
                'ch_num': ch_int,
                'ch_title': m_ch.group(2).strip(),
                'mc': [],
                'qa': []
            }
            chapters.append(curr_ch)
            mode = None
            continue
        
        if '一、選擇題' in p or '選擇題' in p:
            mode = 'mc'
            continue
        if '二、問答題' in p or '問答題' in p:
            mode = 'qa'
            continue
        
        if not curr_ch:
            continue
        
        if mode == 'mc':
            m_ans = re.match(r'^(\d+)\.\s*\(\s*([1-4A-Da-d])\s*\)', p)
            if m_ans:
                ans = m_ans.group(2)
                if ans.upper() == 'A': ans = '1'
                elif ans.upper() == 'B': ans = '2'
                elif ans.upper() == 'C': ans = '3'
                elif ans.upper() == 'D': ans = '4'
                curr_ch['mc'].append({
                    'num': int(m_ans.group(1)),
                    'ans': int(ans),
                    'raw_text': ''
                })
            elif curr_ch['mc'] and not curr_ch['mc'][-1]['raw_text']:
                curr_ch['mc'][-1]['raw_text'] = p
            elif curr_ch['mc'] and curr_ch['mc'][-1]['raw_text']:
                curr_ch['mc'][-1]['raw_text'] += ' ' + p
        elif mode == 'qa':
            m_qa = re.match(r'^(\d+)\.\s*(.*)', p)
            if m_qa:
                curr_ch['qa'].append({
                    'num': int(m_qa.group(1)),
                    'question': m_qa.group(2).strip(),
                    'answer': ''
                })
            elif curr_ch['qa']:
                if p.startswith('答：') or p.startswith('答:'):
                    curr_ch['qa'][-1]['answer'] = p[2:].strip()
                else:
                    curr_ch['qa'][-1]['answer'] += ' ' + p

    print(f"Parsed {len(chapters)} chapters from textbook docx.")
    
    final_questions = []
    q_id = 1

    ch_week_map = {
        1: [1],
        2: [2],
        3: [15],
        4: [15],
        5: [15],
        6: [5, 12],
        7: [3, 4],
        8: [7, 8],
        9: [5, 6],
        10: [7],
        11: [11],
        12: [10],
        13: [10],
        14: [15],
        15: [14, 15]
    }

    module_map = {
        1: 'ERP 導論與 IT',
        2: 'ERP 概論與 BPR',
        3: '系統導入與專案',
        4: '系統評選',
        5: '系統建置',
        6: '存貨管理 (MM)',
        7: '銷售與配銷 (SD)',
        8: '生產規劃 (PP)',
        9: '採購與付款 (MM)',
        10: '在製品與現場控制',
        11: '人力資源 (HR)',
        12: '財務會計 (FI)',
        13: '管理會計 (CO)',
        14: '企業變革管理',
        15: '未來展望與新興技術'
    }

    for ch in chapters:
        ch_num = ch['ch_num']
        ch_title = ch['ch_title']
        module = module_map.get(ch_num, 'ERP')
        weeks = ch_week_map.get(ch_num, [1])

        for item in ch['mc']:
            stem, opts = split_options(item['raw_text'])
            correct_opt_idx = item['ans'] - 1
            correct_text = opts[correct_opt_idx] if 0 <= correct_opt_idx < len(opts) else ""
            explanation = f"【正確答案：({item['ans']}) {correct_text}】\n本題選自《企業資源規劃》第{ch_num}章「{ch_title}」，檢測對{module}重點之掌握。"

            final_questions.append({
                'id': q_id,
                'chapter': ch_num,
                'chapter_title': ch_title,
                'module': module,
                'weeks': weeks,
                'type': 'single_choice',
                'question': stem,
                'options': opts,
                'answer': item['ans'],
                'explanation': explanation,
                'source': '張緯良教材題庫'
            })
            q_id += 1

    print(f"Total textbook multiple choice questions: {len(final_questions)}")

    ai_questions = [
        {
            'question': '在現代 AI 數位轉型中，AI 技術的自主能力（Agentic AI）與傳統流程自動化（RPA）最大的不同在於：',
            'options': [
                'Agentic AI 只能處理結構化 Excel 表格，RPA 可處理任何多模態資料',
                'Agentic AI 具備自主感知、目標推理規劃、工具呼叫與自我除錯能力，而非僅依循硬編碼規則',
                'Agentic AI 不需要任何企業資料庫或 API 即可獨立運作',
                'Agentic AI 完全取代人類，不需要任何 Human-in-the-Loop 審核機制'
            ],
            'answer': 2,
            'explanation': 'Agentic AI 具有感知、自主規劃（Planning/Reasoning）、工具調用（Tool Calling）與適應環境的能力，不同於傳統 RPA 僅能執行既定死板的腳本流程。',
            'module': 'Agentic AI 核心架構',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [1, 16]
        },
        {
            'question': '在 ERP 系統整合 AI 的四層架構中，負責調度 AI Agents 執行實際作業並串接企業系統工具的是哪一層？',
            'options': [
                '基礎設施層 (Infrastructure Layer)',
                '資料層 (Data Layer)',
                '模型層 (Model Layer)',
                '流程層 (Process Layer)'
            ],
            'answer': 4,
            'explanation': '依據 CERPS AI 賦能 ERP 架構，流程層著重於將 AI 能力嵌入 ERP 的實際作業流程中，透過 AI Agents 自主調用 ERP API 執行任務。',
            'module': 'AI ERP 架構',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [1, 16]
        },
        {
            'question': '企業在設計 Order-to-Cash (O2C) 的智慧銷售 Agent 時，當客戶傳來非結構化採購 Email，Agent 第一個執行的核心動作應為：',
            'options': [
                '直接過帳扣減庫存',
                '利用 LLM 進行語意解析與實體萃取（客戶名稱、品號、數量、交期）',
                '立即發送請款發票給客戶',
                '指派工廠產線停機'
            ],
            'answer': 2,
            'explanation': '智慧銷售 Agent 透過大語言模型進行非結構化文字剖析，將 Email 轉換為結構化訂單資料 (JSON)，以便後續呼叫 ERP API。',
            'module': '銷售與配銷 (SD) / Agent',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [3, 4, 16]
        },
        {
            'question': '在 ERP 銷售訂單確認前，系統必須先執行 ATP 檢查，所謂 ATP (Available-to-Promise) 是指：',
            'options': [
                '已付款金額',
                '可承諾量（現有庫存＋預計到貨－已保留量）',
                '安全存量的三倍值',
                '供應商最大產能'
            ],
            'answer': 2,
            'explanation': 'ATP (Available-to-Promise，可承諾交期/數量) 是在滿足現有訂單後，未來某特定期間內仍可向顧客承諾出貨的未被保留數量。',
            'module': '銷售與配銷 (SD)',
            'chapter': 7,
            'chapter_title': '銷售與收帳管理',
            'weeks': [3, 4]
        },
        {
            'question': '採購發票驗證中的「三向比對 (Three-way Matching)」係指哪三項單據的相互勾稽？',
            'options': [
                '報價單 (Quotation)、合約書 (Contract)、請款單 (Claim)',
                '採購單 (PO)、驗收入庫單 (GR)、供應商發票 (Invoice)',
                '銷售單 (SO)、出貨單 (DO)、銷貨發票 (Sales Invoice)',
                '工令單 (WO)、領料單 (Issue)、完工入庫單 (Receipt)'
            ],
            'answer': 2,
            'explanation': '三向比對核心在於：PO (採購價格與條款) ✕ GR (實際收料驗收數量) ✕ Invoice (供應商請款金額與數量) 互相核對無誤後方可付款。',
            'module': '採購與付款 (MM)',
            'chapter': 9,
            'chapter_title': '採購與付款管理',
            'weeks': [5, 6]
        },
        {
            'question': '設計一個執行三向比對的 AI 財務核帳 Agent 時，為落實資安與財務內部控制，下列哪項設計最符合「人機協同 (Human-in-the-Loop)」原則？',
            'options': [
                '不論任何金額與價差，AI 皆百分之百直接過帳放行',
                '當比對金額完全一致時可設定小額自動過帳；但若價差超過容許門檻（如 2% 或大於 10 萬元）時，系統自動阻擋並指派財務主管人工複核',
                'AI 發現金額不符時，自動修改採購單單價以強行吻合發票',
                '將所有發票退回供應商不予處理'
            ],
            'answer': 2,
            'explanation': '內控機制要求設定安全閾值 (Guardrails)，正常小額匹配自動化，異常或重大金額則由 Human-in-the-Loop 介入審核。',
            'module': 'Agentic AI 治理與內控',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [6, 16]
        },
        {
            'question': '在製造業 PP 模組中，MRP (物料需求規劃) 運算的三大核心主要輸入資料檔不包括下列何者？',
            'options': [
                '主生產排程 (MPS)',
                '物料清單 (BOM)',
                '庫存狀態主檔 (Inventory Status File)',
                '員工考勤請假紀錄檔 (Attendance File)'
            ],
            'answer': 4,
            'explanation': 'MRP 運算三大核心輸入：主生產排程 (MPS)、物料清單 (BOM)、庫存狀態檔 (現有量、在途量、安全庫存等)。員工考勤為 HR 模組資料。',
            'module': '生產規劃 (PP)',
            'chapter': 8,
            'chapter_title': '生產規劃',
            'weeks': [7, 8]
        },
        {
            'question': '物料需求規劃 (MRP) 淨需求 (Net Requirements) 計算公式，通常為：',
            'options': [
                '毛需求 ＋ 現有庫存 ＋ 在途訂單',
                '毛需求 － 現有庫存 － 預計在途到貨 ＋ 安全存量',
                '毛需求 ✕ 安全存量',
                '安全存量 ÷ 採購前置時間'
            ],
            'answer': 2,
            'explanation': '淨需求 ＝ 毛需求 － (現有庫存 ＋ 預計到貨量) ＋ 安全庫存。當可用庫存不足以支應毛需求時即產生淨需求。',
            'module': '生產規劃 (PP)',
            'chapter': 8,
            'chapter_title': '生產規劃',
            'weeks': [8]
        },
        {
            'question': '供應鏈中常見的「長鞭效應 (Bullwhip Effect)」是指什麼現象？',
            'options': [
                '工廠工人因皮鞭管理而提高生產效率',
                '下游零售端顧客需求的微小變動，沿著供應鏈往上游（批發商、製造商、原料商）傳遞時，訂單波動幅度被逐層放大的現象',
                '供應商交期越來越準時的現象',
                '物流運輸車輛越來越長的趨勢'
            ],
            'answer': 2,
            'explanation': '長鞭效應指供應鏈上游因缺乏終端需求透明度、安全庫存堆疊與批次訂購，導致需求波動沿著供應鏈逐級劇烈放大。',
            'module': '供應鏈管理 (SCM)',
            'chapter': 6,
            'chapter_title': '存貨管理',
            'weeks': [12]
        },
        {
            'question': '為緩解供應鏈的長鞭效應，企業常導入哪種跨組織庫存管理模式？',
            'options': [
                'VMI (Vendor Managed Inventory，供應商管理庫存)',
                '提高安全庫存量至一年份',
                '隱匿銷售 POS 資料不讓供應商知道',
                '全面取消任何安全庫存'
            ],
            'answer': 1,
            'explanation': 'VMI (Vendor Managed Inventory) 讓供應商掌握下游庫存與銷售動態，主動進行補貨決策，消除資訊失真，大幅緩解長鞭效應。',
            'module': '供應鏈管理 (SCM)',
            'chapter': 6,
            'chapter_title': '存貨管理',
            'weeks': [12]
        },
        {
            'question': '在 Agentic AI 的常見架構中，「ReAct 模式」代表的是哪種推理與執行框架？',
            'options': [
                'React.js 前端網頁渲染框架',
                'Reasoning (推理/思考) 與 Acting (行動/調用工具) 相互交替運作的架構',
                'Reactive Programming 響應式程式設計',
                'Real-time Action 即時動作捕捉'
            ],
            'answer': 2,
            'explanation': 'ReAct 模式（Reasoning + Acting）讓 AI Agent 在每一步先進行 Thought (思考分析)，接著採取 Action (呼叫 ERP API)，再 Observation (觀察反饋)，持續迭代直到達成目標。',
            'module': 'Agentic AI 核心架構',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [16]
        },
        {
            'question': '在企業建構 AI-Ready ERP 系統時，何種資料治理策略對於避免「垃圾進，垃圾出 (Garbage In, Garbage Out)」至關重要？',
            'options': [
                '主檔資料清理 (Master Data Cleanliness) 與統一編碼原則',
                '盡可能收集更多未經檢驗的網路公開社群貼文',
                '允許所有員工自由隨意修改單據歷史記錄',
                '停用關聯式資料庫的欄位防呆限制'
            ],
            'answer': 1,
            'explanation': '高品質、標準化、高勾稽性的主檔資料（客戶、廠商、物料品號 BOM）是 AI 模型與 Agent 能否正確理解並執行業務的核心基石。',
            'module': 'AI ERP 資料治理',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [1, 14, 16]
        },
        {
            'question': '在 ERP 系統中，銷貨出庫過帳時，會計模組會自動產生哪一組借貸分錄？',
            'options': [
                '借：應付帳款，貸：現金',
                '借：銷貨成本，貸：存貨',
                '借：存貨，貸：銷貨成本',
                '借：股本，貸：保留盈餘'
            ],
            'answer': 2,
            'explanation': '銷貨出貨發料時，實體存貨減少（貸：存貨），同時結轉當期銷貨成本（借：銷貨成本）。待開立發票時才借：應收帳款，貸：銷貨收入。',
            'module': '財務會計 (FI)',
            'chapter': 12,
            'chapter_title': '財務會計',
            'weeks': [4, 10]
        },
        {
            'question': '管理會計 (CO) 與財務會計 (FI) 最大的差異在於：',
            'options': [
                'FI 面向內部管理決策，CO 面向外部投資人與稅捐稽徵機關',
                'FI 依循公認會計準則 (GAAP) 產出對外三大財務報表；CO 提供內部主管成本中心、利潤中心分析以供控制與決策',
                'FI 不需要借貸平衡，CO 必須嚴格借貸平衡',
                'FI 只有大公司需要，CO 只有個人獨資需要'
            ],
            'answer': 2,
            'explanation': '財務會計 (FI) 依 GAAP/IFRS 提供外部利害關係人（如資產負債表、綜合損益表）；管理會計 (CO) 供內部各階層主管成本分攤、利潤衡量及營運決策。',
            'module': '管理會計 (CO)',
            'chapter': 13,
            'chapter_title': '管理會計',
            'weeks': [10]
        },
        {
            'question': '物料清單 (Bill of Materials, BOM) 在 ERP PP 模組中的主要功能為：',
            'options': [
                '記錄員工薪資扣繳明細清單',
                '結構化描述產出一單位母件成品所需之所有子件物料、半成品及其組合數量配比',
                '記錄公司所有供應商的銀行帳號',
                '客戶的信用評等報告表'
            ],
            'answer': 2,
            'explanation': 'BOM 表為產品結構清單，明確定義構成一個最終成品所需的各階層半成品、原料品號、耗用量與損耗率，為 MRP 展開的核心依據。',
            'module': '生產規劃 (PP)',
            'chapter': 8,
            'chapter_title': '生產規劃',
            'weeks': [7]
        },
        {
            'question': '下列何種生產型態最適合導入 ATO (Assemble-to-Order，組裝生產) 模式？',
            'options': [
                '大量標準化水泥袋裝生產',
                '客製化筆記型電腦（消費者自選 CPU、RAM、SSD 規格後再行組裝）',
                '全訂製豪華遊艇設計打造 (ETO)',
                '預先生產大量存放於通路的礦泉水 (MTS)'
            ],
            'answer': 2,
            'explanation': 'ATO (Assemble-to-Order) 事先備妥模組化零組件，待收到客戶具體配備訂單後在極短前置時間內完成組裝出貨，常見於 PC 電腦產業。',
            'module': '生產規劃 (PP)',
            'chapter': 8,
            'chapter_title': '生產規劃',
            'weeks': [7]
        },
        {
            'question': '若企業要將客服對話紀錄與退換貨規章整合進 AI Agent，讓 Agent 能即時回答正確政策並避免模型幻覺 (Hallucination)，最推薦採用的技術架構是：',
            'options': [
                '完全依賴 LLM 的通用預訓練知識',
                '檢索增強生成 (Retrieval-Augmented Generation, RAG) 串接企業內部知識庫',
                '每天讓所有客服人員重新背誦規章',
                '關閉所有 AI 客服，改回純人工打字'
            ],
            'answer': 2,
            'explanation': 'RAG (檢索增強生成) 能夠在 AI 回答前提先檢索企業最權威的規章或 ERP 內部資料，提供給 LLM 作為上下文，大幅降低幻覺並保證資訊最新性。',
            'module': '顧客關係管理 (CRM) / AI',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [13, 16]
        },
        {
            'question': '在企業流程再造 (BPR, Business Process Reengineering) 的核心思想中，強調組織應打破部門穀倉，轉而關注：',
            'options': [
                '單一部門的行政主管權威',
                '以「端到端 (End-to-End)」顧客價值創造為核心的流程整合',
                '增加紙本表單簽核關卡以確保零失誤',
                '採購更便宜的單機版試算軟體'
            ],
            'answer': 2,
            'explanation': 'BPR 主張拋棄傳統以職能劃分的部門思維，重新從整體端到端流程（如 Order-to-Cash, Procure-to-Pay）進行徹底重新設計。',
            'module': '企業流程管理 (BPR)',
            'chapter': 2,
            'chapter_title': '企業資源規劃概說',
            'weeks': [2]
        },
        {
            'question': '在 ERP 系統建置過程中，最關鍵且常被視為導入成敗首要關鍵成功因素 (CSF) 為：',
            'options': [
                '高階主管的全力支持與承諾 (Top Management Support)',
                '採購全世界最昂貴頂級的伺服器硬體',
                '完全不調整原有工作習慣，全部要求 ERP 系統配合客製化修改',
                '不進行任何員工教育訓練以節省預算'
            ],
            'answer': 1,
            'explanation': 'ERP 導入涉及跨部門權責調整與作業習慣變革，高階主管的持續承諾、決策定案與資源投入，是所有 CSF 調查中公認最關鍵的要素。',
            'module': '系統導入與專案',
            'chapter': 3,
            'chapter_title': '導入方法與程序',
            'weeks': [15]
        },
        {
            'question': '智慧採購代理 (Procurement Agent) 在供應鏈協同作業中，可以自主執行的任務通常包含下列何者？',
            'options': [
                '監控原物料即時安全存量、根據歷史交期自動向合格供應商發出詢價比價請求，並草擬 PO',
                '未經董事會授權私自變更公司資本額',
                '隨意變更公司產品配方機密',
                '私自開立支票轉帳至個人帳戶'
            ],
            'answer': 1,
            'explanation': '智慧採購 Agent 能依據庫存與生產計畫，自動分析合約條款與歷史績效，自動化執行詢比議價並生成單據草稿，供採購經理最後覆核。',
            'module': '採購與庫存 (MM) / Agent',
            'chapter': 16,
            'chapter_title': 'AI 時代的 ERP：AI Agent 與流程自動化',
            'weeks': [5, 16]
        }
    ]

    for item in ai_questions:
        final_questions.append({
            'id': q_id,
            'chapter': item['chapter'],
            'chapter_title': item['chapter_title'],
            'module': item['module'],
            'weeks': item['weeks'],
            'type': 'single_choice',
            'question': item['question'],
            'options': item['options'],
            'answer': item['answer'],
            'explanation': f"【正確答案：({item['answer']}) {item['options'][item['answer']-1]}】\n" + item['explanation'],
            'source': 'CERPS AI-ERP 認證精選'
        })
        q_id += 1

    os.makedirs('data', exist_ok=True)
    output_path = 'data/questions.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully generated {len(final_questions)} questions in {output_path}!")

if __name__ == '__main__':
    main()
