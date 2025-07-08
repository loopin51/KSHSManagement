# EquiTrack - 장비 대여 및 관리 시스템

EquiTrack은 학과나 조직 내의 장비를 효율적으로 관리하고 대여 절차를 간소화하기 위해 설계된 웹 애플리케이션입니다. 사용자는 사용 가능한 장비 목록을 쉽게 조회하고 대여를 신청할 수 있으며, 관리자는 대시보드를 통해 장비 및 대여 현황을 직관적으로 파악하고 관리할 수 있습니다.

## ✨ 주요 기능

### 👩‍💻 사용자 기능
- **장비 카탈로그 조회**: 전체 장비 목록을 확인하고 부서별로 필터링하거나 ID 또는 이름으로 검색할 수 있습니다.
- **실시간 재고 확인**: 각 장비의 총 수량과 현재 대여 가능한 수량을 실시간으로 확인할 수 있습니다.
- **간편한 대여 신청**: 원하는 장비를 여러 개 선택하여 한 번에 대여 신청을 제출할 수 있습니다.
- **사용 현황 확인**: 캘린더와 시간별 타임라인을 통해 전체 장비의 예약 및 대여 현황을 시각적으로 확인할 수 있습니다.

### 🔐 관리자 기능
- **통합 대시보드**: 총 장비 수, 진행 중인 대여, 승인 대기 중인 요청 등 핵심 지표를 한눈에 파악할 수 있습니다.
- **장비 관리**: 새로운 장비를 시스템에 추가하고, 기존 장비의 목록을 확인할 수 있습니다. (수정/삭제 기능은 확장 가능)
- **대여 기록 관리**: 모든 대여 요청을 확인하고, '승인', '거절', '반납 처리' 등 상태를 변경할 수 있습니다.
- **개발용 데이터 시딩**: 개발 환경에서 클릭 한 번으로 로컬 데이터베이스를 초기 상태로 리셋하고 샘플 데이터를 채울 수 있습니다.

## 🛠️ 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org/) (App Router)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [Shadcn/ui](https://ui.shadcn.com/) 및 [Tailwind CSS](https://tailwindcss.com/)
- **데이터베이스**: [Firebase Firestore](https://firebase.google.com/products/firestore)
- **개발 환경**: Firebase Local Emulator Suite
- **폼 관리**: [React Hook Form](https://react-hook-form.com/) 및 [Zod](https://zod.dev/)
- **AI 연동**: [Genkit](https://firebase.google.com/docs/genkit) (기본 설정 완료, 기능 확장 준비)

## 🚀 시작하기

프로젝트를 로컬 환경에서 실행하는 방법은 다음과 같습니다.

### 사전 준비
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### 설치 및 실행

1.  **프로젝트 클론 및 종속성 설치**:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    npm install
    ```

2.  **Firebase 설정**:
    Firebase 프로젝트를 생성하고 웹 앱을 추가한 후, 해당 앱의 `firebaseConfig` 정보를 `src/lib/firebase.ts` 파일에 입력해야 합니다.
    하지만 로컬 개발 시에는 에뮬레이터를 사용하므로 별도의 키를 입력하지 않아도 `demo-equip-track` 프로젝트 ID로 실행됩니다.

3.  **Firebase 에뮬레이터 실행**:
    프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 Firestore 에뮬레이터를 시작합니다.
    ```bash
    firebase emulators:start --only firestore
    ```
    에뮬레이터는 기본적으로 `localhost:8080`에서 실행됩니다.

4.  **개발 서버 실행**:
    새로운 터미널을 열고 다음 명령어를 실행하여 Next.js 개발 서버를 시작합니다.
    ```bash
    npm run dev
    ```
    애플리케이션은 `http://localhost:9002`에서 실행됩니다.

5.  **초기 데이터 생성 (선택 사항)**:
    - `http://localhost:9002/login` 페이지로 이동하여 관리자로 로그인합니다.
    - 관리자 대시보드에서 **'Reset & Seed Database'** 버튼을 클릭하여 샘플 장비와 대여 기록을 로컬 에뮬레이터에 생성합니다.

## 📂 프로젝트 구조

주요 디렉토리 및 파일 구조는 다음과 같습니다.

```
.
├── src
│   ├── app                 # Next.js App Router 페이지 및 레이아웃
│   │   ├── (public)        # 사용자용 페이지 (메인, 현황)
│   │   ├── admin           # 관리자용 페이지 (대시보드, 장비/대여 관리)
│   │   └── api             # API 라우트
│   ├── components          # 리액트 컴포넌트
│   │   └── ui              # Shadcn UI 컴포넌트
│   ├── hooks               # 커스텀 React Hooks (useToast 등)
│   ├── lib                 # 핵심 로직 및 유틸리티
│   │   ├── data.ts         # Firestore 데이터 CRUD 함수
│   │   ├── firebase.ts     # Firebase 초기화 및 에뮬레이터 연결
│   │   ├── seed.ts         # 개발용 데이터 시딩 로직
│   │   └── types.ts        # 전역 TypeScript 타입 정의
│   └── ai                  # Genkit AI 관련 파일
│       └── genkit.ts       # Genkit 초기 설정
└── ...
```
