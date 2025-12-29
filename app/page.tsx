"use client";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Loader } from "@/components/ai-elements/loader";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  Weather,
  WeatherSkeleton,
  type WeatherData,
} from "@/components/ai-elements/weather";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { MessageCircleIcon, SparklesIcon } from "lucide-react";
import type { UIMessage } from "ai";
import { useState, useMemo, useRef } from "react";

const transport = new DefaultChatTransport({
  api: "/api/chat",
});

const weatherSuggestions = [
  "서울 날씨 어때?",
  "도쿄 날씨 알려줘",
  "부산 오늘 날씨",
];

type ToolPart = {
  type: string;
  toolCallId: string;
  state: string;
  input?: unknown;
  output?: unknown;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, error } = useChat({
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue;
    setInputValue("");
    await sendMessage({ text });
    textareaRef.current?.focus();
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    await sendMessage({ text: suggestion });
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="shrink-0 border-b bg-white/80 backdrop-blur-sm dark:bg-black/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-amber-600 animate-caret-blink" />
            <h1 className="font-bold text-gray-700/65">
              LMW Vivy AI
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col overflow-hidden">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="px-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="대화를 시작하세요"
                description="질문을 입력하면 AI가 검색, 분석, 종합 도구를 순차적으로 사용하여 답변합니다."
                icon={<MessageCircleIcon className="size-8" />}
              />
            ) : (
              messages.map((message: UIMessage) => (
                <MessageRenderer key={message.id} message={message} />
              ))
            )}
            {isLoading && messages.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader size={16} />
                <span className="text-sm">처리 중...</span>
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
                오류: {error.message}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="shrink-0 border-t bg-white/80 backdrop-blur-sm dark:bg-black/80 p-4 space-y-3">
          <Suggestions className="justify-center">
            {weatherSuggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                suggestion={suggestion}
                onClick={handleSuggestionClick}
                disabled={isLoading}
              />
            ))}
          </Suggestions>
          <PromptInput
            onSubmit={handleSubmit}
            className="rounded-xl border bg-white shadow-sm dark:bg-zinc-900"
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="계속 스탠바이 하고 있었습니다...!"
              disabled={isLoading}
            />
            <PromptInputFooter>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <SparklesIcon className="size-3" />
                <span>gemini-2.0-flash</span>
              </div>
              <PromptInputSubmit status={status} disabled={isLoading} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </main>
    </div>
  );
}

function MessageRenderer({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  // Separate text parts from tool parts
  const { textParts, toolParts } = useMemo(() => {
    const text: Array<{ type: string; text: string }> = [];
    const tools: ToolPart[] = [];

    for (const part of message.parts) {
      if (part.type === "text" && (part as { text: string }).text.trim() !== "") {
        text.push(part);
      } else if (part.type.startsWith("tool-")) {
        tools.push(part as unknown as ToolPart);
      }
    }

    return { textParts: text, toolParts: tools };
  }, [message.parts]);

  return (
    <Message from={message.role}>
      {/* Render user message or assistant text */}
      {isUser ? (
        <MessageContent>
          {textParts.map((part, idx) =>
            part.type === "text" ? (
              <p key={idx}>{(part as { text: string }).text}</p>
            ) : null
          )}
        </MessageContent>
      ) : (
        <>
          {/* Tool Timeline */}
          {toolParts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <div className="h-px flex-1 bg-border" />
                <span>도구 호출 ({toolParts.length})</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="relative space-y-3">
                {/* Timeline line */}
                <div className="absolute top-0 bottom-0 left-4 w-px bg-border" />
                {toolParts.map((part, idx) => (
                  <ToolRenderer key={idx} part={part} />
                ))}
              </div>
            </div>
          )}

          {/* Assistant text response */}
          {textParts.length > 0 && (
            <MessageContent>
              {textParts.map((part, idx) =>
                part.type === "text" ? (
                  <MessageResponse key={idx}>
                    {(part as { text: string }).text}
                  </MessageResponse>
                ) : null
              )}
            </MessageContent>
          )}
        </>
      )}
    </Message>
  );
}

function ToolRenderer({ part }: { part: ToolPart }) {
  // Extract tool name from type (e.g., "tool-search" -> "search")
  const toolName = part.type.replace("tool-", "");
  const toolNames: Record<string, string> = {
    weather: "날씨",
    search: "검색",
    analyze: "분석",
    synthesize: "종합",
  };

  const state = part.state as
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";

  // Special rendering for weather tool - Generative UI
  if (toolName === "weather") {
    return (
      <div className="relative pl-10">
        {/* Timeline dot */}
        <div className="absolute left-2.5 top-3 size-3 rounded-full border-2 border-background bg-primary" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{toolNames.weather}</span>
            {state !== "output-available" && (
              <span className="text-xs">({state === "input-streaming" ? "대기 중" : "실행 중"})</span>
            )}
          </div>

          {state === "output-available" && part.output ? (
            <Weather {...(part.output as WeatherData)} />
          ) : (
            <WeatherSkeleton />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className="absolute left-2.5 top-3 size-3 rounded-full border-2 border-background bg-primary" />

      <Tool defaultOpen={state !== "output-available"} className="group">
        <ToolHeader
          title={toolNames[toolName] || toolName}
          type={part.type as `tool-${string}`}
          state={state}
        />
        <ToolContent>
          <ToolInput input={part.input} />
          {(state === "output-available" || state === "output-error") && (
            <ToolOutput
              output={part.output}
              errorText={
                state === "output-error" ? String(part.output) : undefined
              }
            />
          )}
        </ToolContent>
      </Tool>
    </div>
  );
}
