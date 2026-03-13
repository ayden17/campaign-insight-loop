import { useState, FormEvent } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { Card } from "@/components/ui/card";

interface ChatMessage {
  id: number;
  content: string;
  sender: "ai" | "user";
}

export default function AgentPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      content: "Hello! I'm your AI agent. I can help you manage leads, draft follow-up emails, analyze sales calls, and more. What would you like to do?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, content: input, sender: "user" },
    ]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "I'm processing your request. This feature will be connected to the AI backend soon.",
          sender: "ai",
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout title="Agent" subtitle="Chat with your AI assistant">
      <Card className="flex flex-col h-[calc(100vh-10rem)] border border-border">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">AngelFlows Agent</p>
            <p className="text-xs text-muted-foreground">Always available</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessageList smooth>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "ai" ? "received" : "sent"}
              >
                <ChatBubbleAvatar
                  fallback={message.sender === "ai" ? "AI" : "You"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "ai" ? "received" : "sent"}
                >
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" />
                <ChatBubbleMessage variant="received" isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="min-h-12 resize-none rounded-lg bg-background border border-border p-3 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
