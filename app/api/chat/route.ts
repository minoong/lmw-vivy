import { groq } from '@ai-sdk/groq';
import { stepCountIs, streamText, jsonSchema, convertToModelMessages } from "ai";
import type { Tool, UIMessage } from "ai";
import { headers } from "next/headers";

const model = groq("llama-3.1-8b-instant");

// Rate Limiting
const RATE_LIMIT = 10; // 최대 요청 횟수
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24시간 (밀리초)

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

const searchTool: Tool<
  { query: string; category: "general" | "news" | "technical" | "academic" },
  {
    query: string;
    category: string;
    totalResults: number;
    results: Array<{
      title: string;
      snippet: string;
      url: string;
      relevanceScore: number;
    }>;
  }
> = {
  description:
    "Search for information on a specific topic. Use this to find relevant data before analysis or summarization.",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" },
      category: {
        type: "string",
        enum: ["general", "news", "technical", "academic"],
        default: "general",
        description: "The category of search",
      },
    },
    required: ["query"],
  }),
  execute: async ({ query, category = "general" }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const results = [
      {
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Result: ${query}`,
        snippet: `This is a comprehensive ${category} resource about "${query}". It covers key concepts, recent developments, and practical applications.`,
        url: `https://example.com/${category}/${query.toLowerCase().replace(/\s+/g, "-")}`,
        relevanceScore: 0.95,
      },
      {
        title: `Expert Analysis: ${query}`,
        snippet: `In-depth analysis of ${query} with data-driven insights and expert commentary.`,
        url: `https://example.com/analysis/${query.toLowerCase().replace(/\s+/g, "-")}`,
        relevanceScore: 0.88,
      },
      {
        title: `${query} - Latest Updates`,
        snippet: `Stay updated on ${query}. Recent findings and developments in the field.`,
        url: `https://example.com/updates/${query.toLowerCase().replace(/\s+/g, "-")}`,
        relevanceScore: 0.82,
      },
    ];

    return {
      query,
      category,
      totalResults: results.length,
      results,
    };
  },
};

const analyzeTool: Tool<
  {
    topic: string;
    data: string;
    analysisType: "sentiment" | "trend" | "comparison" | "summary";
  },
  {
    topic: string;
    analysisType: string;
    dataLength: number;
    timestamp: string;
    [key: string]: unknown;
  }
> = {
  description:
    "Analyze data or search results to extract insights and patterns. Use this after gathering information.",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      topic: { type: "string", description: "The topic being analyzed" },
      data: { type: "string", description: "The data or content to analyze" },
      analysisType: {
        type: "string",
        enum: ["sentiment", "trend", "comparison", "summary"],
        description: "The type of analysis to perform",
      },
    },
    required: ["topic", "data", "analysisType"],
  }),
  execute: async ({ topic, data, analysisType }) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const analysisResults: Record<string, object> = {
      sentiment: {
        overall: "positive",
        confidence: 0.87,
        breakdown: {
          positive: 0.65,
          neutral: 0.25,
          negative: 0.1,
        },
      },
      trend: {
        direction: "upward",
        momentum: "strong",
        keyIndicators: [
          "increasing interest",
          "growing adoption",
          "expanding market",
        ],
      },
      comparison: {
        aspects: ["feature A vs B", "performance metrics", "user satisfaction"],
        findings: ["Feature A leads in usability", "B has better performance"],
      },
      summary: {
        mainPoints: [
          "Core concept explanation",
          "Key benefits identified",
          "Potential challenges noted",
        ],
        keyInsights: [
          "High relevance to current trends",
          "Strong community support",
        ],
      },
    };

    return {
      topic,
      analysisType,
      dataLength: data.length,
      timestamp: new Date().toISOString(),
      ...analysisResults[analysisType],
    };
  },
};

const synthesizeTool: Tool<
  {
    topic: string;
    searchSummary: string;
    analysisInsights: string;
    format: "brief" | "detailed" | "bullet-points";
  },
  {
    topic: string;
    format: string;
    synthesizedAt: string;
    [key: string]: unknown;
  }
