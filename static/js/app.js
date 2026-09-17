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
  apiKey: "AIzaSyCRrII3d9pY-uv2ndEMy2uy-rJshlB8gGM",
  authDomain: "vnu-erp-11501.firebaseapp.com",
  projectId: "vnu-erp-11501",
  storageBucket: "vnu-erp-11501.firebasestorage.app",
  messagingSenderId: "177461034784",
  appId: "1:177461034784:web:388fab8e5138c8fe1ea145",
  measurementId: "G-9BH9E6VCRW"
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
        const teacherExportMenu = document.getElementById('teacher-export-menu-item');
        const teacherGradeMenu = document.getElementById('teacher-grade-menu-item');
        const navTeacherBtn = document.getElementById('nav-teacher');
        const subLoginPrompt = document.getElementById('submission-login-prompt');
        const subFormBox = document.getElementById('submission-form-box');

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

          // 報告繳交表單：已登入則解除鎖定
          if (subLoginPrompt) subLoginPrompt.classList.add('hidden');
          if (subFormBox) subFormBox.classList.remove('hidden');

          if (isTeacherUser) {
            studentProfile.id = 'TEACHER';
            studentProfile.name = '邱俊維 博士';
            studentProfile.role = 'teacher';
            if (dropdownRole) dropdownRole.textContent = '👑 授課教師 (邱俊維 博士)';
            if (teacherExportMenu) teacherExportMenu.classList.remove('hidden');
            if (teacherGradeMenu) teacherGradeMenu.classList.remove('hidden');
            if (navTeacherBtn) navTeacherBtn.classList.remove('hidden');
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

            if (currentTab === 'teacher') {
              loadTeacherGradeDashboard();
            }
          } else {
            if (dropdownRole) dropdownRole.textContent = '萬能 ERP 學員';
            if (teacherExportMenu) teacherExportMenu.classList.add('hidden');
            if (teacherGradeMenu) teacherGradeMenu.classList.add('hidden');
            if (navTeacherBtn) navTeacherBtn.classList.add('hidden');

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

          // 載入當前學生報告繳交歷程
          loadStudentPersonalReports();

        } else {
          // 未登入
          isTeacherUser = false;
          if (loginBtn) loginBtn.classList.remove('hidden');
          if (authBox) authBox.classList.add('hidden');
          if (teacherExportMenu) teacherExportMenu.classList.add('hidden');
          if (teacherGradeMenu) teacherGradeMenu.classList.add('hidden');
          if (navTeacherBtn) navTeacherBtn.classList.add('hidden');

          if (subLoginPrompt) subLoginPrompt.classList.remove('hidden');
          if (subFormBox) subFormBox.classList.add('hidden');

          loadStudentProfile();
          loadStudentPersonalReports();

          if (currentTab === 'teacher') {
            switchTab('curriculum');
          }
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
      isTeacherUser = false;
      const navTeacherBtn = document.getElementById('nav-teacher');
      if (navTeacherBtn) navTeacherBtn.classList.add('hidden');
      alert('您已安全登出 Google 帳號。');
      if (currentTab === 'teacher') {
        switchTab('curriculum');
      }
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
  if (tabId === 'teacher' && !isTeacherUser) {
    alert('🔒 成績管理區為授課教師專屬空間。\n\n請點擊右上角「Google 登入」使用授課教師帳號 (邱俊維 博士) 登入後即可查閱與計算全班成績。');
    tabId = 'curriculum';
  }
  currentTab = tabId;
  const tabs = ['curriculum', 'submission', 'antigravity', 'simulators', 'agentic', 'exam', 'achievements', 'teacher'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const navBtn = document.getElementById(`nav-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tabId);
    if (navBtn) navBtn.classList.toggle('active', t === tabId);
  });
  if (tabId === 'submission') {
    loadStudentPersonalReports();
  } else if (tabId === 'teacher') {
    loadTeacherGradeDashboard();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) window.lucide.createIcons();
}

// ==================== 18 週進度地圖與 Antigravity 專案 ====================
async function loadCurriculum() {
  if (window.OFFLINE_CURRICULUM && window.OFFLINE_CURRICULUM.length > 0) {
    curriculumData = window.OFFLINE_CURRICULUM;
  }
  try {
    const res = await fetch('/api/curriculum');
    if (res.ok) {
      curriculumData = await res.json();
    } else {
      const resStatic = await fetch('data/curriculum.json');
      if (resStatic.ok) {
        curriculumData = await resStatic.json();
      }
    }
  } catch (e) {
    try {
      const resStatic = await fetch('data/curriculum.json');
      if (resStatic.ok) {
        curriculumData = await resStatic.json();
      }
    } catch (err) {}
  }
  if (!curriculumData || curriculumData.length === 0) {
    curriculumData = window.OFFLINE_CURRICULUM || [];
  }
}

async function loadAntigravityMissions() {
  if (window.OFFLINE_MISSIONS && window.OFFLINE_MISSIONS.length > 0) {
    antigravityMissions = window.OFFLINE_MISSIONS;
  }
  try {
    const res = await fetch('/api/antigravity_missions');
    if (res.ok) {
      antigravityMissions = await res.json();
    } else {
      const resStatic = await fetch('data/antigravity_missions.json');
      if (resStatic.ok) {
        antigravityMissions = await resStatic.json();
      }
    }
  } catch (e) {
    try {
      const resStatic = await fetch('data/antigravity_missions.json');
      if (resStatic.ok) {
        antigravityMissions = await resStatic.json();
      }
    } catch (err) {}
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

  const pptxCleanTitle = (WEEK_PPTX_MAP[weekNum] || '')
    .replace(/^ERP_第\d+週_/, '')
    .replace('.pptx', '')
    .replace(/_/g, ' ');

  const weekInfo = (curriculumData && curriculumData.find(w => w.week === weekNum)) || {
    week: weekNum,
    title: pptxCleanTitle || `第 ${weekNum} 週 ERP 實務單元`,
    chapter: `ERP 標準教學單元 (第 ${weekNum} 週)`,
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
  if (window.OFFLINE_TEMPLATES && window.OFFLINE_TEMPLATES.length > 0) {
    agentTemplates = window.OFFLINE_TEMPLATES;
  }
  try {
    const res = await fetch('/api/agent_templates');
    if (res.ok) {
      agentTemplates = await res.json();
    } else {
      const resStatic = await fetch('data/agent_templates.json');
      if (resStatic.ok) {
        agentTemplates = await resStatic.json();
      }
    }
  } catch (e) {
    try {
      const resStatic = await fetch('data/agent_templates.json');
      if (resStatic.ok) {
        agentTemplates = await resStatic.json();
      }
    } catch (err) {}
  }
  if (!agentTemplates || agentTemplates.length === 0) {
    agentTemplates = window.OFFLINE_TEMPLATES || [];
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
  if (window.OFFLINE_QUESTIONS && window.OFFLINE_QUESTIONS.length > 0) {
    questionsData = window.OFFLINE_QUESTIONS;
    const stat = document.getElementById('total-questions-stat');
    if (stat) stat.textContent = questionsData.length;
  }
  try {
    const res = await fetch('/api/questions?count=300');
    if (res.ok) {
      const data = await res.json();
      questionsData = data.questions || [];
    } else {
      const resStatic = await fetch('data/questions.json');
      if (resStatic.ok) {
        const data = await resStatic.json();
        questionsData = data.questions || data || [];
      }
    }
  } catch (e) {
    try {
      const resStatic = await fetch('data/questions.json');
      if (resStatic.ok) {
        const data = await resStatic.json();
        questionsData = data.questions || data || [];
      }
    } catch (err) {}
  }
  if (!questionsData || questionsData.length === 0) {
    questionsData = window.OFFLINE_QUESTIONS || [];
  }
  const stat = document.getElementById('total-questions-stat');
  if (stat) stat.textContent = questionsData.length;
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

  // Request browser true fullscreen on user gesture if not already
  if (!document.fullscreenElement && modal.requestFullscreen) {
    modal.requestFullscreen().catch(() => {});
  }

  resetSlideIdleTimer();
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
  clearTimeout(slideIdleTimer);
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

  // Render slide content in #slide-content-container (Edge-to-Edge Responsive Layout)
  const container = document.getElementById('slide-content-container');
  if (!container) return;
  container.className = 'w-full h-full flex flex-col justify-between max-w-[1750px] mx-auto slide-anim';

  if (slide.type === 'cover') {
    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-700/60 pb-3 sm:pb-4">
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <span class="bg-blue-600 text-white text-xs sm:text-sm font-black px-3 py-1 sm:py-1.5 rounded-full shadow tracking-wider">萬能科技大學 企業管理系</span>
          <span class="bg-indigo-900/80 text-indigo-200 border border-indigo-700 text-xs sm:text-sm font-bold px-3 py-1 sm:py-1.5 rounded-full">進企四系4甲</span>
          <span class="bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-xs sm:text-sm font-bold px-3 py-1 sm:py-1.5 rounded-full">週四 16:20~17:50</span>
        </div>
        <span class="text-amber-400 text-xs sm:text-sm font-bold font-mono bg-slate-900/80 px-3 py-1 rounded border border-slate-700">WEEK ${String(currentSlideWeek).padStart(2, '0')}</span>
      </div>

      <div class="my-auto text-center space-y-6 sm:space-y-8 px-4 max-w-6xl mx-auto">
        <div class="inline-block bg-amber-500/20 text-amber-300 border border-amber-400/40 text-sm sm:text-base font-bold px-5 py-2 rounded-full mb-1 shadow">
          企業資源規劃 (ERP) ✕ Agentic AI 前瞻應用
        </div>
        <h1 class="slide-cover-title text-white tracking-tight leading-tight">
          ${slide.title}
        </h1>
        <p class="slide-cover-subtitle text-indigo-200 font-medium max-w-5xl mx-auto">
          ${slide.subtitle || weekObj.subtitle || ''}
        </p>
      </div>

      <div class="border-t border-slate-700/60 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-slate-300 gap-2">
        <div class="flex items-center gap-3">
          <span class="font-bold text-white text-base">授課教師：邱俊維 博士</span>
          <span>｜ 研究室：J801-1 ｜ 信箱：jimchiu@vnu.edu.tw</span>
        </div>
        <div class="text-amber-400 font-bold text-sm sm:text-base">
          ★ 考取 AI 賦能 ERP 或相關證照直接加分！
        </div>
      </div>
    `;
  } else {
    // Standard Content Slide
    const bulletsHtml = (slide.bullets || []).map((b, idx) => `
      <li class="flex items-start gap-4 sm:gap-6 group">
        <span class="inline-flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-blue-600/30 text-amber-400 border border-blue-500/40 text-base sm:text-xl font-black shrink-0 mt-0.5 shadow-md">
          ${idx + 1}
        </span>
        <span class="slide-bullet-text text-slate-100 font-normal leading-relaxed">
          ${b}
        </span>
      </li>
    `).join('');

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-700/60 pb-3 sm:pb-4">
        <div class="flex items-center gap-3">
          <span class="bg-amber-500 text-slate-950 font-black text-xs sm:text-sm px-3 py-1.5 rounded-lg shadow">
            第 ${currentSlideWeek} 週
          </span>
          <span class="bg-blue-600 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-lg shadow">
            ${slide.badge || '實務精講'}
          </span>
          <span class="text-xs sm:text-sm text-slate-300 hidden md:inline font-semibold">${weekObj.title}</span>
        </div>
        <div class="text-xs sm:text-sm font-mono text-slate-300 font-bold bg-slate-900/80 px-3 py-1 rounded border border-slate-700">
          ${currentSlideIndex + 1} / ${total}
        </div>
      </div>

      <div class="my-auto py-4 sm:py-8 space-y-6 sm:space-y-8 w-full max-w-6xl mx-auto">
        <h2 class="slide-title-large text-amber-300 font-extrabold tracking-tight">
          ${slide.title}
        </h2>
        <ul class="space-y-4 sm:space-y-6 w-full">
          ${bulletsHtml}
        </ul>
      </div>

      <div class="border-t border-slate-700/60 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-slate-200 slide-footer-text">
          <span class="text-amber-400 font-bold shrink-0 text-base sm:text-lg">💡 重點摘要：</span>
          <span class="font-medium">${slide.footer || '熟練本單元核心流程與操作，即可掌握企業系統整合精神。'}</span>
        </div>
        <div class="text-xs sm:text-sm text-slate-400 shrink-0 font-medium">
          萬能科大企管系 ｜ 邱俊維 博士
        </div>
      </div>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
  resetSlideIdleTimer();
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
  const elem = document.getElementById('slide-deck-modal') || document.documentElement;
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.warn('Fullscreen failed:', err);
      });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
}

