# -*- coding: utf-8 -*-
"""
萬能科技大學 - 企業資源規劃 (ERP) ✕ Agentic AI 互動教學平台
授課教師：邱俊維 博士
"""
import os
import sys
import json
import socket
import random
from datetime import datetime
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

def load_json_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def get_local_ip():
    """Get LAN IP address for classroom sharing"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # doesn't need to be reachable
        s.connect(('8.8.8.8', 1))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return '127.0.0.1'

# In-memory storage for classroom submissions (optional local persistence)
CLASSROOM_RECORDS = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/system_info')
def system_info():
    local_ip = get_local_ip()
    port = 5000
    return jsonify({
        'status': 'online',
        'course': '萬能科技大學 - 企業資源規劃 (11501)',
        'class_name': '進企四系4甲',
        'schedule': '每週四 16:20 ~ 17:50',
        'classroom': '電腦教室',
        'instructor': '邱俊維 博士',
        'office_hours': '週一 15:00~16:00 (育英樓 J801-1 研究室)',
        'bonus_policy': '考取 AI 賦能 ERP 或 ERP 相關證照直接加分',
        'server_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'local_ip': local_ip,
        'classroom_url': f"http://{local_ip}:{port}",
        'total_students_active': len(CLASSROOM_RECORDS)
    })

@app.route('/api/curriculum')
def get_curriculum():
    data = load_json_file('curriculum.json')
    return jsonify(data)

@app.route('/api/questions')
def get_questions():
    all_q = load_json_file('questions.json')
    
    # Query parameters
    week = request.args.get('week', type=int)
    chapter = request.args.get('chapter', type=int)
    module = request.args.get('module')
    count = request.args.get('count', type=int)
    shuffle = request.args.get('shuffle', default='true').lower() == 'true'
    exam_type = request.args.get('exam_type') # 'midterm_50', 'final_100', 'weekly'

    filtered = all_q
    if week:
        filtered = [q for q in filtered if week in q.get('weeks', [])]
    elif chapter:
        filtered = [q for q in filtered if q.get('chapter') == chapter]
    elif module:
        filtered = [q for q in filtered if q.get('module') == module]
    elif exam_type == 'midterm_50':
        # Part 1 chapters CH01 ~ CH07
        filtered = [q for q in filtered if q.get('chapter', 1) <= 7 or q.get('chapter') == 16]
        count = 50
    elif exam_type == 'final_100':
        # Full bank
        count = 100

    if shuffle:
        filtered = list(filtered)
        random.shuffle(filtered)

    if count and count > 0:
        filtered = filtered[:count]

    return jsonify({
        'total_matched': len(filtered),
        'questions': filtered
    })

@app.route('/api/agent_templates')
def get_agent_templates():
    data = load_json_file('agent_templates.json')
    return jsonify(data)

@app.route('/api/antigravity_missions')
def get_antigravity_missions():
    """Retrieve 18 weeks Antigravity hands-on projects metadata"""
    data = load_json_file('antigravity_missions.json')
    return jsonify(data)

@app.route('/download_project/<int:week>')
def download_project_zip(week):
    """Download week specific Antigravity starter project ZIP package"""
    zip_name = f"Week{week:02d}_Antigravity_Project.zip"
    proj_dir = os.path.join(app.static_folder, 'projects')
    return send_from_directory(proj_dir, zip_name, as_attachment=True)


@app.route('/api/submit_quiz', methods=['POST'])
def submit_quiz():
    """Score quiz submissions and provide diagnostic feedback"""
    payload = request.get_json() or {}
    student_id = payload.get('student_id', '匿名學生')
    student_name = payload.get('student_name', '訪客')
    answers = payload.get('answers', {}) # {question_id: selected_option_int}
    
    all_q_map = {q['id']: q for q in load_json_file('questions.json')}
    
    total = len(answers)
    if total == 0:
        return jsonify({'error': '未提供任何作答'}), 400

    correct_count = 0
    details = []
    module_stats = {}

    for q_id_str, user_ans in answers.items():
        q_id = int(q_id_str)
        q = all_q_map.get(q_id)
        if not q:
            continue
        
        is_correct = (user_ans == q['answer'])
        if is_correct:
            correct_count += 1

        # Track module performance
        mod = q.get('module', '綜合 ERP')
        if mod not in module_stats:
            module_stats[mod] = {'total': 0, 'correct': 0}
        module_stats[mod]['total'] += 1
        if is_correct:
            module_stats[mod]['correct'] += 1

        details.append({
            'id': q_id,
            'question': q['question'],
            'options': q['options'],
            'user_answer': user_ans,
            'correct_answer': q['answer'],
            'is_correct': is_correct,
            'explanation': q['explanation'],
            'module': mod,
            'chapter': q['chapter']
        })

    score = round((correct_count / total) * 100, 1)
    passed = score >= 70.0

    record = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'student_id': student_id,
        'student_name': student_name,
        'score': score,
        'correct_count': correct_count,
        'total': total,
        'passed': passed
    }
    CLASSROOM_RECORDS.append(record)

    return jsonify({
        'score': score,
        'correct_count': correct_count,
        'total': total,
        'passed': passed,
        'module_stats': module_stats,
        'details': details
    })

@app.route('/api/simulate_agent', methods=['POST'])
def simulate_agent():
    """Simulate Agentic AI ReAct execution for classroom demonstration"""
    payload = request.get_json() or {}
    template_id = payload.get('template_id')
    custom_scenario = payload.get('custom_scenario')
    
    templates = load_json_file('agent_templates.json')
    matched = next((t for t in templates if t['id'] == template_id), None)
    
    if matched:
        return jsonify({
            'status': 'success',
            'agent_name': matched['name'],
            'trace': matched['simulated_trace']
        })
    
    # Generic AI Simulation trace for custom inputs
    custom_trace = [
        {"step": 1, "type": "thought", "content": f"收到業務觸發：{custom_scenario[:100]}... 開始進行意圖辨識與實體抽取。"},
        {"step": 2, "type": "action", "tool": "erp_query_master_data", "input": {"query": "驗證物料與往來客戶主檔"}},
        {"step": 3, "type": "observation", "result": "ERP API 回傳：主檔匹配成功，狀態正常有效。"},
        {"step": 4, "type": "thought", "content": "主檔驗證通過，執行商業邏輯與金額安全門檻防呆檢核。"},
        {"step": 5, "type": "guardrail", "content": "【安全邊界與內部控制檢查】各項參數均在授權範圍內，準備呼叫 ERP API 完成單據過帳。"},
        {"step": 6, "type": "action", "tool": "erp_post_transaction", "input": {"status": "COMMITTED"}},
        {"step": 7, "type": "final_output", "content": "【自主執行完畢】已在 ERP 完成自動單據生成與過帳，日誌已妥善存查。"}
    ]
    return jsonify({
        'status': 'success',
        'agent_name': '自訂 Agentic AI 流程',
        'trace': custom_trace
    })

@app.route('/api/leaderboard')
def get_leaderboard():
    """Show classroom live participation"""
    recent = list(reversed(CLASSROOM_RECORDS[-30:]))
    return jsonify({
        'count': len(CLASSROOM_RECORDS),
        'records': recent
    })

SLIDES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '01_每週教學簡報_PPT')

@app.route('/api/slides')
def list_slides():
    """List all available 18 weeks PPTX slides"""
    slides = []
    if os.path.exists(SLIDES_DIR):
        for f in sorted(os.listdir(SLIDES_DIR)):
            if f.endswith('.pptx'):
                fpath = os.path.join(SLIDES_DIR, f)
                slides.append({
                    'filename': f,
                    'url': f'/slides/{f}',
                    'size_kb': round(os.path.getsize(fpath) / 1024, 1)
                })
    return jsonify(slides)

@app.route('/slides/<path:filename>')
def download_slide(filename):
    """Download PPTX presentation slide"""
    return send_from_directory(SLIDES_DIR, filename, as_attachment=True)


if __name__ == '__main__':
    local_ip = get_local_ip()
    port = 5000
    print("=" * 70)
    print("🚀 萬能科技大學【企業資源規劃 (ERP) ✕ Agentic AI】教學互動平台已啟動！")
    print(f"👨‍🏫 授課教師：邱俊維 博士")
    print(f"💻 本機連線網址：http://localhost:{port}")
    print(f"📡 電腦教室學生連線網址：http://{local_ip}:{port}")
    print("=" * 70)
    app.run(host='0.0.0.0', port=port, debug=False)