> = {
  description:
    "Synthesize multiple pieces of information into a coherent response. Use this as the final step to combine search results and analysis into a comprehensive answer.",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      topic: { type: "string", description: "The main topic" },
      searchSummary: {
        type: "string",
        description: "Summary of search results",
      },
      analysisInsights: {
        type: "string",
        description: "Key insights from analysis",
      },
      format: {
        type: "string",
        enum: ["brief", "detailed", "bullet-points"],
        default: "detailed",
        description: "Output format",
      },
    },
    required: ["topic", "searchSummary", "analysisInsights"],
  }),
  execute: async ({
    topic,
    searchSummary,
    analysisInsights,
    format = "detailed",
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const formatTemplates: Record<string, object> = {
      brief: {
        summary: `Quick overview of ${topic}: Based on the gathered information, the key takeaway is that this topic shows significant relevance and positive trends.`,
        wordCount: 50,
      },
      detailed: {
        introduction: `Comprehensive analysis of ${topic}`,
        body: `The research reveals several important aspects. ${searchSummary} Furthermore, ${analysisInsights}`,
        conclusion:
          "This synthesis provides a well-rounded understanding of the topic.",
        wordCount: 200,
      },
      "bullet-points": {
        points: [
          `Topic: ${topic}`,
          `Search findings: ${searchSummary.slice(0, 100)}...`,
          `Analysis: ${analysisInsights.slice(0, 100)}...`,
          "Recommendation: Further investigation recommended",
        ],
        wordCount: 100,
      },
    };

    return {
      topic,
      format,
      synthesizedAt: new Date().toISOString(),
      ...formatTemplates[format],
    };
  },
};

const weatherTool: Tool<
  { location: string },
  {
    location: string;
    temperature: number;
    condition: "sunny" | "cloudy" | "rainy" | "snowy" | "partly-cloudy" | "windy";
    humidity: number;
    windSpeed: number;
    feelsLike: number;
    high: number;
    low: number;
  }
> = {
  description:
    "특정 도시의 현재 날씨 정보를 가져옵니다. 사용자가 날씨에 대해 물어볼 때 이 도구를 사용하세요.",
  inputSchema: jsonSchema({
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "날씨를 확인할 도시 이름 (예: 서울, 부산, 도쿄)",
      },
    },
    required: ["location"],
  }),
  execute: async ({ location }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 시뮬레이션된 날씨 데이터
    const conditions = ["sunny", "cloudy", "rainy", "snowy", "partly-cloudy", "windy"] as const;
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const baseTemp = Math.floor(Math.random() * 25) + 5; // 5~30도

    return {
      location,
      temperature: baseTemp,
      condition: randomCondition,
      humidity: Math.floor(Math.random() * 50) + 30, // 30~80%
      windSpeed: Math.floor(Math.random() * 10) + 1, // 1~10 m/s
      feelsLike: baseTemp + Math.floor(Math.random() * 5) - 2, // ±2도
      high: baseTemp + Math.floor(Math.random() * 5) + 2,
      low: baseTemp - Math.floor(Math.random() * 5) - 2,
    };
  },
};

export async function POST(req: Request) {
  // Rate Limiting 체크
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "unknown";
  const { allowed } = getRateLimitInfo(ip);

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": String(RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model,
    messages: modelMessages,
    system: `당신은 여러 도구를 사용하여 종합적인 답변을 제공하는 유능한 리서치 어시스턴트입니다.

사용 가능한 도구:
- weather: 특정 도시의 날씨 정보를 가져옵니다
- search: 정보를 검색합니다
- analyze: 데이터를 분석합니다
- synthesize: 정보를 종합합니다

날씨 관련 질문:
- 사용자가 날씨에 대해 물어보면 weather 도구를 사용하세요
- 날씨 도구 사용 후 결과에 대해 간단히 설명해주세요

일반 질문:
1. search 도구로 정보 검색
2. analyze 도구로 분석
3. synthesize 도구로 종합

모든 응답은 한국어로 제공하세요.`,
    tools: {
      weather: weatherTool,
      search: searchTool,
      analyze: analyzeTool,
      synthesize: synthesizeTool,
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
