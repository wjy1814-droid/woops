# 클라우드 타입 배포 가이드

## 📌 PostgreSQL 데이터베이스 연결 설정

### 1단계: PostgreSQL 데이터베이스 생성

1. **클라우드 타입 대시보드** 접속
2. 프로젝트 선택 후 **"데이터베이스"** 탭 클릭
3. **"새 데이터베이스 추가"** 클릭
4. **PostgreSQL** 선택
5. 데이터베이스 이름 입력 (예: `memo-app-db`)
6. **생성** 클릭

### 2단계: 데이터베이스 연결 정보 확인

데이터베이스 생성 후 다음 정보를 확인:

```
호스트: xxx.cloudtype.app
포트: 5432
데이터베이스명: memo_app
사용자명: postgres
비밀번호: [자동 생성된 비밀번호]
```

또는 **DATABASE_URL** 형식:
```
postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명
```

### 3단계: 환경 변수 설정

프로젝트 **설정 → 환경 변수**에서 추가:

#### 방법 A: DATABASE_URL 사용 (권장)

```bash
DATABASE_URL=postgresql://사용자명:비밀번호@호스트:포트/데이터베이스명
NODE_ENV=production
PORT=3000
```

#### 방법 B: 개별 환경 변수 사용

```bash
DB_HOST=xxx.cloudtype.app
DB_PORT=5432
DB_NAME=memo_app
DB_USER=postgres
DB_PASSWORD=클라우드타입에서_제공한_비밀번호
NODE_ENV=production
PORT=3000
```

### 4단계: 코드 재배포

1. Git에 코드 푸시:
```bash
git add .
git commit -m "데이터베이스 연결 설정 개선"
git push origin main
```

2. 클라우드 타입에서 자동으로 재배포됨

### 5단계: 로그 확인

배포 후 **로그 탭**에서 다음 메시지 확인:

✅ 정상 연결:
```
🔍 데이터베이스 환경 변수 확인:
DATABASE_URL 존재: true
✅ 데이터베이스 연결 테스트 성공!
✅ 메모 테이블이 준비되었습니다.
🚀 서버가 포트 3000에서 실행 중입니다.
```

❌ 연결 실패:
```
❌ 데이터베이스 초기화 오류
```

## 🔧 문제 해결

### 문제 1: "ECONNREFUSED" 오류

**원인**: 데이터베이스 서버에 연결할 수 없음

**해결 방법**:
1. 클라우드 타입에서 PostgreSQL 데이터베이스가 실행 중인지 확인
2. 데이터베이스와 앱이 같은 프로젝트에 있는지 확인
3. 방화벽 설정 확인

### 문제 2: "authentication failed" 오류

**원인**: 사용자명 또는 비밀번호가 잘못됨

**해결 방법**:
1. 클라우드 타입 대시보드에서 데이터베이스 연결 정보 재확인
2. 환경 변수의 `DB_USER`와 `DB_PASSWORD` 다시 설정
3. 비밀번호에 특수 문자가 있는 경우 URL 인코딩 필요

### 문제 3: "database does not exist" 오류

**원인**: 지정한 데이터베이스가 존재하지 않음

**해결 방법**:
1. `DB_NAME`이 실제 데이터베이스 이름과 일치하는지 확인
2. 클라우드 타입에서 데이터베이스 이름 확인

### 문제 4: SSL 연결 오류

**원인**: SSL 설정 문제

**해결 방법**:
- `NODE_ENV=production` 환경 변수가 설정되어 있는지 확인
- 코드에서 SSL 설정이 올바른지 확인 (이미 수정됨)

## 📝 체크리스트

배포 전 확인 사항:

- [ ] PostgreSQL 데이터베이스가 클라우드 타입에 생성됨
- [ ] 환경 변수 `DATABASE_URL` 또는 `DB_HOST`, `DB_USER`, `DB_PASSWORD` 등이 설정됨
- [ ] `NODE_ENV=production` 설정됨
- [ ] `package.json`에 `pg` 패키지가 포함됨
- [ ] 코드가 Git에 푸시됨
- [ ] 클라우드 타입에서 재배포됨

## 🌐 배포 후 테스트

1. 브라우저에서 앱 URL 접속
2. 메모 작성 테스트
3. 새로고침 후 메모가 유지되는지 확인
4. API 엔드포인트 테스트: `https://your-app.cloudtype.app/api/memos`

## 💡 추가 팁

### 데이터베이스 연결 풀 최적화

프로덕션 환경에서는 연결 풀 설정을 최적화하는 것이 좋습니다:

```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,                    // 최대 연결 수
    idleTimeoutMillis: 30000,   // 유휴 연결 타임아웃
    connectionTimeoutMillis: 2000, // 연결 타임아웃
});
```

### 백업 설정

클라우드 타입 대시보드에서 정기적인 데이터베이스 백업을 설정하세요.

---

## 📞 도움이 필요하신가요?

배포 중 문제가 발생하면 다음을 확인하세요:
1. 클라우드 타입 로그 확인
2. 데이터베이스 상태 확인
3. 환경 변수 설정 재확인

