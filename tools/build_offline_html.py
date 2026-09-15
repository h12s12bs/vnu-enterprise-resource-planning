# -*- coding: utf-8 -*-
"""
Build standalone offline HTML file with embedded data
"""
import json

def main():
    with open('templates/index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    with open('static/css/style.css', 'r', encoding='utf-8') as f:
        css = f.read()

    with open('static/js/app.js', 'r', encoding='utf-8') as f:
        js = f.read()

    with open('data/curriculum.json', 'r', encoding='utf-8') as f:
        curriculum = f.read()

    with open('data/questions.json', 'r', encoding='utf-8') as f:
        questions = f.read()

    with open('data/agent_templates.json', 'r', encoding='utf-8') as f:
        templates = f.read()

    with open('data/antigravity_missions.json', 'r', encoding='utf-8') as f:
        missions = f.read()

    # Replace css link with inline style
    html = html.replace('<link rel="stylesheet" href="/static/css/style.css">', f'<style>{css}</style>')

    # Inlined data script
    inlined_data = f"""
<script>
  window.OFFLINE_CURRICULUM = {curriculum};
  window.OFFLINE_QUESTIONS = {questions};
  window.OFFLINE_TEMPLATES = {templates};
  window.OFFLINE_MISSIONS = {missions};
</script>
"""

    # In offline version, ensure fallbacks trigger immediately
    js_offline = js.replace(
        "curriculumData = await res.json();",
        "curriculumData = await res.json();\n    if(!curriculumData || curriculumData.length===0) curriculumData = window.OFFLINE_CURRICULUM || [];"
    )
    js_offline = js_offline.replace(
        "questionsData = data.questions || [];",
        "questionsData = data.questions || [];\n      if(!questionsData || questionsData.length===0) questionsData = window.OFFLINE_QUESTIONS || [];"
    )
    js_offline = js_offline.replace(
        "agentTemplates = await res.json();",
        "agentTemplates = await res.json();\n    if(!agentTemplates || agentTemplates.length===0) agentTemplates = window.OFFLINE_TEMPLATES || [];"
    )

    js_offline = js_offline.replace(
        "console.warn('Using local fallback curriculum');",
        "curriculumData = window.OFFLINE_CURRICULUM || [];"
    )
    js_offline = js_offline.replace(
        "console.warn('Questions API unavailable');",
        "questionsData = window.OFFLINE_QUESTIONS || []; document.getElementById('total-questions-stat').textContent = questionsData.length;"
    )
    js_offline = js_offline.replace(
        "console.warn('Using local fallback templates');",
        "agentTemplates = window.OFFLINE_TEMPLATES || [];"
    )

    full_html = html.replace('<script src="/static/js/app.js"></script>', inlined_data + f'<script>{js_offline}</script>')

    # 1. Output root index.html (for GitHub Pages deployment)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(full_html)
    print("Successfully generated root index.html (for GitHub Pages)!")

    # 2. Output 平台首頁(單機離線直接點開).html (for offline desktop double-click)
    output_path = '平台首頁(單機離線直接點開).html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"Successfully generated {output_path}!")

if __name__ == '__main__':
    main()
