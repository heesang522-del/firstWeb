// ==========================================
// [보안 체크] 로그인하지 않은 사용자 쫓아내기
// ==========================================
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('🔒 로그인이 필요한 페이지입니다.');
    window.location.href = 'auth.html';
}

// ==========================================
// 1. 사용할 DOM 엘리먼트 가져오기
// ==========================================
const currentMonthYear = document.getElementById('current-month-year');
const calendarGrid = document.querySelector('.calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const recordHeader = document.querySelector('.record-header h3');
const diaryTextarea = document.querySelector('#diary textarea');
const diaryNotice = document.querySelector('.notice-tag');
const diarySaveBtn = document.querySelector('#diary .save-btn');

const hiddenMemo = document.getElementById('hidden-memo');
const toggleMemoBtn = document.getElementById('toggle-memo-btn');

// ==========================================
// 2. 달력 데이터 설정 (기본값: 현재 날짜인 2026년 7월)
// ==========================================

// 괄호를 비워두면 사용자가 접속한 '진짜 오늘' 날짜를 가져옵니다.
const today = new Date();

// 어제 날짜 구하기: 오늘의 '일(Date)'에서 1을 뺍니다.
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

// 달력의 기준이 될 날짜 (처음 켰을 때는 오늘 날짜의 달을 보여줍니다)
let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

// 캘린더에서 사용자가 '선택한' 날짜 (기본값은 오늘)
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

// ==========================================
// 3. 달력 그리기 함수 (핵심)
// ==========================================
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 상단 제목 업데이트 (예: 2026년 7월)
    currentMonthYear.textContent = `${year}년 ${month + 1}월`;

    // 기존 달력 날짜들 싹 지우기 (요일 레이블은 남겨둠)
    const dayLabels = document.querySelectorAll('.day-label');
    calendarGrid.innerHTML = '';
    dayLabels.forEach(label => calendarGrid.appendChild(label));

    // 이번 달의 1일이 무슨 요일인지 구하기
    const firstDayIndex = new Date(year, month, 1).getDay();
    // 이번 달의 마지막 날짜 구하기 (30일인지 31일인지)
    const lastDay = new Date(year, month + 1, 0).getDate();

    // 1일 시작 전 빈칸 채우기
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyDiv);
    }

    // 실제 날짜 채우기
    for (let day = 1; day <= lastDay; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.textContent = day;

        // 만약 선택된 날짜라면 시각적으로 표시 (active 클래스)
        if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && day === selectedDate.getDate()) {
            dayDiv.classList.add('active');
        }

        // 날짜 클릭 이벤트 추가
        dayDiv.addEventListener('click', () => {
            // 기존 active 제거하고 새로 붙이기
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');

            // 선택된 날짜 변경 및 우측 기록창 업데이트
            selectedDate = new Date(year, month, day);
            updateRecordSection();
        });

        calendarGrid.appendChild(dayDiv);
    }
}

// ==========================================
// 4. 우측 기록창 업데이트 (실시간 글 불러오기 & 수정 가능)
// ==========================================
function updateRecordSection() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    recordHeader.textContent = `${year}년 ${month}월 ${day}일의 기록`;

    const isToday = selectedDate.toDateString() === today.toDateString();
    const isYesterday = selectedDate.toDateString() === yesterday.toDateString();

    // 로컬 스토리지 키 생성 (예: "diary_2026-7-6")
    const dateKey = `diary_${year}-${month}-${day}`;
    const savedDiary = localStorage.getItem(dateKey);

    if (isToday || isYesterday) {
        // [오늘 / 어제 날짜인 경우] -> 언제든 쓰고 고칠 수 있는 상태
        diaryTextarea.disabled = false;
        diaryTextarea.placeholder = "오늘과 어제의 이야기를 기록해보세요...";
        diaryNotice.style.display = 'inline-block';
        diarySaveBtn.style.display = 'block';
        
        // ⭐ 핵심: 기존에 저장한 글이 있으면 '그대로' 보여주고, 없으면 빈칸으로 둡니다.
        diaryTextarea.value = savedDiary ? savedDiary : "";
    } else {
        // [그 외 과거 / 미래 날짜인 경우] -> 수정 불가능한 잠금 상태
        diaryTextarea.disabled = true;
        diaryNotice.style.display = 'none';
        diarySaveBtn.style.display = 'none';
        
        if (savedDiary) {
            diaryTextarea.value = savedDiary;
            diaryTextarea.placeholder = "🔒 과거에 작성한 일기입니다. (수정 불가)";
        } else {
            diaryTextarea.value = "";
            diaryTextarea.placeholder = "🔒 일기는 오늘과 어제 날짜만 작성할 수 있습니다.";
        }
    }
}

// ==========================================
// 5. 일기 저장하기 기능 (저장 후 화면에 글 유지 💾)
// ==========================================
diarySaveBtn.addEventListener('click', () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    
    const dateKey = `diary_${year}-${month}-${day}`;
    const diaryContent = diaryTextarea.value; // trim()을 없애서 줄바꿈이나 공백도 자연스럽게 저장되도록 합니다.

    if (diaryContent.trim() === "") {
        // 만약 내용을 다 지우고 저장을 누르면, 저장소에서도 삭제해 줍니다 (초기화)
        localStorage.removeItem(dateKey);
        alert(`📝 ${year}년 ${month}월 ${day}일 내용이 비워졌습니다.`);
    } else {
        // 내용이 있으면 로컬 스토리지에 덮어쓰기 (수정 반영)
        localStorage.setItem(dateKey, diaryContent);
        alert(`📝 ${year}년 ${month}월 ${day}일 일기가 안전하게 저장되었습니다.`);
    }

    // ⭐ 저장한 직후에 화면을 새로고침하는 대신, 방금 쓴 글 상태를 그대로 유지하기 위해 함수 호출
    updateRecordSection();
});

// ==========================================
// 6. 이전달/다음달 이동 버튼 이벤트
// ==========================================
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// ==========================================
// 7. 왼쪽 아래 메모장 접기/펼치기 토글
// ==========================================
toggleMemoBtn.addEventListener('click', () => {
    // hidden-memo에 collapsed 클래스가 있으면 빼고, 없으면 넣기
    hiddenMemo.classList.toggle('collapsed');

    // 버튼 텍스트 변경
    if (hiddenMemo.classList.contains('collapsed')) {
        toggleMemoBtn.textContent = '열기';
    } else {
        toggleMemoBtn.textContent = '접기';
    }
});

// ==========================================
// 8. 초기 구동 (페이지 열리자마자 실행할 것들)
// ==========================================
// 우선 메모장은 시작할 때 접어두기 위해 초기화
hiddenMemo.classList.add('collapsed');
toggleMemoBtn.textContent = '열기';

// 달력과 기록창 최초 실행
renderCalendar();
updateRecordSection();