// Listen to fullscreen changes to update button icon and label
document.addEventListener('fullscreenchange', () => {
  const isFs = !!document.fullscreenElement;
  const fsText = document.getElementById('fs-text');
  const fsIcon = document.getElementById('fs-icon');
  if (fsText) fsText.textContent = isFs ? '退出全螢幕 (F)' : '全螢幕 (F)';
  if (fsIcon) {
    fsIcon.setAttribute('data-lucide', isFs ? 'minimize' : 'maximize');
  }
  if (window.lucide) window.lucide.createIcons();
  resetSlideIdleTimer();
});

// Auto-hide controls when idle in slide presentation mode
let slideIdleTimer = null;
function resetSlideIdleTimer() {
  const topbar = document.getElementById('slide-deck-topbar');
  const bottombar = document.getElementById('slide-deck-bottombar');
  const navBtns = document.querySelectorAll('.slide-nav-btn');
  if (topbar) topbar.classList.remove('opacity-0', 'pointer-events-none');
  if (bottombar) bottombar.classList.remove('opacity-0', 'pointer-events-none');
  navBtns.forEach(btn => btn.classList.remove('opacity-0', 'pointer-events-none'));

  clearTimeout(slideIdleTimer);
  slideIdleTimer = setTimeout(() => {
    const modal = document.getElementById('slide-deck-modal');
    if (modal && !modal.classList.contains('hidden')) {
      const drawer = document.getElementById('slide-thumbnails-drawer');
      if (!drawer || drawer.classList.contains('hidden')) {
        if (topbar) topbar.classList.add('opacity-0', 'pointer-events-none');
        if (bottombar) bottombar.classList.add('opacity-0', 'pointer-events-none');
        navBtns.forEach(btn => btn.classList.add('opacity-0', 'pointer-events-none'));
      }
    }
  }, 3500);
}

