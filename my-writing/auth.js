// 1. HTML 엘리먼트(요소)들 가져오기
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// ==========================================
// [기능 1] 로그인 / 회원가입 탭 전환 처리
// ==========================================
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// ==========================================
// [기능 2] 회원가입 처리 (데이터 저장)
// ==========================================
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 막음

    const regId = document.getElementById('reg-id').value.trim();
    const regPw = document.getElementById('reg-pw').value;
    const regPwConfirm = document.getElementById('reg-pw-confirm').value;

    // 보안 검증 1: 비밀번호 자릿수 및 복잡성 체크 (최소 8자, 영문/숫자 조합 필수)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(regPw)) {
        alert('비밀번호는 최소 8자 이상이어야 하며, 영문자와 숫자를 최소 1개씩 포함해야 합니다.');
        return;
    }

    // 보안 검증 2: 비밀번호 두 번 입력한 것이 일치하는지 확인
    if (regPw !== regPwConfirm) {
        alert('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
        return;
    }

    // 보안 검증 3: 이미 존재하는 아이디인지 중복 체크
    const existingUser = localStorage.getItem(`user_${regId}`);
    if (existingUser) {
        alert('이미 사용 중인 아이디입니다.');
        return;
    }

    // 가입 정보 객체 생성 (실제 서비스에서는 서버에서 암호화되지만, 프론트 단 구조 설계)
    const userData = {
        id: regId,
        password: btoa(regPw) // btoa(): 간단한 인코딩 (보안 맛보기용, 추후 해시 암호화로 대체)
    };

    // 로컬 스토리지에 유저 정보 저장 (key: user_아이디)
    localStorage.setItem(`user_${regId}`, JSON.stringify(userData));

    alert('🔐 회원가입이 안전하게 완료되었습니다! 로그인해 주세요.');
    
    // 가입 성공 후 로그인 탭으로 자동으로 이동시키기
    tabLogin.click();
    registerForm.reset(); // 입력창 비우기
});

// ==========================================
// [기능 3] 로그인 처리 (데이터 검증 및 세션 부여)
// ==========================================
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const loginId = document.getElementById('login-id').value.trim();
    const loginPw = document.getElementById('login-pw').value;

    // 로컬 스토리지에서 해당 아이디의 유저 정보 가져오기
    const storedUserData = localStorage.getItem(`user_${loginId}`);

    if (!storedUserData) {
        alert('존재하지 않는 아이디이거나 비밀번호가 틀렸습니다.');
        return;
    }

    const user = JSON.parse(storedUserData);

    // 비밀번호 검증 (저장된 인코딩 값과 비교)
    if (user.password === btoa(loginPw)) {
        alert('🔓 인증에 성공했습니다. 메인 화면으로 이동합니다.');
        
        // 보안 로그인 상태 유지 (세션 스토리지에 '지금 로그인 됨' 표시 남기기)
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', loginId);

        // 메인 화면(캘린더)으로 이동!
        window.location.href = 'index.html';
    } else {
        alert('존재하지 않는 아이디이거나 비밀번호가 틀렸습니다.');
    }
});