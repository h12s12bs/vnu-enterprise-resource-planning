/**
 * 萬能科技大學 - 企業資源規劃 (ERP) ✕ Agentic AI 互動教學平台
 * 前端核心邏輯腳本
 * 授課教師：邱俊維 博士
 */

// ==================== 全域狀態 ====================
let curriculumData = [];
let questionsData = [];
let agentTemplates = [];
let antigravityMissions = [];

let currentWeek = 1;
let currentTab = 'curriculum';
let activeSimulator = 'atp';

let activeExam = {
  mode: 'weekly',
  questions: [],
  userAnswers: {},
  timerInterval: null,
  timeLeft: 0,
  startTime: null
};

let studentProfile = {
  id: '',
  name: '',
  badges: [],
  mistakeIds: []
};

// ==================== Firebase 雲端驗證與身分整合 ====================
const firebaseConfig = {
  apiKey: "AIzaSyCSQ1SfZ67UYZ_4F4JazSC5QptA1ZY1UdU",
  authDomain: "vnu-creative-11501.firebaseapp.com",
  projectId: "vnu-creative-11501",
  storageBucket: "vnu-creative-11501.firebasestorage.app",
  messagingSenderId: "192871776919",
  appId: "1:192871776919:web:47aea414ec5af5774b5fd2",
  measurementId: "G-X90WGR0GV2"
};

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;
let isFirebaseAvailable = false;
let currentFirebaseUser = null;
let isTeacherUser = false;

function initFirebase() {
  if (isFirebaseAvailable && firebaseAuth) return;
  if (typeof firebase !== 'undefined' && firebase.initializeApp) {
    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebaseApp = firebase.initializeApp(firebaseConfig);
      } else {
        firebaseApp = firebase.app();
      }
      firebaseAuth = firebase.auth();
      firestoreDb = firebase.firestore();
      isFirebaseAvailable = true;
      console.log('✅ Firebase 初始化成功 (專案: vnu-creative-11501)');

      // 監聽 Redirect 登入結果
      if (firebaseAuth.getRedirectResult) {
        firebaseAuth.getRedirectResult().then((result) => {
          if (result && result.user) {
            console.log('Google 重定向登入成功:', result.user.email);
          }
        }).catch((err) => {
          console.warn('Redirect notice:', err);
        });
      }

      // 監聽 Auth 登入狀態變更
      firebaseAuth.onAuthStateChanged(async (user) => {
        currentFirebaseUser = user;
        const loginBtn = document.getElementById('btn-google-login');
        const authBox = document.getElementById('user-auth-box');
        const avatarImg = document.getElementById('user-avatar-img');
        const avatarIcon = document.getElementById('user-avatar-icon');
        const dropdownEmail = document.getElementById('dropdown-user-email');
        const dropdownRole = document.getElementById('dropdown-user-role');
        const teacherMenu = document.getElementById('teacher-export-menu-item');

        if (user) {
          console.log('👤 Google 使用者已登入:', user.email, user.uid);
          const userEmail = (user.email || '').toLowerCase().trim();
          const teacherEmails = ['jimchiu@vnu.edu.tw', 'kevin87332000', 'kevin87332000@gmail.com', 'jimchiu', 'jimchiu@mail.vnu.edu.tw', 'vnuemba@gmail.com', 'h12s12bs', 'h12s12bs@gmail.com'];
          isTeacherUser = teacherEmails.some(em => userEmail.includes(em.toLowerCase()));

          if (loginBtn) loginBtn.classList.add('hidden');
          if (authBox) authBox.classList.remove('hidden');

          if (user.photoURL && avatarImg) {
            avatarImg.src = user.photoURL;
            avatarImg.classList.remove('hidden');
            if (avatarIcon) avatarIcon.classList.add('hidden');
          }

          if (dropdownEmail) dropdownEmail.textContent = user.email || '';

          if (isTeacherUser) {
            studentProfile.id = 'TEACHER';
            studentProfile.name = '邱俊維 博士';
            studentProfile.role = 'teacher';
            if (dropdownRole) dropdownRole.textContent = '👑 授課教師 (邱俊維 博士)';
            if (teacherMenu) teacherMenu.classList.remove('hidden');
            updateStudentHeader();

            if (firestoreDb) {
              firestoreDb.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email || '',
                studentId: 'TEACHER',
                studentName: '邱俊維 博士',
                role: 'teacher',
                course: '11501企業資源規劃',
                class: '進企四系4甲',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              }, { merge: true }).catch(() => {});
            }
          } else {
            if (dropdownRole) dropdownRole.textContent = '萬能 ERP 學員';
            if (teacherMenu) teacherMenu.classList.add('hidden');

            if (firestoreDb) {
              try {
                const docSnap = await firestoreDb.collection('users').doc(user.uid).get();
                if (docSnap.exists) {
                  const data = docSnap.data();
                  if (data.studentId) studentProfile.id = data.studentId;
                  if (data.studentName) studentProfile.name = data.studentName;
                  localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));
                  updateStudentHeader();
                } else {
                  // 首次登入自動跳出登記視窗
                  setTimeout(() => openStudentModal(), 500);
                }
              } catch (e) {
                console.warn('Firestore load warning:', e);
              }
            }
          }
        } else {
          // 未登入
          if (loginBtn) loginBtn.classList.remove('hidden');
          if (authBox) authBox.classList.add('hidden');
          loadStudentProfile();
        }
        if (window.lucide) window.lucide.createIcons();
      });

    } catch (e) {
      console.warn('⚠️ Firebase 初始化警告:', e);
      isFirebaseAvailable = false;
    }
  } else {
    console.log('離線或未載入 Firebase SDK，使用本機模式');
  }
}

function loginWithGoogle() {
  if (!isFirebaseAvailable || !firebaseAuth) {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      initFirebase();
    }
  }
  if (!isFirebaseAvailable || !firebaseAuth) {
    alert('Firebase 雲端服務載入中或處於離線狀態，系統已為您直接開啟學籍登記視窗！');
    openStudentModal();
    return;
  }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    firebaseAuth.signInWithPopup(provider).catch((error) => {
      if (error.code === 'auth/popup-closed-by-user') return;
      if (error.code === 'auth/popup-blocked') {
        const tryRedirect = confirm('⚠️ 瀏覽器攔截了 Google 登入視窗！\n\n是否改用頁面跳轉 (Redirect) 方式登入？');
        if (tryRedirect) {
          firebaseAuth.signInWithRedirect(provider);
        }
        return;
      }
      alert('Google 登入提示：' + (error.message || error));
    });
  } catch (err) {
    console.error('登入啟動錯誤:', err);
    alert('啟動登入失敗：' + err.message);
  }
}

function logoutUser() {
  if (firebaseAuth) {
    firebaseAuth.signOut().then(() => {
      alert('您已安全登出 Google 帳號。');
    });
  } else {
    alert('已清除登入狀態。');
  }
}

function toggleUserDropdown(force) {
  const menu = document.getElementById('user-dropdown-menu');
  if (!menu) return;
  if (typeof force === 'boolean') {
    menu.classList.toggle('hidden', !force);
  } else {
    menu.classList.toggle('hidden');
  }
}