const slideModalElem = document.getElementById('slide-deck-modal');
if (slideModalElem) {
  slideModalElem.addEventListener('mousemove', resetSlideIdleTimer);
  slideModalElem.addEventListener('touchstart', resetSlideIdleTimer);
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
    resetSlideIdleTimer();
  } else {
    drawer.classList.add('hidden');
  }
}

// Global Keyboard Navigation for Slide Deck
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('slide-deck-modal');
  if (!modal || modal.classList.contains('hidden')) return;

  resetSlideIdleTimer();

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

// ==========================================================================
// 學生期中期末報告線上繳交 ✕ 教師專屬成績評定與管理系統
// 萬能科技大學 企業資源規劃 ｜ 授課教師：邱俊維 博士 (jimchiu@vnu.edu.tw)
// ==========================================================================

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let allClassStudents = [];
let allClassReports = [];
let allClassGradesMap = {};
let currentPreviewReport = null;

/**
 * 處理學生提交期中／期末報告
 */
async function handleStudentReportSubmit(e) {
  e.preventDefault();

  if (!currentFirebaseUser) {
    alert('⚠️ 請先使用右上角 Google 登入後再進行作業繳交！');
    loginWithGoogle();
    return;
  }

  const sId = currentStudentInfo ? currentStudentInfo.studentId : '';
  const sName = currentStudentInfo ? currentStudentInfo.studentName : '';
  if (!sId || !sName || sId === '未設定' || sName === '設定座號姓名') {
    alert('⚠️ 繳交前請先填妥「萬能科大學號」與「姓名」，以便老師登記成績！');
    openStudentModal();
    return;
  }

  const typeSelect = document.getElementById('report-type-select');
  const reportType = typeSelect ? typeSelect.value : '期中考';
  const titleInput = document.getElementById('report-title-input');
  const summaryInput = document.getElementById('report-summary-input');
  const urlInput = document.getElementById('report-url-input');
  const fileInput = document.getElementById('report-file-input');
  const certCheckbox = document.getElementById('report-cert-checkbox');

  const title = titleInput ? titleInput.value.trim() : '';
  const summary = summaryInput ? summaryInput.value.trim() : '';
  const liveUrl = urlInput ? urlInput.value.trim() : '';
  const certApplied = certCheckbox ? certCheckbox.checked : false;

  if (!title) {
    alert('請填寫專案報告標題！');
    if (titleInput) titleInput.focus();
    return;
  }
  if (!summary) {
    alert('請填寫核心內容摘要說明！');
    if (summaryInput) summaryInput.focus();
    return;
  }

  const submitBtn = document.getElementById('btn-submit-report');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> <span>報告上傳雲端存檔中...</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  const file = fileInput && fileInput.files ? fileInput.files[0] : null;
  let fileBase64 = '';
  let fileName = '';
  let fileSize = 0;

  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('⚠️ 附件檔案大小超過 10MB 限制！建議先上傳至 Google 雲端硬碟並貼入「線上成果網址」即可。');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5"></i> <span>確認送出繳交報告</span>`;
        if (window.lucide) window.lucide.createIcons();
      }
      return;
    }
    fileName = file.name;
    fileSize = file.size;
    try {
      fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.warn('檔案讀取失敗:', err);
    }
  }

  const reportId = 'ERP-' + Date.now();
  const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });

  const reportDoc = {
    id: reportId,
    uid: currentFirebaseUser.uid,
    email: currentFirebaseUser.email || '',
    student_id: sId,
    student_name: sName,
    course: '11501企業資源規劃',
    class: '進企四系4甲',
    report_type: reportType,
    title: title,
    summary: summary,
    url: liveUrl,
    file_name: fileName,
    file_size: fileSize,
    file_data: fileBase64,
    cert_applied: certApplied,
    submitted_at: nowStr,
    score: null,
    teacher_comment: '',
    graded_at: null
  };

  // 1. 同步存入 Firebase Firestore (erp_reports)
  if (firestoreDb) {
    try {
      await firestoreDb.collection('erp_reports').doc(reportId).set({
        ...reportDoc,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ 學生報告已成功儲存至 Firebase 雲端資料庫');
    } catch (err) {
      console.warn('Firebase 寫入警告 (改用本機儲存):', err);
    }
  }

  // 2. 本地儲存備份
  try {
    const local = JSON.parse(localStorage.getItem('vnu_erp_reports') || '[]');
    local.unshift(reportDoc);
    localStorage.setItem('vnu_erp_reports', JSON.stringify(local));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }

  // 3. 解鎖學生專題成果勳章
  unlockBadge('report_submitted', '📑 考評成果繳交達人', `已繳交 ${reportType}：《${title}》`);

  alert(`🎉 恭喜【進企四系4甲】${sName} 同學！\n\n您的《${title}》(${reportType}) 已成功上傳儲存！\n授課教師邱俊維博士將於線上評閱給分與提供回饋。`);

  const form = document.getElementById('report-submit-form');
  if (form) form.reset();
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i data-lucide="check-circle-2" class="w-5 h-5"></i> <span>確認送出繳交考評成果</span>`;
  }
  loadStudentPersonalReports();
}

/**
 * 載入並渲染當前登入學生的個人報告繳交紀錄
 */
async function loadStudentPersonalReports() {
  const container = document.getElementById('student-personal-reports-container');
  if (!container) return;

  let myReports = [];

  if (firestoreDb && currentFirebaseUser) {
    try {
      const snap = await firestoreDb.collection('erp_reports')
        .where('uid', '==', currentFirebaseUser.uid)
        .get();
      snap.forEach(doc => myReports.push(doc.data()));
    } catch (err) {
      console.warn('Firestore load personal reports warning:', err);
    }
  }

  // 備用本機快取比對
  try {
    const local = JSON.parse(localStorage.getItem('vnu_erp_reports') || '[]');
    local.forEach(lr => {
      const isMine = (currentFirebaseUser && lr.uid === currentFirebaseUser.uid) ||
                     (studentProfile.id && lr.student_id === studentProfile.id);
      if (isMine && !myReports.find(r => r.id === lr.id)) {
        myReports.push(lr);
      }
    });
  } catch(e) {}

  // 排序：最新在上
  myReports.sort((a, b) => (b.id > a.id ? 1 : -1));

  if (myReports.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-slate-400 text-xs">
        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
        尚未繳交任何期中或期末考成果。請於左側選擇期中考或期末考進行繳交！
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = myReports.map(r => {
    const isMidterm = (r.report_type === '期中考' || r.report_type === '期中報告');
    const typeBadge = isMidterm
      ? `<span class="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded">期中考 (40%)</span>`
      : `<span class="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded">期末考 (40%)</span>`;
    
    const isGraded = (r.score !== null && r.score !== undefined && r.score !== '');
    const gradeBadge = isGraded
      ? `<span class="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
           <i data-lucide="award" class="w-3.5 h-3.5 text-emerald-600"></i> 評定得分：${r.score} 分
         </span>`
      : `<span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
           <i data-lucide="clock" class="w-3 h-3"></i> 待老師批改中
         </span>`;

    return `
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            ${typeBadge}
            ${r.cert_applied ? `<span class="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">已申請證照加分</span>` : ''}
          </div>
          ${gradeBadge}
        </div>
        <h4 class="font-bold text-sm text-slate-900">${escapeHtml(r.title || '無標題')}</h4>
        <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
          ${escapeHtml(r.summary || '')}
        </p>
        ${r.teacher_comment ? `
          <div class="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1">
            <span class="font-bold text-emerald-900 flex items-center gap-1">
              <i data-lucide="message-square" class="w-3.5 h-3.5 text-emerald-700"></i> 邱俊維 老師回饋評語：
            </span>
            <p class="text-emerald-800 font-medium">${escapeHtml(r.teacher_comment)}</p>
          </div>
        ` : ''}
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
          <span>繳交時間：${escapeHtml(r.submitted_at || '')}</span>
          <button type="button" onclick="previewStudentReport('${escapeHtml(r.id)}')" class="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> 檢視詳情
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/**
 * 預覽學生報告並支援教師線上即時批閱給分
 */
function previewStudentReport(reportId) {
  let rep = allClassReports.find(r => r.id === reportId);
  if (!rep) {
    try {
      const local = JSON.parse(localStorage.getItem('vnu_erp_reports') || '[]');
      rep = local.find(r => r.id === reportId);
    } catch (e) {}
  }
  if (!rep) {
    alert('找不到該次考評成果資料！');
    return;
  }

  currentPreviewReport = rep;

  const modal = document.getElementById('report-preview-modal');
  if (!modal) return;

  const badgeElem = document.getElementById('preview-report-badge');
  const titleElem = document.getElementById('preview-report-title');
  const studentElem = document.getElementById('preview-report-student');
  const idElem = document.getElementById('preview-report-id');
  const timeElem = document.getElementById('preview-report-time');
  const certElem = document.getElementById('preview-report-cert');
  const summaryElem = document.getElementById('preview-report-summary');
  const linkBox = document.getElementById('preview-report-link-container');
  const linkElem = document.getElementById('preview-report-link');
  const fileBox = document.getElementById('preview-report-file-container');
  const fileElem = document.getElementById('preview-report-file');
  const filenameElem = document.getElementById('preview-report-filename');
  const teacherGradingBox = document.getElementById('preview-teacher-grading-box');
  const scoreInput = document.getElementById('preview-score-input');
  const commentInput = document.getElementById('preview-comment-input');

  if (badgeElem) {
    const isFinal = (rep.report_type === '期末考' || rep.report_type === '期末報告');
    badgeElem.textContent = rep.report_type || '專案考評';
    badgeElem.className = isFinal
      ? 'bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded'
      : 'bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded';
  }
  if (titleElem) titleElem.textContent = rep.title || '無標題';
  if (studentElem) studentElem.textContent = rep.student_name || '同學';
  if (idElem) idElem.textContent = rep.student_id || '未登記';
  if (timeElem) timeElem.textContent = rep.submitted_at || '--';
  if (certElem) {
    certElem.textContent = rep.cert_applied ? '🌟 已申請 AI 賦能 ERP / 專業證照特別加分' : '無';
    certElem.className = rep.cert_applied ? 'font-bold text-amber-700' : 'text-slate-500';
  }
  if (summaryElem) summaryElem.textContent = rep.summary || '無摘要說明';

  if (linkBox && linkElem) {
    if (rep.url) {
      linkElem.href = rep.url;
      linkBox.classList.remove('hidden');
    } else {
      linkBox.classList.add('hidden');
    }
  }

  if (fileBox && fileElem && filenameElem) {
    if (rep.file_data || rep.file_name) {
      filenameElem.textContent = `下載附件：${rep.file_name || '檔案'}`;
      fileElem.href = rep.file_data || '#';
      fileElem.download = rep.file_name || 'erp_assignment_file';
      fileBox.classList.remove('hidden');
    } else {
      fileBox.classList.add('hidden');
    }
  }

  // 若為授課教師，顯示批閱打分區塊
  if (teacherGradingBox) {
    if (isTeacherUser) {
      teacherGradingBox.classList.remove('hidden');
      if (scoreInput) scoreInput.value = (rep.score !== null && rep.score !== undefined) ? rep.score : '';
      if (commentInput) commentInput.value = rep.teacher_comment || '';
    } else {
      teacherGradingBox.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeReportPreviewModal() {
  const modal = document.getElementById('report-preview-modal');
  if (modal) modal.classList.add('hidden');
  currentPreviewReport = null;
}

/**
 * 教師在預覽彈窗中直接儲存評分與評語
 */
async function savePreviewModalGrade() {
  if (!currentPreviewReport || !isTeacherUser) return;

  const scoreInput = document.getElementById('preview-score-input');
  const commentInput = document.getElementById('preview-comment-input');
  const scoreVal = scoreInput ? scoreInput.value.trim() : '';
  const commentVal = commentInput ? commentInput.value.trim() : '';

  if (scoreVal === '') {
    alert('請填寫評定分數 (0~100)！');
    return;
  }
  const scoreNum = Number(scoreVal);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    alert('評定分數請填寫 0 ~ 100 之間數值！');
    return;
  }

  const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });
  currentPreviewReport.score = scoreNum;
  currentPreviewReport.teacher_comment = commentVal;
  currentPreviewReport.graded_at = nowStr;

  // 1. 同步更新 Firestore erp_reports
  if (firestoreDb) {
    try {
      await firestoreDb.collection('erp_reports').doc(currentPreviewReport.id).update({
        score: scoreNum,
        teacher_comment: commentVal,
        graded_at: nowStr
      });
      console.log('✅ 評分已同步更新至 Firebase erp_reports');
    } catch (err) {
      console.warn('Firebase 評分更新警告:', err);
    }
  }

  // 2. 更新本地報告快取
  try {
    const local = JSON.parse(localStorage.getItem('vnu_erp_reports') || '[]');
    const idx = local.findIndex(r => r.id === currentPreviewReport.id);
    if (idx !== -1) {
      local[idx].score = scoreNum;
      local[idx].teacher_comment = commentVal;
      local[idx].graded_at = nowStr;
      localStorage.setItem('vnu_erp_reports', JSON.stringify(local));
    }
  } catch(e) {}

  // 3. 同時連動更新該學生在成績表上的分數
  const sKey = currentPreviewReport.student_id || currentPreviewReport.uid;
  if (sKey) {
    let curGrade = allClassGradesMap[sKey] || {
      student_id: currentPreviewReport.student_id,
      student_name: currentPreviewReport.student_name,
      attendance: 90,
      midterm_score: '',
      final_score: '',
      cert_bonus: currentPreviewReport.cert_applied ? 5 : 0,
      teacher_comment: ''
    };
    if (currentPreviewReport.report_type === '期中考' || currentPreviewReport.report_type === '期中報告') {
      curGrade.midterm_score = scoreNum;
    } else if (currentPreviewReport.report_type === '期末考' || currentPreviewReport.report_type === '期末報告') {
      curGrade.final_score = scoreNum;
    }
    if (commentVal) curGrade.teacher_comment = commentVal;
    allClassGradesMap[sKey] = curGrade;

    // 儲存至 erp_grades
    if (firestoreDb) {
      firestoreDb.collection('erp_grades').doc(sKey).set({
        ...curGrade,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true }).catch(() => {});
    }
  }

  alert(`✅ 已成功儲存【${currentPreviewReport.student_name}】同學之 ${currentPreviewReport.report_type} 得分：${scoreNum} 分！`);
  closeReportPreviewModal();
  renderTeacherGradeDashboard();
  loadStudentPersonalReports();
}

/**
 * 教師線上成績管理後台：載入資料庫所有學生、繳交報告與成績紀錄
 */
async function loadTeacherGradeDashboard() {
  if (!isTeacherUser) return;

  const tbody = document.getElementById('teacher-grades-tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-8 text-slate-400">
          <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300"></i>
          正在從 Firebase 雲端載入全班名冊與成績資料...
        </td>
      </tr>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  allClassStudents = [];
  allClassReports = [];
  allClassGradesMap = {};

  // 1. 載入全班學生資料 (Firestore users)
  if (firestoreDb) {
    try {
      const userSnap = await firestoreDb.collection('users').get();
      userSnap.forEach(doc => {
        const u = doc.data();
        if (u.role !== 'teacher' && u.studentId !== 'TEACHER') {
          allClassStudents.push(u);
        }
      });
    } catch (e) {
      console.warn('Firestore load users error:', e);
    }

    // 2. 載入全部繳交報告 (Firestore erp_reports)
    try {
      const repSnap = await firestoreDb.collection('erp_reports').get();
      repSnap.forEach(doc => allClassReports.push(doc.data()));
    } catch (e) {
      console.warn('Firestore load reports error:', e);
    }

    // 3. 載入教師已存成績記錄 (Firestore erp_grades)
    try {
      const grdSnap = await firestoreDb.collection('erp_grades').get();
      grdSnap.forEach(doc => {
        allClassGradesMap[doc.id] = doc.data();
      });
    } catch (e) {
      console.warn('Firestore load grades error:', e);
    }
  }

  // 合併本機 localStorage 報告備份
  try {
    const localReps = JSON.parse(localStorage.getItem('vnu_erp_reports') || '[]');
    localReps.forEach(lr => {
      if (!allClassReports.find(r => r.id === lr.id)) {
        allClassReports.push(lr);
      }
      // 若學生不在 users 列表中，自動補入
      if (lr.student_id && lr.student_id !== '未設定') {
        const exists = allClassStudents.find(s => s.studentId === lr.student_id || s.uid === lr.uid);
        if (!exists) {
          allClassStudents.push({
            uid: lr.uid || lr.student_id,
            studentId: lr.student_id,
            studentName: lr.student_name,
            email: lr.email || '',
            class: '進企四系4甲',
            course: '11501企業資源規劃'
          });
        }
      }
    });
  } catch (e) {}

  // 合併本機 localStorage 成績備份
  try {
    const localGrades = JSON.parse(localStorage.getItem('vnu_erp_grades') || '{}');
    for (const [k, v] of Object.entries(localGrades)) {
      if (!allClassGradesMap[k]) {
        allClassGradesMap[k] = v;
      }
    }
  } catch (e) {}

  // 確保從報告推導新學生名單
  allClassReports.forEach(r => {
    if (r.student_id && r.student_id !== '未設定') {
      const exists = allClassStudents.find(s => s.studentId === r.student_id || s.uid === r.uid);
      if (!exists) {
        allClassStudents.push({
          uid: r.uid || r.student_id,
          studentId: r.student_id,
          studentName: r.student_name,
          email: r.email || '',
          class: '進企四系4甲'
        });
      }
    }
  });

  // 排序：學號升冪
  allClassStudents.sort((a, b) => ((a.studentId || '') > (b.studentId || '') ? 1 : -1));

  renderTeacherGradeDashboard();
}

/**
 * 渲染教師成績總表與計算權重統計
 */
function renderTeacherGradeDashboard() {
  if (!isTeacherUser) return;
  const tbody = document.getElementById('teacher-grades-tbody');
  if (!tbody) return;

  // 1. 統計看板計算
  let totalStudents = allClassStudents.length;
  let midtermCount = 0;
  let finalCount = 0;
  let pendingCount = 0;
  let gradedCount = 0;
  let totalScoreSum = 0;
  let totalScoreStudents = 0;

  allClassReports.forEach(r => {
    if (r.report_type === '期中考' || r.report_type === '期中報告') midtermCount++;
    if (r.report_type === '期末考' || r.report_type === '期末報告') finalCount++;
    if (r.score !== null && r.score !== undefined && r.score !== '') {
      gradedCount++;
    } else {
      pendingCount++;
    }
  });

  const statTotal = document.getElementById('stat-teacher-total-students');
  const statMidterm = document.getElementById('stat-teacher-midterm-count');
  const statFinal = document.getElementById('stat-teacher-final-count');
  const statPending = document.getElementById('stat-teacher-pending-count');
  const statGraded = document.getElementById('stat-teacher-graded-count');
  const statAvg = document.getElementById('stat-teacher-avg-score');

  if (statTotal) statTotal.textContent = totalStudents;
  if (statMidterm) statMidterm.textContent = midtermCount;
  if (statFinal) statFinal.textContent = finalCount;
  if (statPending) statPending.textContent = pendingCount;
  if (statGraded) statGraded.textContent = gradedCount;

  // 2. 搜尋與條件過濾
  const searchQ = (document.getElementById('teacher-search-box')?.value || '').trim().toLowerCase();
  const filterStat = document.getElementById('teacher-filter-status-select')?.value || 'all';

  const filtered = allClassStudents.filter(s => {
    const sId = (s.studentId || '').toLowerCase();
    const sName = (s.studentName || '').toLowerCase();
    const sEmail = (s.email || '').toLowerCase();

    // 關鍵字搜尋
    if (searchQ) {
      const match = sId.includes(searchQ) || sName.includes(searchQ) || sEmail.includes(searchQ);
      if (!match) return false;
    }

    // 學生繳交狀態比對
    const sKey = s.studentId || s.uid;
    const hasMid = allClassReports.some(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期中考' || r.report_type === '期中報告'));
    const hasFin = allClassReports.some(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期末考' || r.report_type === '期末報告'));
    const hasPending = allClassReports.some(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.score === null || r.score === undefined || r.score === ''));

    if (filterStat === 'midterm_submitted' && !hasMid) return false;
    if (filterStat === 'final_submitted' && !hasFin) return false;
    if (filterStat === 'needs_grading' && !hasPending) return false;

    return true;
  });

  const countLabel = document.getElementById('teacher-table-count-label');
  if (countLabel) countLabel.textContent = `顯示 ${filtered.length} / ${totalStudents} 位學生`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center py-8 text-slate-400">
          <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
          查無符合搜尋條件的學生資料。
        </td>
      </tr>
    `;
    if (statAvg) statAvg.textContent = '--';
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let rowsHtml = '';

  filtered.forEach(s => {
    const sKey = s.studentId || s.uid;
    const savedGrade = allClassGradesMap[sKey] || {};

    // 查找學生的期中與期末報告
    const midtermRep = allClassReports.find(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期中考' || r.report_type === '期中報告'));
    const finalRep = allClassReports.find(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期末考' || r.report_type === '期末報告'));

    // 預設分數填入邏輯：優先採用已儲存成績，次之連動報告批改得分，否則依出席率預設 90
    const attendanceVal = (savedGrade.attendance !== undefined && savedGrade.attendance !== '') ? savedGrade.attendance : 90;
    const midtermVal = (savedGrade.midterm_score !== undefined && savedGrade.midterm_score !== '') ? savedGrade.midterm_score : (midtermRep && midtermRep.score !== null ? midtermRep.score : '');
    const finalVal = (savedGrade.final_score !== undefined && savedGrade.final_score !== '') ? savedGrade.final_score : (finalRep && finalRep.score !== null ? finalRep.score : '');
    
    // 證照加分：若學生在任一報告勾選加分且尚未設定加分值，預設給 +5
    const hasCertApplied = (midtermRep && midtermRep.cert_applied) || (finalRep && finalRep.cert_applied);
    const certVal = (savedGrade.cert_bonus !== undefined && savedGrade.cert_bonus !== '') ? savedGrade.cert_bonus : (hasCertApplied ? 5 : 0);
    const commentVal = savedGrade.teacher_comment || '';

    // 計算加權總成績
    const attNum = Number(attendanceVal) || 0;
    const midNum = (midtermVal !== '') ? Number(midtermVal) : null;
    const finNum = (finalVal !== '') ? Number(finalVal) : null;
    const certNum = Number(certVal) || 0;

    let totalScoreDisplay = '--';
    let totalScoreNum = 0;
    let hasCalculableScore = false;

    if (midNum !== null || finNum !== null) {
      // 依比例計算 (平時20% + 期中40% + 期末40% + 證照加分)
      const mScore = midNum !== null ? midNum : 0;
      const fScore = finNum !== null ? finNum : 0;
      totalScoreNum = Math.round((attNum * 0.2) + (mScore * 0.4) + (fScore * 0.4) + certNum);
      totalScoreDisplay = totalScoreNum + ' 分';
      hasCalculableScore = true;
      totalScoreSum += totalScoreNum;
      totalScoreStudents++;
    }

    // 期中考操作鈕
    let midtermCell = '';
    if (midtermRep) {
      const isGraded = midtermRep.score !== null && midtermRep.score !== undefined && midtermRep.score !== '';
      midtermCell = `
        <div class="space-y-1">
          <input type="number" min="0" max="100" id="row-mid-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${midtermVal}" placeholder="40%" class="w-20 text-center font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-200 rounded p-1 mx-auto block text-xs">
          <button type="button" onclick="previewStudentReport('${escapeHtml(midtermRep.id)}')" class="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline">
            <span>檢視期中考</span> ${isGraded ? `<span class="text-emerald-600">(${midtermRep.score}分)</span>` : '<span class="text-amber-600">(待批)</span>'}
          </button>
        </div>
      `;
    } else {
      midtermCell = `
        <div class="space-y-1">
          <input type="number" min="0" max="100" id="row-mid-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${midtermVal}" placeholder="40%" class="w-20 text-center font-medium text-slate-500 border border-slate-200 rounded p-1 mx-auto block text-xs">
          <span class="text-[10px] text-slate-400">未繳交</span>
        </div>
      `;
    }

    // 期末考操作鈕
    let finalCell = '';
    if (finalRep) {
      const isGraded = finalRep.score !== null && finalRep.score !== undefined && finalRep.score !== '';
      finalCell = `
        <div class="space-y-1">
          <input type="number" min="0" max="100" id="row-fin-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${finalVal}" placeholder="40%" class="w-20 text-center font-bold text-purple-700 bg-purple-50/50 border border-purple-200 rounded p-1 mx-auto block text-xs">
          <button type="button" onclick="previewStudentReport('${escapeHtml(finalRep.id)}')" class="inline-flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-800 font-semibold underline">
            <span>檢視期末考</span> ${isGraded ? `<span class="text-emerald-600">(${finalRep.score}分)</span>` : '<span class="text-amber-600">(待批)</span>'}
          </button>
        </div>
      `;
    } else {
      finalCell = `
        <div class="space-y-1">
          <input type="number" min="0" max="100" id="row-fin-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${finalVal}" placeholder="40%" class="w-20 text-center font-medium text-slate-500 border border-slate-200 rounded p-1 mx-auto block text-xs">
          <span class="text-[10px] text-slate-400">未繳交</span>
        </div>
      `;
    }

    rowsHtml += `
      <tr id="grade-row-${escapeHtml(sKey)}" class="hover:bg-slate-50 transition">
        <td class="py-3 px-3 font-mono font-bold text-blue-900">${escapeHtml(s.studentId || '未設定')}</td>
        <td class="py-3 px-3 font-bold text-slate-900">${escapeHtml(s.studentName || '同學')}</td>
        <td class="py-3 px-3 text-slate-500 truncate max-w-[150px]" title="${escapeHtml(s.email || '')}">${escapeHtml(s.email || '--')}</td>
        <td class="py-3 px-2 text-center">
          <input type="number" min="0" max="100" id="row-att-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${attendanceVal}" class="w-16 text-center font-semibold text-blue-700 border border-blue-200 rounded p-1 mx-auto text-xs">
        </td>
        <td class="py-3 px-3 text-center">${midtermCell}</td>
        <td class="py-3 px-3 text-center">${finalCell}</td>
        <td class="py-3 px-2 text-center">
          <input type="number" min="0" max="20" id="row-cert-${escapeHtml(sKey)}" oninput="calcRowTotal('${escapeHtml(sKey)}')" value="${certVal}" class="w-14 text-center font-bold text-amber-700 bg-amber-50/50 border border-amber-200 rounded p-1 mx-auto text-xs" title="證照加分值">
        </td>
        <td class="py-3 px-3 text-center bg-amber-50/50 font-black text-sm text-amber-900" id="row-total-${escapeHtml(sKey)}">
          ${totalScoreDisplay}
        </td>
        <td class="py-3 px-3">
          <input type="text" id="row-comm-${escapeHtml(sKey)}" value="${escapeHtml(commentVal)}" placeholder="輸入教師評語..." class="w-full border border-slate-200 rounded p-1.5 text-xs focus:border-blue-500">
        </td>
        <td class="py-3 px-3 text-center">
          <button type="button" onclick="saveSingleGrade('${escapeHtml(sKey)}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm text-xs transition flex items-center gap-1 mx-auto">
            <i data-lucide="save" class="w-3.5 h-3.5"></i>
            <span>儲存</span>
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  // 更新平均成績
  if (statAvg) {
    if (totalScoreStudents > 0) {
      statAvg.textContent = (totalScoreSum / totalScoreStudents).toFixed(1) + ' 分';
    } else {
      statAvg.textContent = '尚無核算';
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * 即時連動試算單行學生總成績 (無需點擊儲存即可即時看見)
 */
function calcRowTotal(sKey) {
  const attElem = document.getElementById(`row-att-${sKey}`);
  const midElem = document.getElementById(`row-mid-${sKey}`);
  const finElem = document.getElementById(`row-fin-${sKey}`);
  const certElem = document.getElementById(`row-cert-${sKey}`);
  const totalElem = document.getElementById(`row-total-${sKey}`);

  if (!totalElem) return;

  const att = attElem ? Number(attElem.value) || 0 : 0;
  const midVal = midElem ? midElem.value.trim() : '';
  const finVal = finElem ? finElem.value.trim() : '';
  const cert = certElem ? Number(certElem.value) || 0 : 0;

  if (midVal === '' && finVal === '') {
    totalElem.textContent = '--';
    return;
  }

  const mid = midVal !== '' ? Number(midVal) || 0 : 0;
  const fin = finVal !== '' ? Number(finVal) || 0 : 0;

  // 評分標準：平時出席20% + 期中40% + 期末40% + 證照加分
  const total = Math.round((att * 0.2) + (mid * 0.4) + (fin * 0.4) + cert);
  totalElem.textContent = total + ' 分';
  totalElem.className = total >= 60
    ? 'py-3 px-3 text-center bg-amber-50/50 font-black text-sm text-emerald-700'
    : 'py-3 px-3 text-center bg-rose-50 font-black text-sm text-rose-700';
}

/**
 * 儲存單一學生成績至雲端與本地
 */
async function saveSingleGrade(sKey) {
  if (!isTeacherUser) {
    alert('僅授課教師可執行成績登錄！');
    return;
  }

  const s = allClassStudents.find(st => (st.studentId === sKey || st.uid === sKey)) || { studentId: sKey, studentName: '同學' };
  const attElem = document.getElementById(`row-att-${sKey}`);
  const midElem = document.getElementById(`row-mid-${sKey}`);
  const finElem = document.getElementById(`row-fin-${sKey}`);
  const certElem = document.getElementById(`row-cert-${sKey}`);
  const commElem = document.getElementById(`row-comm-${sKey}`);

  const att = attElem ? Number(attElem.value) || 0 : 0;
  const midVal = midElem ? midElem.value.trim() : '';
  const finVal = finElem ? finElem.value.trim() : '';
  const cert = certElem ? Number(certElem.value) || 0 : 0;
  const comment = commElem ? commElem.value.trim() : '';

  const mid = midVal !== '' ? Number(midVal) : null;
  const fin = finVal !== '' ? Number(finVal) : null;

  let totalScore = null;
  if (mid !== null || fin !== null) {
    totalScore = Math.round((att * 0.2) + ((mid || 0) * 0.4) + ((fin || 0) * 0.4) + cert);
  }

  const nowStr = new Date().toLocaleString('zh-TW', { hour12: false });

  const gradeData = {
    student_id: s.studentId || sKey,
    student_name: s.studentName || '同學',
    course: '11501企業資源規劃',
    class: '進企四系4甲',
    attendance: att,
    midterm_score: mid !== null ? mid : '',
    final_score: fin !== null ? fin : '',
    cert_bonus: cert,
    total_score: totalScore,
    teacher_comment: comment,
    updated_at: nowStr
  };

  allClassGradesMap[sKey] = gradeData;

  // 1. 同步寫入 Firestore erp_grades
  if (firestoreDb) {
    try {
      await firestoreDb.collection('erp_grades').doc(sKey).set({
        ...gradeData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('✅ 成績已同步更新至 Firebase erp_grades');
    } catch (err) {
      console.warn('Firestore grade save error:', err);
    }
  }

  // 2. 本地儲存備份
  try {
    const localGrades = JSON.parse(localStorage.getItem('vnu_erp_grades') || '{}');
    localGrades[sKey] = gradeData;
    localStorage.setItem('vnu_erp_grades', JSON.stringify(localGrades));
  } catch(e) {}

  alert(`✅ 已成功儲存【${s.studentName || sKey}】同學之學期成績！\n總成績：${totalScore !== null ? totalScore + ' 分' : '尚在評定中'}`);
}

/**
 * 篩選成績表格
 */
function filterTeacherGradesTable() {
  renderTeacherGradeDashboard();
}

/**
 * 匯出全班成績總表為 Excel (CSV UTF-8 BOM 避免亂碼)
 */
function exportAllGradesToExcel() {
  if (!isTeacherUser) {
    alert('僅授課教師可匯出全班成績！');
    return;
  }

  if (allClassStudents.length === 0) {
    alert('目前尚無學生修課名單可匯出！');
    return;
  }

  let csv = '\uFEFF學號,姓名,班級,Email,平時出席(20%),期中考得分(40%),期末考得分(40%),證照加分,學期總成績,期中考成果/題名,期末考成果/題名,證照加分申請,教師評語,登錄更新時間\n';

  allClassStudents.forEach(s => {
    const sKey = s.studentId || s.uid;
    const g = allClassGradesMap[sKey] || {};

    const midtermRep = allClassReports.find(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期中考' || r.report_type === '期中報告'));
    const finalRep = allClassReports.find(r => (r.student_id === s.studentId || r.uid === s.uid) && (r.report_type === '期末考' || r.report_type === '期末報告'));

    const att = (g.attendance !== undefined && g.attendance !== '') ? g.attendance : 90;
    const mid = (g.midterm_score !== undefined && g.midterm_score !== '') ? g.midterm_score : (midtermRep ? midtermRep.score || '' : '');
    const fin = (g.final_score !== undefined && g.final_score !== '') ? g.final_score : (finalRep ? finalRep.score || '' : '');
    const cert = (g.cert_bonus !== undefined && g.cert_bonus !== '') ? g.cert_bonus : ((midtermRep?.cert_applied || finalRep?.cert_applied) ? 5 : 0);

    let total = '';
    if (mid !== '' || fin !== '') {
      total = Math.round((Number(att) * 0.2) + (Number(mid || 0) * 0.4) + (Number(fin || 0) * 0.4) + Number(cert));
    }

    const midTitle = midtermRep ? (midtermRep.title || '').replace(/"/g, '""') : '未繳交';
    const finTitle = finalRep ? (finalRep.title || '').replace(/"/g, '""') : '未繳交';
    const certApplied = (midtermRep?.cert_applied || finalRep?.cert_applied) ? '已申請' : '無';
    const comm = (g.teacher_comment || '').replace(/"/g, '""');
    const upTime = g.updated_at || '';

    csv += `"${s.studentId || ''}","${s.studentName || ''}","進企四系4甲","${s.email || ''}","${att}","${mid}","${fin}","${cert}","${total}","${midTitle}","${finTitle}","${certApplied}","${comm}","${upTime}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `萬能科技大學_11501企業資源規劃_進企四系4甲_學期成績總表_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


