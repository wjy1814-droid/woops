// 그룹 관리

async function loadGroups() {
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        displayGroups(data.groups);
    } catch (error) {
        console.error('그룹 로드 오류:', error);
    }
}

function displayGroups(groups) {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (groups.length === 0) {
        container.innerHTML = '<p>아직 가입한 그룹이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = groups.map(group => `
        <div class="group-card">
            <h3>${group.name}</h3>
            <p>${group.description || ''}</p>
            <p>멤버: ${group.member_count}명 | 역할: ${group.my_role}</p>
            ${group.my_role === 'owner' ? `
                <button onclick="deleteGroup(${group.id})">삭제</button>
            ` : ''}
        </div>
    `).join('');
}

async function createGroup(name, description) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
}

async function deleteGroup(groupId) {
    if (!confirm('정말 이 그룹을 삭제하시겠습니까?')) return;
    
    try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        alert(data.message);
        loadGroups();
    } catch (error) {
        alert(error.message);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('groupsBtn')?.addEventListener('click', () => {
        document.getElementById('memosScreen').style.display = 'none';
        document.getElementById('groupsScreen').style.display = 'block';
        loadGroups();
    });
    
    document.getElementById('backToMemosBtn')?.addEventListener('click', () => {
        document.getElementById('groupsScreen').style.display = 'none';
        document.getElementById('memosScreen').style.display = 'block';
    });
    
    document.getElementById('createGroupBtn')?.addEventListener('click', async () => {
        const name = prompt('그룹 이름:');
        if (!name) return;
        const description = prompt('그룹 설명 (선택):');
        try {
            await createGroup(name, description);
            alert('그룹이 생성되었습니다!');
            loadGroups();
        } catch (error) {
            alert(error.message);
        }
    });
});

