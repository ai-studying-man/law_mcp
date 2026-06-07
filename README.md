# DAPA Law MCP Bridge

GPTS Actions에서 `korean-law-mcp`를 실시간으로 호출하기 위한 Vercel REST 브릿지입니다.

## 구조

```text
Custom GPTS
  -> GPT Actions
    -> https://dapa-law-mcp.vercel.app/api/defense/*
      -> https://korean-law-mcp.fly.dev/mcp
        -> 법제처 Open API
```

## Vercel 환경변수

Vercel 프로젝트 `dapa-law-mcp`에 아래 환경변수를 저장합니다.

```text
LAW_OC=dusgh4847
MCP_URL=https://korean-law-mcp.fly.dev/mcp
ACTION_API_KEY=직접_생성한_긴_랜덤값
```

`LAW_OC`는 OpenAPI 스키마나 GPTS 지침에 넣지 않습니다. GPTS Actions에는 `ACTION_API_KEY`만 Bearer 인증값으로 넣습니다.

## 로컬 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

## Vercel 배포

GitHub 저장소를 Vercel에서 import한 뒤 프로젝트 이름을 `dapa-law-mcp`로 지정합니다. 사용 가능한 경우 기본 도메인은 아래처럼 생성됩니다.

```text
https://dapa-law-mcp.vercel.app
```

CLI를 사용할 경우:

```bash
vercel link
vercel env add LAW_OC production
vercel env add MCP_URL production
vercel env add ACTION_API_KEY production
vercel deploy --prod
```

## GPTS Actions 설정

1. GPT Builder의 Configure로 이동합니다.
2. Actions를 추가합니다.
3. Authentication은 `API Key` 또는 `Bearer`로 설정합니다.
4. Bearer 값은 Vercel의 `ACTION_API_KEY`와 동일하게 입력합니다.
5. `openapi.yaml` 내용을 Schema에 붙여 넣습니다.

## 주요 엔드포인트

- `GET /api/defense/search`: 방위사업 관련 법령/행정규칙/해석례 검색
- `POST /api/defense/research`: 복합 질의 종합 조사
- `POST /api/defense/document`: 검색 결과의 MST, lawId, 행정규칙 ID, 결정례 ID 기반 상세 조회
- `GET /api/health`: 환경변수 설정 상태 확인

## 방위사업 범위 제한

서버는 아래 키워드가 포함된 요청만 허용합니다.

```text
방위사업, 방위사업청, 방위산업, 방산, 국방조달, 국방획득,
무기체계, 군수품, 방산물자, 방산업체, 절충교역,
국방연구개발, 방위사업관리규정, 국방계약
```
