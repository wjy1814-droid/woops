// 인증 관리
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

function getToken() {
    return localStorage.getItem('authToken');
}

function removeToken() {
    localStorage.removeItem('authToken');
}

function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

function showAppScreen() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    const user = getUser();
    if (user) {
        document.getElementById('usernameDisplay').textContent = user.username;
    }
    if (typeof loadMemos === 'function') loadMemos();
}

async function register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    saveToken(data.token);
    saveUser(data.user);
    return data;
}

async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    saveToken(data.token);
    saveUser(data.user);
    return data;
}

function logout() {
    removeToken();
    localStorage.removeItem('currentUser');
    showAuthScreen();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (isLoggedIn()) {
        showAppScreen();
    } else {
        showAuthScreen();
    }
    
    // 로그인 폼
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try {
                await login(email, password);
                showAppScreen();
                document.getElementById('authMessage').textContent = '';
            } catch (error) {
                document.getElementById('authMessage').textContent = error.message;
            }
        });
    }
    
    // 회원가입 폼
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            try {
                await register(username, email, password);
                showAppScreen();
                document.getElementById('authMessage').textContent = '';
            } catch (error) {
                document.getElementById('authMessage').textContent = error.message;
            }
        });
    }
    
    // 탭 전환
    document.getElementById('loginTab')?.addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('registerTab').classList.remove('active');
    });
    
    document.getElementById('registerTab')?.addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
    });
    
    // 로그아웃
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('로그아웃하시겠습니까?')) logout();
    });
});

