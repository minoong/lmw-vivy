# LMW Vivy AI

AI SDK와 Google Gemini 2.0 Flash를 활용한 멀티스텝 도구 호출 채팅 애플리케이션

**Demo:** https://lmw-vivy.vercel.app/

## 주요 기능

- **멀티스텝 도구 호출** - 검색, 분석, 종합 도구를 순차적으로 사용하여 답변 생성
- **Generative UI** - 날씨 정보를 시각적인 카드 UI로 표시
- **Rate Limiting** - 10회 요청 제한

## 기술 스택

- [Next.js 16](https://nextjs.org/) - App Router
- [AI SDK](https://ai-sdk.dev/) - AI Elements UI 컴포넌트
- [Google Gemini 2.0 Flash](https://ai.google.dev/) - LLM 모델
- [Tailwind CSS](https://tailwindcss.com/) - 스타일링
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트

### AI SDK 패키지

| 패키지 | 버전 | 설명 |
|--------|------|------|
| `ai` | ^6.0.3 | AI SDK 코어 - streamText, Tool, UIMessage 등 |
| `@ai-sdk/react` | ^3.0.3 | React 훅 - useChat |
| `@ai-sdk/google` | ^3.0.1 | Google Gemini 프로바이더 |

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 Google AI API 키를 설정합니다:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 설치 및 실행

```bash
pnpm install
pnpm dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 사용 가능한 도구

| 도구 | 설명 |
|------|------|
| weather | 도시별 날씨 정보 조회 |
| search | 정보 검색 |
| analyze | 데이터 분석 |
| synthesize | 정보 종합 |

## 라이선스

MIT