document.addEventListener('click', (e) => {
  const box = document.getElementById('user-auth-box');
  const menu = document.getElementById('user-dropdown-menu');
  if (box && menu && !box.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

async function exportStudentRecordsToExcel() {
  if (!firestoreDb) {
    alert('雲端資料庫未連線');
    return;
  }
  try {
    const snap = await firestoreDb.collection('users').get();
    let csv = '\uFEFF學號,姓名,Email,身分,修習課程,最後更新時間\n';
    snap.forEach(doc => {
      const u = doc.data();
      const updated = u.updatedAt && u.updatedAt.toDate ? u.updatedAt.toDate().toLocaleString('zh-TW') : '';
      csv += `"${u.studentId || ''}","${u.studentName || ''}","${u.email || ''}","${u.role || 'student'}","${u.course || '11501企業資源規劃'}","${updated}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `萬能ERP課程_學生名冊與學習進度_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('匯出失敗：' + err.message);
  }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
  try { initFirebase(); } catch(e) { console.warn('initFirebase error', e); }
  loadStudentProfile();
  await initSystemInfo();
  await loadCurriculum();
  await loadQuestions();
  await loadAgentTemplates();
  await loadAntigravityMissions();
  await loadSlidesData();

  // Initialize UI
  renderWeekSelectors();
  renderAntigravitySelectors();
  showWeekDetail(1);
  showAntigravityDetail(1);
  calcATP();
  loadMatchingScenario();
  updateBadgeDisplay();
  renderMistakesList();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// ==================== 學生身分與成就系統 ====================
function loadStudentProfile() {
  const saved = localStorage.getItem('vnu_erp_student');
  if (saved) {
    try {
      studentProfile = JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  if (!studentProfile.badges) studentProfile.badges = [];
  if (!studentProfile.mistakeIds) studentProfile.mistakeIds = [];
  updateStudentHeader();
}

function saveStudentProfile() {
  const idInput = document.getElementById('input-student-id').value.trim();
  const nameInput = document.getElementById('input-student-name').value.trim();
  if (!nameInput) {
    alert('請輸入姓名！');
    return;
  }
  studentProfile.id = idInput || '未設定';
  studentProfile.name = nameInput;
  localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));

  // 若已登入 Firebase，同步至 Firestore
  if (currentFirebaseUser && firestoreDb) {
    firestoreDb.collection('users').doc(currentFirebaseUser.uid).set({
      uid: currentFirebaseUser.uid,
      email: currentFirebaseUser.email || '',
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      photoURL: currentFirebaseUser.photoURL || '',
      course: '11501企業資源規劃',
      class: '進企四系4甲',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => {
      console.log('✅ 學生學籍已同步至 Firebase 雲端');
    }).catch(err => console.warn('Firestore sync warning:', err));
  }

  updateStudentHeader();
  closeStudentModal();
  unlockBadge('student_registered', '🎓 萬能 ERP 學員', '成功登記學號與姓名');
}

function updateStudentHeader() {
  const headerName = document.getElementById('header-student-name');
  const badgeCount = document.getElementById('header-badge-count');
  const achieveName = document.getElementById('achieve-name-display');
  const achieveId = document.getElementById('achieve-id-display');
  const avatarChar = document.getElementById('achieve-avatar-char');

  if (studentProfile.name) {
    headerName.textContent = studentProfile.name;
    achieveName.textContent = studentProfile.name;
    avatarChar.textContent = studentProfile.name.charAt(0);
  } else {
    headerName.textContent = '設定座號姓名';
    achieveName.textContent = '萬能科大學生';
    avatarChar.textContent = '學';
  }
  achieveId.textContent = `學號：${studentProfile.id || '未設定'} ｜ 累計答題次數：${studentProfile.totalAnswered || 0}`;
  badgeCount.textContent = studentProfile.badges.length;
}

function unlockBadge(id, title, desc) {
  if (!studentProfile.badges.find(b => b.id === id)) {
    studentProfile.badges.push({ id, title, desc, unlockedAt: new Date().toLocaleDateString() });
    localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));
    updateStudentHeader();
    updateBadgeDisplay();
  }
}

function updateBadgeDisplay() {
  const grid = document.getElementById('badges-grid');
  if (!grid) return;

  const ALL_BADGES = [
    { id: 'student_registered', icon: 'graduation-cap', title: '萬能 ERP 學員', desc: '完成個人身分設定' },
    { id: 'first_quiz_pass', icon: 'award', title: '初試啼聲', desc: '完成首次隨堂測驗' },
    { id: 'atp_master', icon: 'shopping-cart', title: 'ATP 調度大師', desc: '成功試算銷售可承諾量' },
    { id: 'audit_detective', icon: 'scale', title: '三向核帳神探', desc: '識破採購發票單價與數量陷阱' },
    { id: 'mrp_calculator', icon: 'table', title: 'MRP 運算專家', desc: '完成自行車 BOM 淨需求推導' },
    { id: 'bullwhip_conqueror', icon: 'trending-up', title: '長鞭效應平抑者', desc: '啟用 VMI 撫平供應鏈震盪' },
    { id: 'agentic_planner', icon: 'bot', title: 'Agentic AI 架構師', desc: '成功規劃並模擬企業 AI Agent 流程' },
    { id: 'cerps_certified', icon: 'trophy', title: 'CERPS 模擬檢定合格', desc: '期末 100 題模擬考突破 70 分' }
  ];

  grid.innerHTML = ALL_BADGES.map(b => {
    const isUnlocked = studentProfile.badges.some(ub => ub.id === b.id);
    return `
      <div class="p-4 rounded-xl border ${isUnlocked ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-60'} flex flex-col items-center text-center space-y-2">
        <div class="w-12 h-12 rounded-full ${isUnlocked ? 'bg-amber-500 text-white shadow' : 'bg-slate-300 text-slate-500'} flex items-center justify-center text-xl">
          <i data-lucide="${b.icon}" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="font-bold text-xs ${isUnlocked ? 'text-amber-900' : 'text-slate-600'}">${b.title}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">${b.desc}</div>
        </div>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-500'}">
          ${isUnlocked ? '已解鎖 ✨' : '未解鎖'}
        </span>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openStudentModal() {
  document.getElementById('input-student-id').value = studentProfile.id || '';
  document.getElementById('input-student-name').value = studentProfile.name || '';
  document.getElementById('student-modal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('student-modal').classList.add('hidden');
}

// ==================== 系統資訊與區域網路連線 ====================
async function initSystemInfo() {
  try {
    const res = await fetch('/api/system_info');
    if (res.ok) {
      const info = await res.json();
      const ipElem = document.getElementById('header-lan-ip');
      if (ipElem) ipElem.textContent = `http://${info.local_ip}:5000`;
      const badge = document.getElementById('classroom-ip-badge');
      if (badge) badge.classList.remove('hidden');
      window.lanClassroomUrl = info.classroom_url;
    }
  } catch (e) {
    const ipElem = document.getElementById('header-lan-ip');
    if (ipElem) ipElem.textContent = '本機單機模式';
  }
}

function copyClassroomUrl() {
  const url = window.lanClassroomUrl || window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert(`已複製連線網址：\n${url}`);
  });
}

// ==================== TAB 切換 ====================
function switchTab(tabId) {
  currentTab = tabId;
  const tabs = ['curriculum', 'antigravity', 'simulators', 'agentic', 'exam', 'achievements'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tabId);
    if (navBtn) navBtn.classList.toggle('active', t === tabId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) window.lucide.createIcons();
}

// ==================== 18 週進度地圖與 Antigravity 專案 ====================
async function loadCurriculum() {
  try {
    const res = await fetch('/api/curriculum');
    if (res.ok) {
      curriculumData = await res.json();
    }
  } catch (e) {
    console.warn('Using local fallback curriculum');
  }
}

async function loadAntigravityMissions() {
  try {
    const res = await fetch('/api/antigravity_missions');
    if (res.ok) {
      antigravityMissions = await res.json();
    }
  } catch (e) {
    console.warn('Using local fallback antigravity missions');
  }
  if (!antigravityMissions || antigravityMissions.length === 0) {
    antigravityMissions = window.OFFLINE_MISSIONS || [];
  }
}


function renderWeekSelectors() {
  const container = document.getElementById('week-selector-container');
  if (!container) return;

  container.innerHTML = Array.from({ length: 18 }, (_, i) => i + 1).map(w => {
    const isMidterm = (w === 9);
    const isFinal = (w === 17 || w === 18);
    const isAgent = (w === 16);
    let extraClass = 'bg-slate-100 hover:bg-blue-100 text-slate-700';
    if (isMidterm) extraClass = 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-300';
    if (isFinal) extraClass = 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
    if (isAgent) extraClass = 'bg-purple-100 text-purple-800 font-bold border border-purple-300';

    return `
      <button onclick="showWeekDetail(${w})" id="btn-week-${w}" class="week-pill text-xs py-2 rounded-lg font-semibold transition text-center ${extraClass}">
        W${w}
      </button>
    `;
  }).join('');
}

const WEEK_PPTX_MAP = {
  1: "ERP_第01週_課程導論、ERP_概念演進與數位轉型.pptx",
  2: "ERP_第02週_企業模式與企業流程管理_(BPR).pptx",
  3: "ERP_第03週_銷售與配銷模組_(SD)_-_訂單管理與_ATP_試算.pptx",
  4: "ERP_第04週_銷售與配銷模組_(SD)_-_出貨、開立發票與應收.pptx",
  5: "ERP_第05週_採購與庫存管理_(MM)_-_採購流程與供應商管理.pptx",
  6: "ERP_第06週_採購與庫存管理_(MM)_-_收料檢驗與三向比對.pptx",
  7: "ERP_第07週_生產規劃與控制_(PP)_-_主排程與_BOM_表.pptx",
  8: "ERP_第08週_生產規劃與控制_(PP)_-_物料需求規劃_(MRP).pptx",
  9: "ERP_第09週_期中學習評量與證照考點總複習.pptx",
  10: "ERP_第10週_會計與財務管理模組_(FI_CO).pptx",
  11: "ERP_第11週_人力資源管理模組_(HR).pptx",
  12: "ERP_第12週_供應鏈管理_(SCM)_與跨企業協同運作.pptx",
  13: "ERP_第13週_客戶關係管理_(CRM)_與全通路行銷.pptx",
  14: "ERP_第14週_商業智慧_(BI)_與企業營運大數據分析.pptx",
  15: "ERP_第15週_ERP_系統導入方法論與系統評選.pptx",
  16: "ERP_第16週_AI_時代的_ERP：AI_Agent_與流程自動化實務.pptx",
  17: "ERP_第17週_ERP_專業考前總衝刺與全真模擬測驗.pptx",
  18: "ERP_第18週_期末成果驗收_／_企業資源規劃專業證照檢定.pptx"
};

function showWeekDetail(weekNum) {
  currentWeek = weekNum;
  document.querySelectorAll('.week-pill').forEach(btn => btn.classList.remove('ring-2', 'ring-blue-600', 'bg-blue-600', 'text-white'));
  const activeBtn = document.getElementById(`btn-week-${weekNum}`);
  if (activeBtn) {
    activeBtn.classList.add('ring-2', 'ring-blue-600', 'bg-blue-600', 'text-white');
  }

  const weekInfo = curriculumData.find(w => w.week === weekNum) || {
    week: weekNum,
    title: `第 ${weekNum} 週 企業流程與核心管理`,
    chapter: `ERP 標準教學單元 (W${weekNum})`,
    objective: '掌握企業流程整合與 ERP 主檔設定',
    concept_card: {
      hook: '本週著重於 ERP 核心單據流轉與跨部門勾稽。',
      ai_upgrade: '透過 AI Agent 自主處理重複性核對工作，加速作業流程。',
      cerps_focus: '掌握本模組之標準專有名詞、借貸拋轉與單據先後順序。'
    }
  };

  document.getElementById('week-badge').textContent = `第 ${weekNum} 週`;
  document.getElementById('week-chapter').textContent = weekInfo.chapter || '';
  document.getElementById('week-title').textContent = weekInfo.title || '';
  document.getElementById('week-hook-text').textContent = weekInfo.concept_card?.hook || '';
  document.getElementById('week-ai-upgrade-text').textContent = weekInfo.concept_card?.ai_upgrade || '';
  document.getElementById('week-cerps-focus-text').textContent = weekInfo.concept_card?.cerps_focus || weekInfo.cerps_focus || '';

  // PPTX Download Button
  const pptxBtn = document.getElementById('week-pptx-btn');
  const pptxFile = WEEK_PPTX_MAP[weekNum];
  const isFlaskServer = window.location.port === '5000' || (window.location.hostname === 'localhost' && window.location.port !== '');
  if (pptxBtn && pptxFile) {
    pptxBtn.setAttribute('download', pptxFile);
    pptxBtn.href = isFlaskServer
      ? `/slides/${encodeURIComponent(pptxFile)}`
      : `01_每週教學簡報_PPT/${encodeURIComponent(pptxFile)}`;
  }

  // Antigravity Starter Project ZIP Download Button
  const zipBtn = document.getElementById('week-project-zip-btn');
  const zipFile = `Week${String(weekNum).padStart(2, '0')}_Antigravity_Project.zip`;
  if (zipBtn) {
    zipBtn.setAttribute('download', zipFile);
    zipBtn.href = isFlaskServer
      ? `/download_project/${weekNum}`
      : `static/projects/${zipFile}`;
  }

  // Antigravity Mission Info on Week Detail Card
  const mission = antigravityMissions.find(m => m.week === weekNum);
  if (mission) {
    const tEl = document.getElementById('week-ag-title');
    const sEl = document.getElementById('week-ag-scenario');
    const dEl = document.getElementById('week-ag-deliverable');
    const pEl = document.getElementById('week-ag-prompt');
    const zLink = document.getElementById('week-ag-zip-link');
    if (tEl) tEl.textContent = `本週 Antigravity 實作任務：${mission.title}`;
    if (sEl) sEl.textContent = mission.scenario;
    if (dEl) dEl.textContent = mission.deliverable;
    if (pEl) pEl.textContent = mission.prompt;
    if (zLink) {
      zLink.setAttribute('download', zipFile);
      zLink.href = isFlaskServer
        ? `/download_project/${weekNum}`
        : `static/projects/${zipFile}`;
    }
  }

  // Simulator Shortcut button
  const simBtn = document.getElementById('week-sim-shortcut-btn');
  if (weekInfo.simulator) {
    simBtn.classList.remove('hidden');
    simBtn.classList.add('inline-flex');
    simBtn.setAttribute('data-target-sim', weekInfo.simulator);
  } else {
    simBtn.classList.add('hidden');
  }

  // Dynamic body
  const bodyBox = document.getElementById('week-dynamic-body');
  if (weekInfo.concept_card?.evolution) {
    bodyBox.innerHTML = `
      <h4 class="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
        <i data-lucide="history" class="w-4 h-4 text-blue-600"></i> ERP 歷史演進關鍵四階段：
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        ${weekInfo.concept_card.evolution.map(e => `
          <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div class="font-bold text-xs text-blue-900 mb-1">${e.stage}</div>
            <div class="text-[11px] text-slate-600 leading-relaxed">${e.focus}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (weekInfo.concept_card?.core_cycles) {
    bodyBox.innerHTML = `
      <h4 class="font-bold text-xs text-slate-800 mb-3 flex items-center gap-1.5">
        <i data-lucide="repeat" class="w-4 h-4 text-indigo-600"></i> 企業三大核心營運循環 (Business Cycles)：
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${weekInfo.concept_card.core_cycles.map(c => `
          <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div class="font-bold text-xs text-indigo-900 mb-1">${c.name}</div>
            <div class="text-[11px] font-mono text-slate-700 mt-1">${c.flow}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    bodyBox.innerHTML = `
      <div class="flex items-center justify-between text-xs text-slate-600">
        <div><strong class="text-blue-900">學習核心目標：</strong>${weekInfo.objective}</div>
        <div class="text-slate-400">時數：${weekInfo.hours || 2} 小時 (100 分鐘配比)</div>
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

// ==================== ANTIGRAVITY 專案工作坊 ====================
function renderAntigravitySelectors() {
  const container = document.getElementById('ag-week-selector');
  if (!container) return;
  container.innerHTML = Array.from({ length: 18 }, (_, i) => i + 1).map(w => {
    return `
      <button onclick="showAntigravityDetail(${w})" id="btn-ag-week-${w}" class="ag-week-pill text-xs py-2 rounded-lg font-semibold transition text-center bg-slate-100 hover:bg-purple-100 text-slate-700">
        W${w}
      </button>
    `;
  }).join('');
}

function showAntigravityDetail(weekNum) {
  document.querySelectorAll('.ag-week-pill').forEach(btn => btn.classList.remove('ring-2', 'ring-purple-600', 'bg-purple-700', 'text-white'));
  const activeBtn = document.getElementById(`btn-ag-week-${weekNum}`);
  if (activeBtn) {
    activeBtn.classList.add('ring-2', 'ring-purple-600', 'bg-purple-700', 'text-white');
  }

  const m = antigravityMissions.find(x => x.week === weekNum);
  if (!m) return;

  const bEl = document.getElementById('ag-detail-badge');
  const tagEl = document.getElementById('ag-detail-tag');
  const tEl = document.getElementById('ag-detail-title');
  const sEl = document.getElementById('ag-detail-scenario');
  const dEl = document.getElementById('ag-detail-deliverable');
  const pEl = document.getElementById('ag-detail-prompt');
  const cEl = document.getElementById('ag-detail-code-preview');
  const zLink = document.getElementById('ag-detail-download-zip');

  if (bEl) bEl.textContent = `第 ${weekNum} 週專案`;
  if (tagEl) tagEl.textContent = m.tag || '實作任務';
  if (tEl) tEl.textContent = m.title;
  if (sEl) sEl.textContent = m.scenario;
  if (dEl) dEl.textContent = m.deliverable;
  if (pEl) pEl.textContent = m.prompt;
  if (cEl) cEl.textContent = m.starter_code_preview || '# 查看 starter.py 完整程式碼...';

  const zipFile = `Week${String(weekNum).padStart(2, '0')}_Antigravity_Project.zip`;
  const isFlaskServer = window.location.port === '5000' || (window.location.hostname === 'localhost' && window.location.port !== '');
  if (zLink) {
    zLink.setAttribute('download', zipFile);
    zLink.href = isFlaskServer
      ? `/download_project/${weekNum}`
      : `static/projects/${zipFile}`;
  }

  window.currentAgPrompt = m.prompt;
  if (window.lucide) window.lucide.createIcons();
}

function copyCurrentWeekPrompt() {
  const mission = antigravityMissions.find(m => m.week === currentWeek);
  const promptText = mission ? mission.prompt : (document.getElementById('week-ag-prompt') ? document.getElementById('week-ag-prompt').textContent : '');
  if (!promptText) return;
  navigator.clipboard.writeText(promptText).then(() => {
    const btnText = document.getElementById('week-ag-copy-btn-text');
    if (btnText) {
      btnText.textContent = '已成功複製！';
      setTimeout(() => { btnText.textContent = '一鍵複製 Prompt'; }, 2000);
    }
  });
}

function copyDetailPrompt() {
  const promptText = window.currentAgPrompt || (document.getElementById('ag-detail-prompt') ? document.getElementById('ag-detail-prompt').textContent : '');
  if (!promptText) return;
  navigator.clipboard.writeText(promptText).then(() => {
    const btnText = document.getElementById('ag-detail-copy-text');
    if (btnText) {
      btnText.textContent = '已複製到剪貼簿！';
      setTimeout(() => { btnText.textContent = '複製 Antigravity Prompt'; }, 2000);
    }
  });
}


function goToWeekSimulator() {
  const simBtn = document.getElementById('week-sim-shortcut-btn');
  const target = simBtn.getAttribute('data-target-sim');
  if (target === 'atp_simulator') {
    switchTab('simulators');
    switchSimulator('atp');
  } else if (target === 'three_way_matching') {
    switchTab('simulators');
    switchSimulator('matching');
  } else if (target === 'bom_simulator' || target === 'mrp_simulator') {
    switchTab('simulators');
    switchSimulator('mrp');
  } else if (target === 'bullwhip_simulator') {
    switchTab('simulators');
    switchSimulator('bullwhip');
  } else if (target === 'agentic_studio') {
    switchTab('agentic');
  }
}

// ==================== ERP 核心模擬器 ====================
function switchSimulator(simId) {
  activeSimulator = simId;
  const sims = ['atp', 'matching', 'mrp', 'bullwhip'];
  sims.forEach(s => {
    const view = document.getElementById(`sim-view-${s}`);
    const btn = document.getElementById(`sim-btn-${s}`);
    if (view) view.classList.toggle('hidden', s !== simId);
    if (btn) btn.classList.toggle('active', s === simId);
  });
  if (window.lucide) window.lucide.createIcons();
}

// Simulator 1: ATP Calculator
function calcATP() {
  const onHand = parseInt(document.getElementById('atp-in-onhand').value) || 0;
  const scheduled = parseInt(document.getElementById('atp-in-scheduled').value) || 0;
  const committed = parseInt(document.getElementById('atp-in-committed').value) || 0;
  const safety = parseInt(document.getElementById('atp-in-safety').value) || 0;
  const newOrder = parseInt(document.getElementById('atp-in-order').value) || 0;

  document.getElementById('atp-lbl-onhand').textContent = onHand;
  document.getElementById('atp-lbl-scheduled').textContent = scheduled;
  document.getElementById('atp-lbl-committed').textContent = committed;
  document.getElementById('atp-lbl-safety').textContent = safety;

  // Formula: ATP = OnHand + Scheduled - Committed - Safety
  const atp = Math.max(0, onHand + scheduled - committed - safety);
  document.getElementById('atp-val-display').textContent = atp;

  const statusBadge = document.getElementById('atp-status-badge');
  const agentText = document.getElementById('atp-agent-decision-text');

  if (atp >= newOrder) {
    statusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1';
    statusBadge.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 可全數承諾接單';
    agentText.innerHTML = `<strong>【Agent 建議：綠燈放行】</strong> 客戶急單需求 <strong>${newOrder}</strong> 台，系統目前 ATP 充足 (可承諾 <strong>${atp}</strong> 台)！建議立即鎖定庫存並建立正式 ERP 銷售訂單 (SO)，預估交期 100% 達交！`;
    unlockBadge('atp_master', 'ATP 調度大師', '成功試算銷售可承諾量');
  } else if (atp > 0 && atp < newOrder) {
    statusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1';
    statusBadge.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4"></i> 需分批交貨';
    const shortage = newOrder - atp;
    agentText.innerHTML = `<strong>【Agent 建議：黃燈分批】</strong> 現有 ATP 僅有 <strong>${atp}</strong> 台，缺貨 <strong>${shortage}</strong> 台！Agent 建議：向客戶確認首批先出 ${atp} 台，剩餘 ${shortage} 台待排產完成後於次週補交。`;
  } else {
    statusBadge.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500 text-white flex items-center gap-1';
    statusBadge.innerHTML = '<i data-lucide="x-circle" class="w-4 h-4"></i> 庫存不足 (缺貨)';
    agentText.innerHTML = `<strong>【Agent 建議：紅燈警戒】</strong> 系統剩餘 ATP 為 <strong>0</strong>，無法滿足 ${newOrder} 台急單！Agent 已自動向生產排程 (MPS) 與採購模組發出物料急件請購預警 (PR)。`;
  }

  if (window.lucide) window.lucide.createIcons();
}

function resetAtpDefaults() {
  document.getElementById('atp-in-onhand').value = 100;
  document.getElementById('atp-in-scheduled').value = 50;
  document.getElementById('atp-in-committed').value = 40;
  document.getElementById('atp-in-safety').value = 20;
  document.getElementById('atp-in-order').value = 70;
  calcATP();
}

// Simulator 2: Three-Way Matching Audit Game
const MATCHING_SCENARIOS = {
  1: {
    name: '正常完美吻合（零誤差）',
    po: { no: 'PO-2026-0815', vendor: '捷安精密工業', item: '高碳鋼車架 (FRAME-C01)', qty: 100, price: '$3,200', total: '$320,000' },
    gr: { no: 'GR-2026-0822', po: 'PO-2026-0815', item: '高碳鋼車架', qty: 100, pass: 100, reject: '0 件' },
    inv: { no: 'AB-98765432', po: 'PO-2026-0815', item: '高碳鋼車架', qty: 100, price: '$3,200', total: '$336,000 (含5%稅)' },
    correctAction: 'approve',
    explanation: 'PO、GR 與發票之數量 (100)、單價 ($3,200) 完全一致，含稅金額無誤，會計系統可直接全自動拋轉應付憑單！'
  },
  2: {
    name: '單價浮報陷阱（發票單價高於 PO）',
    po: { no: 'PO-2026-0901', vendor: '捷安精密工業', item: '高碳鋼車架 (FRAME-C01)', qty: 100, price: '$3,200', total: '$320,000' },
    gr: { no: 'GR-2026-0905', po: 'PO-2026-0901', item: '高碳鋼車架', qty: 100, pass: 100, reject: '0 件' },
    inv: { no: 'AB-99112233', po: 'PO-2026-0901', item: '高碳鋼車架', qty: 100, price: '$3,600 (浮報+$400)', total: '$378,000' },
    correctAction: 'review',
    explanation: '發票單價 $3,600 遠高於採購核准價 $3,200 (價差 +12.5% > 0.5% 門檻)！會計系統必須攔截，轉呈採購主管人工審批與向廠商查核！'
  },
  3: {
    name: '短裝溢開陷阱（實收少於發票開立）',
    po: { no: 'PO-2026-0910', vendor: '大同五金零組件', item: '煞車線組 (BRAKE-01)', qty: 200, price: '$150', total: '$30,000' },
    gr: { no: 'GR-2026-0912', po: 'PO-2026-0910', item: '煞車線組', qty: 160, pass: 160, reject: '40 件短少未交' },
    inv: { no: 'CD-55667788', po: 'PO-2026-0910', item: '煞車線組', qty: 200, price: '$150', total: '$31,500' },
    correctAction: 'reject',
    explanation: '倉庫驗收單 (GR) 僅實收 160 件，廠商發票卻全額請款 200 件！依三向比對內控原則，必須退回發票要求廠商依實收 160 件重開或開立折讓單！'
  },
  4: {
    name: '微額稅差（在容差範圍內）',
    po: { no: 'PO-2026-0915', vendor: '聯邦橡膠', item: '防刺輪胎', qty: 50, price: '$333', total: '$16,650' },
    gr: { no: 'GR-2026-0918', po: 'PO-2026-0915', item: '防刺輪胎', qty: 50, pass: 50, reject: '0 件' },
    inv: { no: 'EF-12345678', po: 'PO-2026-0915', item: '防刺輪胎', qty: 50, price: '$333', total: '$17,483 (尾數差 $0.5 四捨五入)' },
    correctAction: 'approve',
    explanation: '數量、單價皆吻合，微幅尾數差異屬於四捨五入正常小額容差 (Tolerance)，ERP 會計系統自動過帳並拋轉銷項/進項小額尾差調整科目。'
  },
  5: {
    name: '虛構採購單詐騙（查無此 PO 號碼）',
    po: { no: '【查無單號】', vendor: '未知虛設行號', item: '查無採購品項', qty: 0, price: '$0', total: '$0' },
    gr: { no: '【查無驗收記錄】', po: 'PO-9999-FAKE', item: '查無貨物入庫', qty: 0, pass: 0, reject: '無' },
    inv: { no: 'ZZ-00000001', po: 'PO-9999-FAKE', item: '諮詢顧問服務費', qty: 1, price: '$150,000', total: '$157,500' },
    correctAction: 'reject',
    explanation: '嚴重警示！ERP 查無 PO-9999-FAKE 採購核准紀錄，亦無倉庫簽收單，屬於假發票詐騙攻擊！必須立即退回並通知風控法務部！'
  }
};

function loadMatchingScenario() {
  const scId = document.getElementById('matching-scenario-select').value;
  const sc = MATCHING_SCENARIOS[scId];
  if (!sc) return;

  document.getElementById('match-po-no').textContent = sc.po.no;
  document.getElementById('match-po-vendor').textContent = sc.po.vendor;
  document.getElementById('match-po-item').textContent = sc.po.item;
  document.getElementById('match-po-qty').textContent = sc.po.qty;
  document.getElementById('match-po-price').textContent = sc.po.price;
  document.getElementById('match-po-total').textContent = sc.po.total;

  document.getElementById('match-gr-no').textContent = sc.gr.no;
  document.getElementById('match-gr-po').textContent = sc.gr.po;
  document.getElementById('match-gr-item').textContent = sc.gr.item;
  document.getElementById('match-gr-qty').textContent = sc.gr.qty;
  document.getElementById('match-gr-pass').textContent = sc.gr.pass;
  document.getElementById('match-gr-reject').textContent = sc.gr.reject;

  document.getElementById('match-inv-no').textContent = sc.inv.no;
  document.getElementById('match-inv-po').textContent = sc.inv.po;
  document.getElementById('match-inv-item').textContent = sc.inv.item;
  document.getElementById('match-inv-qty').textContent = sc.inv.qty;
  document.getElementById('match-inv-price').textContent = sc.inv.price;
  document.getElementById('match-inv-total').textContent = sc.inv.total;

  const fbBox = document.getElementById('matching-feedback-box');
  fbBox.classList.add('hidden');
}

function auditMatchingDecision(studentAction) {
  const scId = document.getElementById('matching-scenario-select').value;
  const sc = MATCHING_SCENARIOS[scId];
  const fbBox = document.getElementById('matching-feedback-box');
  fbBox.classList.remove('hidden');

  const isCorrect = (studentAction === sc.correctAction);

  if (isCorrect) {
    fbBox.className = 'p-4 rounded-lg text-xs leading-relaxed space-y-1 bg-emerald-100 text-emerald-900 border border-emerald-300';
    fbBox.innerHTML = `
      <div class="font-bold flex items-center gap-1 text-emerald-950">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-700"></i>
        決策正確！卓越的會計與 ERP 內控判斷！
      </div>
      <div>${sc.explanation}</div>
    `;
    unlockBadge('audit_detective', '三向核帳神探', '識破採購發票單價與數量陷阱');
  } else {
    fbBox.className = 'p-4 rounded-lg text-xs leading-relaxed space-y-1 bg-rose-100 text-rose-900 border border-rose-300';
    fbBox.innerHTML = `
      <div class="font-bold flex items-center gap-1 text-rose-950">
        <i data-lucide="alert-circle" class="w-4 h-4 text-rose-700"></i>
        決策有待加強！請檢視三向勾稽差異：
      </div>
      <div>${sc.explanation}</div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

// Simulator 3: MRP Auto Solver
function autoSolveMRP() {
  document.getElementById('mrp-oh-1').value = 30; // 40 + 50 - 60 = 30
  document.getElementById('mrp-net-1').value = 0;  // 30 > 20, net = 0
  document.getElementById('mrp-por-1').textContent = '0';
  document.getElementById('mrp-rel-1').textContent = '70 (提前發出)';

  document.getElementById('mrp-oh-2').value = 20; // 庫存降至安全存量 20
  document.getElementById('mrp-net-2').value = 70; // 80 - 30 + 20 = 70
  document.getElementById('mrp-por-2').textContent = '70';
  document.getElementById('mrp-rel-2').textContent = '100 (提前發出)';

  document.getElementById('mrp-oh-3').value = 20;
  document.getElementById('mrp-net-3').value = 100; // 100 - 20 + 20 = 100
  document.getElementById('mrp-por-3').textContent = '100';
  document.getElementById('mrp-rel-3').textContent = '40 (提前發出)';

  document.getElementById('mrp-oh-4').value = 20;
  document.getElementById('mrp-net-4').value = 40;
  document.getElementById('mrp-por-4').textContent = '40';
  document.getElementById('mrp-rel-4').textContent = '0';

  unlockBadge('mrp_calculator', 'MRP 運算專家', '完成自行車 BOM 淨需求推導');
  alert('✨ AI 已自動為您推導完成！請觀察：因為前置時間 Lead Time = 1 週，第 2 週需要的 70 件，必須在「第 1 週」提前發出工令 (Planned Order Release)！');
}

// Simulator 4: Bullwhip Effect Game
let bullwhipVMI = false;
let currentDemandRatio = 1.15;

function triggerDemandShock(ratio) {
  currentDemandRatio = ratio;
  updateBullwhipUI();
}

function toggleVMI() {
  bullwhipVMI = document.getElementById('vmi-toggle').checked;
  updateBullwhipUI();
  if (bullwhipVMI) {
    unlockBadge('bullwhip_conqueror', '長鞭效應平抑者', '啟用 VMI 撫平供應鏈震盪');
  }
}

function updateBullwhipUI() {
  const base = 100;
  const tier1 = Math.round(base * currentDemandRatio);
  let tier2, tier3, tier4;

  if (bullwhipVMI) {
    // With AI VMI: perfect information sharing, almost no amplification
    tier2 = tier1;
    tier3 = tier1;
    tier4 = tier1;
    document.getElementById('bullwhip-tier1').textContent = tier1;
    document.getElementById('bullwhip-tier2').textContent = tier2;
    document.getElementById('bullwhip-tier3').textContent = tier3;
    document.getElementById('bullwhip-tier4').textContent = tier4;

    document.getElementById('bullwhip-tier2-amp').textContent = '波幅同步 1.0 倍 (VMI 撫平)';
    document.getElementById('bullwhip-tier3-amp').textContent = '波幅同步 1.0 倍 (VMI 撫平)';
    document.getElementById('bullwhip-tier4-amp').textContent = '波幅同步 1.0 倍 (VMI 撫平)';

    document.getElementById('bullwhip-insight').className = 'bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 leading-relaxed';
    document.getElementById('bullwhip-insight').innerHTML = '<strong>✨ AI VMI 協同運作成效：</strong>透過跨企業 ERP 系統串接與 POS 即時能見度 (Visibility)，上游原物料商直接依據終端顧客銷售排產，徹底消除長鞭效應，庫存持有成本降低 45%！';
  } else {
    // Legacy isolated system: severe amplification
    const delta = tier1 - base;
    tier2 = Math.round(base + delta * 1.35);
    tier3 = Math.round(base + delta * 1.85);
    tier4 = Math.round(base + delta * 2.45);

    document.getElementById('bullwhip-tier1').textContent = tier1;
    document.getElementById('bullwhip-tier2').textContent = tier2;
    document.getElementById('bullwhip-tier3').textContent = tier3;
    document.getElementById('bullwhip-tier4').textContent = tier4;

    document.getElementById('bullwhip-tier2-amp').textContent = '放大至 1.35 倍';
    document.getElementById('bullwhip-tier3-amp').textContent = '放大至 1.85 倍';
    document.getElementById('bullwhip-tier4-amp').textContent = '甩鞭放大至 2.45 倍！';

    document.getElementById('bullwhip-insight').className = 'bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 leading-relaxed';
    document.getElementById('bullwhip-insight').innerHTML = '<strong>⚠️ 長鞭效應診斷：</strong>目前處於【傳統資訊孤島模式】，各節點因為缺乏透明需求、堆疊各自的安全庫存防備，導致上游原物料商訂單被成倍放大！請勾選【啟用 AI 驅動 VMI】體驗資訊透明之威力！';
  }
}

// ==================== AGENTIC AI 規劃實驗室 ====================
async function loadAgentTemplates() {
  try {
    const res = await fetch('/api/agent_templates');
    if (res.ok) {
      agentTemplates = await res.json();
    }
  } catch (e) {
    console.warn('Using local fallback templates');
  }
  renderAgentTemplateButtons();
  if (agentTemplates.length > 0) {
    selectAgentTemplate(agentTemplates[0].id);
  }
}

function renderAgentTemplateButtons() {
  const container = document.getElementById('agent-template-buttons');
  if (!container) return;

  container.innerHTML = agentTemplates.map((t, idx) => `
    <button onclick="selectAgentTemplate('${t.id}')" id="tpl-btn-${t.id}" class="agent-template-btn ${idx === 0 ? 'active' : ''} p-3 rounded-xl border border-slate-200 bg-slate-50 text-left transition hover:border-purple-300">
      <div class="text-[10px] uppercase font-bold text-slate-400">${t.module}</div>
      <div class="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">${t.name}</div>
    </button>
  `).join('');
}

function selectAgentTemplate(tplId) {
  document.querySelectorAll('.agent-template-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`tpl-btn-${tplId}`);
  if (btn) btn.classList.add('active');

  const t = agentTemplates.find(item => item.id === tplId);
  if (!t) return;

  window.currentAgentTemplate = t;
  document.getElementById('builder-module-badge').textContent = t.module;
  document.getElementById('builder-trigger').value = t.trigger?.type + '：' + (t.trigger?.content || '').slice(0, 40) + '...';
  document.getElementById('builder-prompt').value = t.system_instruction || '';
  document.getElementById('builder-guardrail-amount').value = t.guardrails?.auto_approve_limit || t.guardrails?.max_auto_post_amount || 500000;
  document.getElementById('builder-guardrail-condition').value = t.guardrails?.human_approval_trigger || '異常或超出授權金額門檻時阻擋';

  // Tools checkboxes
  const toolsList = document.getElementById('builder-tools-list');
  toolsList.innerHTML = (t.tools || []).map(tool => `
    <label class="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200 cursor-pointer hover:bg-slate-100">
      <input type="checkbox" checked class="mt-0.5 rounded text-purple-600 focus:ring-purple-500">
      <div>
        <strong class="font-mono text-purple-900 block">${tool.name}()</strong>
        <span class="text-[10px] text-slate-500">${tool.desc}</span>
      </div>
    </label>
  `).join('');

  // Clear previous trace in terminal
  const term = document.getElementById('react-trace-terminal');
  term.innerHTML = `
    <div class="text-purple-300 font-bold mb-2">已就緒：${t.name}</div>
    <div class="text-slate-400 text-[11px] mb-3 leading-relaxed">業務痛點：${t.pain_point}</div>
    <div class="text-slate-500 italic">👉 點選下方「🚀 啟動 ReAct 思考與執行模擬」觀察 AI 運作軌跡。</div>
  `;
}

async function runAgentSimulation() {
  const t = window.currentAgentTemplate;
  if (!t) return;

  const term = document.getElementById('react-trace-terminal');
  const statusBadge = document.getElementById('react-status-badge');
  term.innerHTML = '';
  statusBadge.textContent = 'RUNNING...';
  statusBadge.className = 'text-[10px] bg-purple-600 text-white font-mono px-2 py-0.5 rounded animate-pulse';

  const trace = t.simulated_trace || [];
  for (let i = 0; i < trace.length; i++) {
    const step = trace[i];
    await renderTraceStep(step, term);
    await new Promise(resolve => setTimeout(resolve, 800)); // Delay for dramatic simulation effect
  }

  statusBadge.textContent = 'COMPLETED';
  statusBadge.className = 'text-[10px] bg-emerald-600 text-white font-mono px-2 py-0.5 rounded';
  unlockBadge('agentic_planner', 'Agentic AI 架構師', '成功規劃並模擬企業 AI Agent 流程');
}

async function renderTraceStep(step, container) {
  const div = document.createElement('div');
  div.className = 'animate-fade-in space-y-1 p-2.5 rounded-lg border border-slate-800';

  if (step.type === 'thought') {
    div.className += ' bg-slate-950/80';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
        <span class="react-badge-thought px-1.5 py-0.2 rounded text-[10px]">THOUGHT #CYCLE ${step.step}</span>
        <span>AI Agent 思考與目標拆解</span>
      </div>
      <div class="text-slate-300 text-xs whitespace-pre-line pl-2 border-l-2 border-amber-500/50">${step.content}</div>
    `;
  } else if (step.type === 'action') {
    div.className += ' bg-sky-950/40';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
        <span class="react-badge-action px-1.5 py-0.2 rounded text-[10px]">ACTION</span>
        <span>調用 ERP 工具：<code>${step.tool}()</code></span>
      </div>
      <div class="text-sky-200 font-mono text-[11px] bg-black/40 p-2 rounded overflow-x-auto">
        ${JSON.stringify(step.input, null, 2)}
      </div>
    `;
  } else if (step.type === 'observation') {
    div.className += ' bg-emerald-950/40';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
        <span class="react-badge-obs px-1.5 py-0.2 rounded text-[10px]">OBSERVATION</span>
        <span>ERP 系統反饋響應</span>
      </div>
      <div class="text-emerald-200 text-xs pl-2 border-l-2 border-emerald-500/50">${step.result}</div>
    `;
  } else if (step.type === 'guardrail') {
    div.className += ' bg-amber-950/50';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-orange-400 font-bold text-[11px]">
        <span class="react-badge-guard px-1.5 py-0.2 rounded text-[10px]">GUARDRAIL</span>
        <span>安全邊界與內部控制檢核</span>
      </div>
      <div class="text-orange-200 text-xs pl-2 border-l-2 border-orange-500/50">${step.content}</div>
    `;
  } else if (step.type === 'human_approval') {
    div.className += ' bg-purple-950/60 border-purple-500';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-purple-300 font-bold text-[11px]">
        <i data-lucide="user-check" class="w-3.5 h-3.5 text-purple-400"></i>
        <span>HUMAN-IN-THE-LOOP 主管線上審核</span>
      </div>
      <div class="text-purple-100 text-xs pl-2">${step.prompt}</div>
    `;
  } else if (step.type === 'final_output') {
    div.className += ' bg-purple-900/60 border-purple-400';
    div.innerHTML = `
      <div class="flex items-center gap-1.5 text-purple-200 font-bold text-[11px]">
        <span class="react-badge-final px-1.5 py-0.2 rounded text-[10px]">SUCCESS</span>
        <span>正式執行結果</span>
      </div>
      <div class="text-white text-xs font-semibold pl-2">${step.content}</div>
    `;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
}

function openProposalModal() {
  document.getElementById('proposal-modal').classList.remove('hidden');
}

function closeProposalModal() {
  document.getElementById('proposal-modal').classList.add('hidden');
}

function downloadProposalMarkdown() {
  const title = document.getElementById('prop-title').value;
  const members = document.getElementById('prop-members').value;
  const pain = document.getElementById('prop-pain').value;
  const workflow = document.getElementById('prop-workflow').value;
  const benefits = document.getElementById('prop-benefits').value;

  const content = `# 萬能科技大學 企業資源規劃 (ERP) 期末 AI 專題企劃書
**課程代號：** 11501 企業資源規劃 ｜ **授課教師：** 邱俊維 博士
**專案主題：** ${title}
**分組組別與成員：** ${members}
**繳交日期：** ${new Date().toLocaleDateString()}

---

## 一、企業現況與營運痛點
${pain}

## 二、Agentic AI 流程架構與人機協同規劃 (Human-in-the-Loop)
${workflow}

## 三、預期量化效益評估 (KPI)
${benefits}

---
*本提案符合中華企業資源規劃學會 (CERPS) AI 賦能 ERP 規範標準。*
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `萬能科大_ERP_AI專題企劃書_${members.replace(/[\s:：]/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==================== CERPS 考照與題庫中心 ====================
async function loadQuestions() {
  try {
    const res = await fetch('/api/questions?count=300');
    if (res.ok) {
      const data = await res.json();
      questionsData = data.questions || [];
      document.getElementById('total-questions-stat').textContent = questionsData.length;
    }
  } catch (e) {
    console.warn('Questions API unavailable');
  }
}

function startWeeklyQuiz() {
  switchTab('exam');
  // Filter questions matching current week
  const weekQs = questionsData.filter(q => q.weeks && q.weeks.includes(currentWeek));
  const selected = (weekQs.length >= 5 ? weekQs : questionsData).slice(0, 5);
  startExamSession(`第 ${currentWeek} 週 隨堂 5 題快測`, selected, 10);
}

function startFilteredQuiz() {
  const ch = document.getElementById('exam-chapter-select').value;
  let pool = questionsData;
  let title = '全章節精選綜合練習';
  if (ch !== 'all') {
    const chNum = parseInt(ch);
    pool = questionsData.filter(q => q.chapter === chNum);
    title = `第 ${chNum} 章 自主練習`;
  }
  const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
  startExamSession(title, shuffled, 15);
}

function startFullExam(mode) {
  switchTab('exam');
  if (mode === 'midterm_50') {
    // CH01~CH07 + AI ERP
    const pool = questionsData.filter(q => q.chapter <= 7 || q.chapter === 16);
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 50);
    startExamSession('期中全真模擬檢定 (50題)', shuffled, 60);
  } else if (mode === 'final_100') {
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random()).slice(0, 100);
    startExamSession('期末 CERPS 考照全真衝刺 (100題)', shuffled, 100);
  }
}

function startExamSession(modeTitle, questions, durationMinutes) {
  if (questions.length === 0) {
    alert('題庫載入中，請稍候！');
    return;
  }

  activeExam = {
    mode: modeTitle,
    questions: questions,
    userAnswers: {},
    timerInterval: null,
    timeLeft: durationMinutes * 60,
    startTime: new Date()
  };

  document.getElementById('active-exam-container').classList.remove('hidden');
  document.getElementById('exam-result-container').classList.add('hidden');
  document.getElementById('exam-mode-title').textContent = modeTitle;

  // Start Timer
  if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);
  activeExam.timerInterval = setInterval(updateExamTimer, 1000);
  updateExamTimer();

  // Render Questions
  renderExamQuestions();
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

function updateExamTimer() {
  if (activeExam.timeLeft <= 0) {
    clearInterval(activeExam.timerInterval);
    alert('考試時間到！系統即將為您自動交卷。');
    submitExam();
    return;
  }
  activeExam.timeLeft--;
  const mins = Math.floor(activeExam.timeLeft / 60);
  const secs = activeExam.timeLeft % 60;
  document.getElementById('exam-timer-display').textContent =
    `倒數計時：${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderExamQuestions() {
  const container = document.getElementById('exam-questions-list');
  container.innerHTML = activeExam.questions.map((q, idx) => `
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3" id="q-card-${q.id}">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            ${idx + 1}
          </span>
          <span class="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded">
            ${q.module || 'ERP 核心'} ｜ 第 ${q.chapter} 章
          </span>
        </div>
      </div>

      <p class="font-semibold text-sm text-slate-900 leading-relaxed">${q.question}</p>

      <div class="space-y-2 pt-1">
        ${q.options.map((opt, optIdx) => {
          const optVal = optIdx + 1;
          return `
            <label class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition text-xs font-medium text-slate-700">
              <input type="radio" name="question_${q.id}" value="${optVal}" onchange="recordAnswer(${q.id}, ${optVal})" class="w-4 h-4 text-blue-600 focus:ring-blue-500">
              <span>(${optVal}) ${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function recordAnswer(qId, selectedVal) {
  activeExam.userAnswers[qId] = selectedVal;
  const answeredCount = Object.keys(activeExam.userAnswers).length;
  document.getElementById('exam-progress-text').textContent =
    `已作答：${answeredCount} / ${activeExam.questions.length}`;
}

function submitExam() {
  if (activeExam.timerInterval) clearInterval(activeExam.timerInterval);

  let correctCount = 0;
  const details = [];
  const moduleStats = {};

  activeExam.questions.forEach(q => {
    const userAns = activeExam.userAnswers[q.id];
    const isCorrect = (userAns === q.answer);
    if (isCorrect) {
      correctCount++;
    } else {
      // Record mistake
      if (!studentProfile.mistakeIds.includes(q.id)) {
        studentProfile.mistakeIds.push(q.id);
      }
    }

    const mod = q.module || '綜合 ERP';
    if (!moduleStats[mod]) moduleStats[mod] = { total: 0, correct: 0 };
    moduleStats[mod].total++;
    if (isCorrect) moduleStats[mod].correct++;

    details.push({
      ...q,
      userAns,
      isCorrect
    });
  });

  studentProfile.totalAnswered = (studentProfile.totalAnswered || 0) + activeExam.questions.length;
  localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));
  updateStudentHeader();
  renderMistakesList();

  const total = activeExam.questions.length;
  const score = Math.round((correctCount / total) * 100);
  const passed = score >= 70;

  if (passed) {
    unlockBadge('first_quiz_pass', '初試啼聲', '完成隨堂測驗並通過及格線');
    if (total >= 50) {
      unlockBadge('cerps_certified', 'CERPS 模擬檢定合格', '全真模擬考突破 70 分及格線');
    }
  }

  showExamResults({ score, correctCount, total, passed, moduleStats, details });
}

function showExamResults(result) {
  document.getElementById('active-exam-container').classList.add('hidden');
  const container = document.getElementById('exam-result-container');
  container.classList.remove('hidden');

  container.innerHTML = `
    <!-- Result Header Banner -->
    <div class="p-6 rounded-2xl ${result.passed ? 'bg-emerald-900 text-white' : 'bg-rose-900 text-white'} shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${result.passed ? 'bg-emerald-500/30 text-emerald-200' : 'bg-rose-500/30 text-rose-200'} mb-2">
          ${result.passed ? '🎉 恭喜通過 CERPS 認證標準！' : '⚠️ 尚未達到 70 分及格線，請再接再厲！'}
        </div>
        <h2 class="text-3xl font-extrabold">${result.score} <span class="text-sm font-normal">分</span></h2>
        <p class="text-xs text-slate-300 mt-1">
          作答題數：${result.total} 題 ｜ 答對：${result.correctCount} 題 ｜ 答錯：${result.total - result.correctCount} 題
        </p>
      </div>
      <div>
        <button onclick="startFilteredQuiz()" class="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-slate-100 transition">
          🔄 重新挑戰一次
        </button>
      </div>
    </div>

    <!-- Module Performance Radar Breakdown -->
    <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
      <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
        <i data-lucide="bar-chart-2" class="w-4 h-4 text-blue-600"></i> 各 ERP 模組知識落點分析：
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        ${Object.entries(result.moduleStats).map(([mod, st]) => {
          const pct = Math.round((st.correct / st.total) * 100);
          return `
            <div class="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 shadow-sm">
              <div class="flex justify-between font-bold text-slate-800">
                <span>${mod}</span>
                <span class="${pct >= 70 ? 'text-emerald-600' : 'text-rose-600'}">${pct}%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div class="${pct >= 70 ? 'bg-emerald-500' : 'bg-rose-500'} h-full rounded-full" style="width: ${pct}%"></div>
              </div>
              <div class="text-[10px] text-slate-400">答對 ${st.correct} / ${st.total} 題</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Question Details & Explanations -->
    <div class="space-y-3">
      <h3 class="font-bold text-sm text-slate-800 flex items-center gap-1.5">
        <i data-lucide="file-check-2" class="w-4 h-4 text-purple-600"></i> 試題逐題檢核與考點詳解：
      </h3>
      <div class="space-y-3">
        ${result.details.map((d, i) => `
          <div class="p-4 rounded-xl border ${d.isCorrect ? 'bg-white border-slate-200' : 'bg-rose-50/50 border-rose-200'} text-xs space-y-2">
            <div class="flex items-center justify-between font-bold">
              <span class="${d.isCorrect ? 'text-emerald-700' : 'text-rose-700'} flex items-center gap-1">
                <i data-lucide="${d.isCorrect ? 'check-circle' : 'x-circle'}" class="w-4 h-4"></i>
                第 ${i + 1} 題 ｜ ${d.isCorrect ? '答對' : '答錯'}
              </span>
              <span class="text-slate-400">CH${d.chapter} ${d.module}</span>
            </div>
            <div class="font-semibold text-slate-800">${d.question}</div>
            <div class="text-[11px] text-slate-600 space-y-0.5">
              <div>你的作答：<strong class="${d.isCorrect ? 'text-emerald-700' : 'text-rose-600 font-bold'}">(${d.userAns || '未作答'})</strong></div>
              <div>標準答案：<strong class="text-blue-700 font-bold">(${d.answer}) ${d.options[d.answer - 1]}</strong></div>
            </div>
            <div class="bg-blue-50/60 p-2.5 rounded text-[11px] text-blue-900 border border-blue-100 whitespace-pre-line leading-relaxed">
              <strong>💡 邱老師考點解析：</strong>\n${d.explanation}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  window.scrollTo({ top: 300, behavior: 'smooth' });
  if (window.lucide) window.lucide.createIcons();
}

// ==================== 錯題筆記本 ====================
function renderMistakesList() {
  const container = document.getElementById('mistakes-list-container');
  const countSpan = document.getElementById('mistake-count-span');
  if (!container) return;

  const mistakes = questionsData.filter(q => studentProfile.mistakeIds.includes(q.id));
  if (countSpan) countSpan.textContent = mistakes.length;

  if (mistakes.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
        🎉 暫無錯題！您在平時測驗中答錯的題目將自動保存在此處，方便考前精準複習。
      </div>
    `;
    return;
  }

  container.innerHTML = mistakes.map((q, idx) => `
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-rose-700">錯題 #${idx + 1} ｜ CH${q.chapter} ${q.module}</span>
        <button onclick="removeSingleMistake(${q.id})" class="text-slate-400 hover:text-slate-600 text-[10px]">
          已學會，從筆記移除
        </button>
      </div>
      <div class="font-semibold text-slate-800">${q.question}</div>
      <div class="text-[11px] bg-slate-50 p-2 rounded text-slate-600 font-mono">
        正確解答：(${q.answer}) ${q.options[q.answer - 1]}
      </div>
      <div class="text-[11px] text-blue-900 bg-blue-50/60 p-2 rounded leading-relaxed">
        ${q.explanation}
      </div>
    </div>
  `).join('');
}

function removeSingleMistake(id) {
  studentProfile.mistakeIds = studentProfile.mistakeIds.filter(mId => mId !== id);
  localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));
  renderMistakesList();
}

function clearMistakes() {
  if (confirm('確定要清空個人錯題筆記嗎？')) {
    studentProfile.mistakeIds = [];
    localStorage.setItem('vnu_erp_student', JSON.stringify(studentProfile));
    renderMistakesList();
  }
}

function retryMistakeQuestions() {
  const mistakes = questionsData.filter(q => studentProfile.mistakeIds.includes(q.id));
  if (mistakes.length === 0) {
    alert('目前錯題筆記本為空，無需重練！');
    return;
  }
  switchTab('exam');
  startExamSession('錯題筆記專屬重練模式', mistakes, Math.ceil(mistakes.length * 1.5));
}

// ==================== 18 週簡報全螢幕網頁播放系統 (Slide Deck Presentation Player) ====================
let slidesData = [];
let currentSlideWeek = 1;
let currentSlideIndex = 0;

async function loadSlidesData() {
  if (window.OFFLINE_SLIDES && window.OFFLINE_SLIDES.length > 0) {
    slidesData = window.OFFLINE_SLIDES;
    console.log('✅ 成功載入內嵌簡報資料 (週數:', slidesData.length, ')');
    return;
  }
  try {
    const res = await fetch('data/slides.json');
    if (res.ok) {
      slidesData = await res.json();
      console.log('✅ 成功由 data/slides.json 載入簡報資料 (週數:', slidesData.length, ')');
    }
  } catch (e) {
    console.warn('簡報資料載入失敗，等待離線備份', e);
  }
}

function openSlideDeck(weekNum = null, slideIdx = 0) {
  currentSlideWeek = parseInt(weekNum || currentWeek || 1, 10);
  currentSlideIndex = parseInt(slideIdx, 10) || 0;

  const modal = document.getElementById('slide-deck-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Populate week dropdown
  const select = document.getElementById('slide-deck-week-select');
  if (select && select.options.length < 18) {
    select.innerHTML = '';
    for (let w = 1; w <= 18; w++) {
      const opt = document.createElement('option');
      opt.value = w;
      const wInfo = (curriculumData && curriculumData.find(c => c.week === w)) || null;
      const title = wInfo ? wInfo.title : `第 ${w} 週教學`;
      opt.textContent = `第 ${String(w).padStart(2, '0')} 週 ｜ ${title}`;
      select.appendChild(opt);
    }
  }
  if (select) select.value = currentSlideWeek;

  renderCurrentSlide();
  document.body.style.overflow = 'hidden';
}

function openCurrentWeekSlideDeck() {
  openSlideDeck(currentWeek, 0);
}

function closeSlideDeck() {
  const modal = document.getElementById('slide-deck-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  toggleSlideThumbnailsDrawer(false);
}

function onSlideDeckWeekChange(val) {
  currentSlideWeek = parseInt(val, 10) || 1;
  currentSlideIndex = 0;
  renderCurrentSlide();
}

function renderCurrentSlide() {
  const weekObj = slidesData.find(s => s.week === currentSlideWeek) || {
    week: currentSlideWeek,
    title: `第 ${currentSlideWeek} 週 企業流程規劃`,
    subtitle: '萬能科技大學 企業管理系 邱俊維 博士',
    slides: []
  };

  const slides = weekObj.slides || [];
  const total = slides.length || 1;
  if (currentSlideIndex >= total) currentSlideIndex = Math.max(0, total - 1);
  if (currentSlideIndex < 0) currentSlideIndex = 0;

  const slide = slides[currentSlideIndex] || {
    type: 'content',
    badge: '教學重點',
    title: weekObj.title,
    bullets: ['請確認簡報資料載入情況。'],
    footer: '萬能科技大學 企業管理系 邱俊維 博士'
  };

  // Update counters
  const curNum = document.getElementById('slide-deck-current-num');
  const totNum = document.getElementById('slide-deck-total-num');
  if (curNum) curNum.textContent = currentSlideIndex + 1;
  if (totNum) totNum.textContent = total;

  // Update download PPTX button in modal
  const pptxLink = document.getElementById('slide-deck-download-pptx');
  const pptxFile = WEEK_PPTX_MAP[currentSlideWeek];
  const isFlaskServer = window.location.port === '5000' || (window.location.hostname === 'localhost' && window.location.port !== '');
  if (pptxLink && pptxFile) {
    pptxLink.setAttribute('download', pptxFile);
    pptxLink.href = isFlaskServer
      ? `/slides/${encodeURIComponent(pptxFile)}`
      : `01_每週教學簡報_PPT/${encodeURIComponent(pptxFile)}`;
  }

  // Update progress dots
  const dotsContainer = document.getElementById('slide-dots-container');
  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: total }, (_, i) => `
      <button onclick="goToSlide(${i})" class="slide-dot h-2 rounded-full transition-all ${i === currentSlideIndex ? 'active bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500 w-2'}" title="第 ${i+1} 頁"></button>
    `).join('');
  }

  // Render slide content in #slide-content-container
  const container = document.getElementById('slide-content-container');
  if (!container) return;
  container.className = 'h-full flex flex-col justify-between slide-anim';

  if (slide.type === 'cover') {
    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow tracking-wider">萬能科技大學 企業管理系</span>
          <span class="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-xs font-bold px-3 py-1 rounded-full">進企四系4甲</span>
          <span class="bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-xs font-bold px-3 py-1 rounded-full">週四 16:20~17:50</span>
        </div>
        <span class="text-amber-400 text-xs font-bold font-mono">WEEK ${String(currentSlideWeek).padStart(2, '0')}</span>
      </div>

      <div class="my-auto text-center space-y-5 px-4">
        <div class="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-1">
          企業資源規劃 (ERP) ✕ Agentic AI 前瞻應用
        </div>
        <h1 class="slide-cover-title text-white tracking-tight leading-tight">
          ${slide.title}
        </h1>
        <p class="slide-cover-subtitle text-indigo-200 font-medium max-w-4xl mx-auto">
          ${slide.subtitle || weekObj.subtitle || ''}
        </p>
      </div>

      <div class="border-t border-slate-700/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-200 text-sm">授課教師：邱俊維 博士</span>
          <span>｜ 研究室：J801-1 ｜ 信箱：jimchiu@vnu.edu.tw</span>
        </div>
        <div class="text-amber-400 font-bold">
          ★ 考取 AI 賦能 ERP 或相關證照直接加分！
        </div>
      </div>
    `;
  } else {
    // Standard Content Slide
    const bulletsHtml = (slide.bullets || []).map((b, idx) => `
      <li class="flex items-start gap-3.5 group">
        <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/30 text-amber-400 border border-blue-500/40 text-sm font-bold shrink-0 mt-0.5 shadow">
          ${idx + 1}
        </span>
        <span class="slide-bullet-text text-slate-100 font-normal leading-relaxed">
          ${b}
        </span>
      </li>
    `).join('');

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded shadow">
            第 ${currentSlideWeek} 週
          </span>
          <span class="bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-md shadow">
            ${slide.badge || '實務精講'}
          </span>
          <span class="text-xs text-slate-400 hidden sm:inline">${weekObj.title}</span>
        </div>
        <div class="text-xs font-mono text-slate-400 font-bold">
          ${currentSlideIndex + 1} / ${total}
        </div>
      </div>

      <div class="my-auto py-3 sm:py-5 space-y-4 sm:space-y-6">
        <h2 class="slide-title-large text-amber-300 font-extrabold tracking-tight">
          ${slide.title}
        </h2>
        <ul class="space-y-3 sm:space-y-4 max-w-5xl">
          ${bulletsHtml}
        </ul>
      </div>

      <div class="border-t border-slate-700/60 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-300 slide-footer-text">
          <span class="text-amber-400 font-bold">💡 重點摘要：</span>
          <span>${slide.footer || '熟練本單元核心流程與操作，即可掌握企業系統整合精神。'}</span>
        </div>
        <div class="text-[11px] text-slate-400 shrink-0 font-medium">
          萬能科大企管系 ｜ 邱俊維 博士
        </div>
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

function nextSlide() {
  const weekObj = slidesData.find(s => s.week === currentSlideWeek);
  const slides = weekObj ? weekObj.slides || [] : [];
  if (currentSlideIndex < slides.length - 1) {
    currentSlideIndex++;
    renderCurrentSlide();
  } else if (currentSlideWeek < 18) {
    currentSlideWeek++;
    currentSlideIndex = 0;
    const select = document.getElementById('slide-deck-week-select');
    if (select) select.value = currentSlideWeek;
    renderCurrentSlide();
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderCurrentSlide();
  } else if (currentSlideWeek > 1) {
    currentSlideWeek--;
    const weekObj = slidesData.find(s => s.week === currentSlideWeek);
    const slides = weekObj ? weekObj.slides || [] : [];
    currentSlideIndex = Math.max(0, slides.length - 1);
    const select = document.getElementById('slide-deck-week-select');
    if (select) select.value = currentSlideWeek;
    renderCurrentSlide();
  }
}

function goToSlide(idx) {
  currentSlideIndex = idx;
  renderCurrentSlide();
  toggleSlideThumbnailsDrawer(false);
}

function toggleSlideFullscreen() {
  const elem = document.getElementById('slide-deck-modal');
  if (!elem) return;
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn('Fullscreen failed:', err);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function toggleSlideThumbnailsDrawer(forceState) {
  const drawer = document.getElementById('slide-thumbnails-drawer');
  if (!drawer) return;
  const isHidden = drawer.classList.contains('hidden');
  const shouldShow = forceState !== undefined ? forceState : isHidden;

  if (shouldShow) {
    const weekObj = slidesData.find(s => s.week === currentSlideWeek);
    const slides = weekObj ? weekObj.slides || [] : [];
    const grid = document.getElementById('slide-thumbnails-grid');
    if (grid) {
      grid.innerHTML = slides.map((s, idx) => `
        <button onclick="goToSlide(${idx})" class="p-2.5 rounded-lg text-left transition border ${idx === currentSlideIndex ? 'bg-blue-900/60 border-amber-400 text-white' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'}">
          <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span class="font-bold font-mono">P.${idx + 1}</span>
            <span class="px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 font-bold">${s.badge || (s.type === 'cover' ? '封面' : '內容')}</span>
          </div>
          <div class="font-bold text-xs line-clamp-1">${s.title}</div>
        </button>
      `).join('');
    }
    drawer.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
  }
}

// Global Keyboard Navigation for Slide Deck
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('slide-deck-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeSlideDeck();
  } else if (e.key === 'f' || e.key === 'F') {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleSlideFullscreen();
    }
  }
});

