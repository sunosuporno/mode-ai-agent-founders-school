"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import { PlusIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@crossmint/client-sdk-react-ui";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSession {
  _id: string;
  sessionId: string;
  createdAt: string;
}

interface Message {
  _id: string;
  role: "user" | "assistant";
  content: string;
  chain: string;
  timestamp: string;
}

export default function ChatInterface() {
  const { wallet } = useWallet();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch chat sessions
  useEffect(() => {
    const fetchChatSessions = async () => {
      if (!wallet?.address) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/sessions/${wallet.address}`
        );
        if (!response.ok) throw new Error("Failed to fetch chat sessions");

        const data = await response.json();
        const sortedSessions = data.sort(
          (a: ChatSession, b: ChatSession) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setChatSessions(sortedSessions);

        // Select first chat if available and none selected
        if (sortedSessions.length > 0 && !activeChatId) {
          setActiveChatId(sortedSessions[0].sessionId);
        }
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatSessions();
  }, [wallet?.address]);

  // Fetch chat history when active chat changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!wallet?.address || !activeChatId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/${wallet.address}/${activeChatId}`
        );
        if (!response.ok) return;

        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchChatHistory();
  }, [wallet?.address, activeChatId]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !wallet?.address || isSending) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    // Create user message
    const userMessage: Message = {
      _id: Date.now().toString(),
      role: "user",
      content: messageText,
      chain: "mode",
      timestamp: new Date().toISOString(),
    };

    try {
      // Create new chat session if needed
      let currentSessionId = activeChatId;
      if (!currentSessionId) {
        const sessionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/session`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: wallet.address }),
          }
        );
        if (!sessionResponse.ok)
          throw new Error("Failed to create chat session");

        const { sessionId } = await sessionResponse.json();
        currentSessionId = sessionId;
        setActiveChatId(sessionId);

        // Refresh chat sessions list
        const sessionsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/sessions/${wallet.address}`
        );
        if (sessionsResponse.ok) {
          const data = await sessionsResponse.json();
          setChatSessions(
            data.sort(
              (a: ChatSession, b: ChatSession) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
          );
        }
      }

      // Save user message first
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/chat/${wallet.address}/${currentSessionId}/message`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: messageText,
            chain: "mode",
          }),
        }
      );

      // Show user message in UI
      setMessages((prev) => [...prev, userMessage]);

      // Send message to agent
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/call/agent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: messageText,
            walletAddress: wallet.address,
            chain: "mode",
            sessionId: currentSessionId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        _id: Date.now().toString() + "-assistant",
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that request.",
        chain: "mode",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      // Add error message
      const errorMessage: Message = {
        _id: Date.now().toString() + "-error",
        role: "assistant",
        content: "Sorry, there was an error processing your message.",
        chain: "mode",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Panel - Chat Sessions */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        {/* New Chat Button - Fixed at top */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 transition-colors shrink-0"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-extralight">New Chat</span>
        </button>

        {/* Scrollable Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <div className="mt-4 space-y-1 px-2">
            {isLoading ? (
              <div className="text-gray-400 text-sm text-center py-4">
                Loading chats...
              </div>
            ) : (
              chatSessions.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => setActiveChatId(chat.sessionId)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-colors rounded-lg ${
                    activeChatId === chat.sessionId
                      ? "bg-gray-900 text-white"
                      : "text-gray-400 hover:bg-gray-900/50 hover:text-white"
                  }`}
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 shrink-0" />
                  <div className="truncate font-extralight flex-1">
                    <div className="truncate">
                      Chat {formatDate(chat.createdAt)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            <>
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user" ? "bg-yellow-400" : "bg-gray-900"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-invert prose-sm max-w-none font-light text-white"
                        components={{
                          pre: ({ ...props }) => (
                            <div className="overflow-auto my-2 bg-black/50 p-2 rounded-lg">
                              <pre {...props} />
                            </div>
                          ),
                          code: ({
                            inline,
                            ...props
                          }: {
                            inline?: boolean;
                          } & React.HTMLProps<HTMLElement>) =>
                            inline ? (
                              <code
                                className="bg-black/50 px-1 py-0.5 rounded"
                                {...props}
                              />
                            ) : (
                              <code {...props} />
                            ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="font-light text-black">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-900 text-white max-w-[80%] rounded-lg px-4 py-2">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Image
                src="/midas-logo.png"
                alt="Midas Logo"
                width={64}
                height={64}
                className="opacity-50"
              />
              <div className="space-y-2">
                <h2 className="text-2xl font-light text-white">
                  Welcome to Midas Chat
                </h2>
                <p className="text-gray-400 font-extralight max-w-md">
                  Your AI-powered Web3 assistant. Ask me anything about crypto,
                  blockchain, or let me help you with transactions.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-4"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Midas, can you do something for me?"
              className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-yellow-400 font-extralight"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="bg-yellow-400 text-black p-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
