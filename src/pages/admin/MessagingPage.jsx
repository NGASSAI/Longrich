import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle, MessageCircleOff, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket, useSocketEvent } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/haptics";

const formatTime = (value) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const formatRelative = (value) => {
  const diffMin = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} h`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(value));
};

export function MessagingPage() {
  const { user } = useAuth();
  const { isConnected, emit } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");

  const [selectedId, setSelectedId] = useState(null);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const joinedRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const { data } = await api.get("/conversations", { params: { status: statusFilter, limit: 30 } });
      setConversations(data.data.conversations);
    } catch {
      setConversations([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const scrollToBottom = useCallback((smooth = true) => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const selectConversation = async (conv) => {
    vibrate(6);
    setSelectedId(conv.id);
    setIsLoadingThread(true);
    try {
      const { data } = await api.get(`/conversations/${conv.id}`);
      setSelectedConv(data.data.conversation);
      setMessages(data.data.conversation.messages || []);
      setTimeout(() => scrollToBottom(false), 0);
    } catch {
      setSelectedConv(null);
      setMessages([]);
    } finally {
      setIsLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!selectedId || !isConnected || joinedRef.current === selectedId) return;
    emit("join_conversation", selectedId);
    emit("mark_read", selectedId);
    joinedRef.current = selectedId;
  }, [selectedId, isConnected, emit]);

  useSocketEvent("message:new", (message) => {
    setMessages((prev) => {
      if (message.conversationId !== selectedId) return prev;
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
    if (message.conversationId === selectedId) {
      setTimeout(() => scrollToBottom(), 50);
    }
    loadConversations();
  });

  useSocketEvent("message:deleted", ({ messageId }) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  });

  useSocketEvent("conversation:deleted", ({ conversationId }) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (selectedId === conversationId) {
      setSelectedId(null);
      setSelectedConv(null);
      setMessages([]);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedId) return;
    vibrate(8);
    setIsSending(true);
    const content = text.trim();
    setText("");

    try {
      if (isConnected) {
        emit("send_message", { conversationId: selectedId, content });
      } else {
        const { data } = await api.post(`/conversations/${selectedId}/messages`, { content });
        setMessages((prev) => [...prev, data.data.message]);
      }
      setTimeout(() => scrollToBottom(), 50);
    } catch {
      vibrate(30);
      setText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    vibrate(8);
    try {
      if (isConnected) {
        emit("delete_message", { messageId });
      } else {
        await api.delete(`/conversations/${selectedId}/messages/${messageId}`);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch {
      vibrate(30);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedId) return;
    if (!window.confirm("Supprimer toute la conversation ? Cette action est irréversible.")) return;
    vibrate(10);
    try {
      await api.delete(`/conversations/${selectedId}`);
      setConversations((prev) => prev.filter((c) => c.id !== selectedId));
      setSelectedId(null);
      setSelectedConv(null);
      setMessages([]);
    } catch {
      vibrate(30);
      window.alert("Impossible de supprimer la conversation.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-3.5rem)] -m-4 sm:-m-6 lg:-m-8">
      <aside className="w-full sm:w-80 shrink-0 border-r border-sage-pale flex flex-col bg-white">
        <div className="p-4 border-b border-sage-pale">
          <h1 className="font-display text-xl text-emerald-deep mb-3">Messagerie</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm"
          >
            <option value="open">Conversations ouvertes</option>
            <option value="closed">Conversations fermées</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingList ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-sage-pale animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">Aucune conversation.</p>
          ) : (
            conversations.map((conv) => {
              const lastMessage = conv.messages?.[0];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-sage-pale/50 transition-colors ${
                    selectedId === conv.id ? "bg-sage-pale/50" : "hover:bg-sage-pale/20"
                  }`}
                >
                  <div className="h-9 w-9 rounded-full bg-sage-pale flex items-center justify-center shrink-0 text-emerald-deep text-sm font-medium">
                    {conv.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-charcoal truncate">{conv.client.name}</p>
                      {lastMessage && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatRelative(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMessage ? lastMessage.content : "Aucun message"}
                    </p>
                    {!conv.admin && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-amber-gold/20 text-amber-gold text-[10px] font-medium">
                        Non assignée
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col bg-ivory-warm">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" strokeWidth={1.25} />
            <p className="text-muted-foreground text-sm">Sélectionne une conversation pour l'ouvrir.</p>
          </div>
        ) : isLoadingThread ? (
          <div className="flex-1 p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-12 rounded-2xl bg-sage-pale animate-pulse ${i % 2 ? "ml-auto w-2/3" : "w-2/3"}`} />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-sage-pale bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-emerald-deep flex items-center justify-center text-ivory-warm text-sm font-medium shrink-0">
                  {selectedConv?.client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{selectedConv?.client.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{selectedConv?.client.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteConversation}
                className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Supprimer la conversation"
              >
                <MessageCircleOff className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((message) => {
                const isMine = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMine
                          ? "bg-emerald-deep text-ivory-warm rounded-br-md"
                          : "bg-sage-pale text-charcoal rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? "text-ivory-warm/60" : "text-muted-foreground"}`}>
                        {formatTime(message.createdAt)}
                      </p>
                      {isMine && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="mt-1.5 flex items-center gap-1 text-[10px] text-ivory-warm/70 hover:text-ivory-warm active:scale-95 transition-all"
                          aria-label="Supprimer le message"
                        >
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t border-sage-pale bg-white">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="flex-1 h-11 rounded-full border border-input bg-background px-4 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-gold"
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-full shrink-0 active:scale-90 transition-transform"
                disabled={!text.trim() || isSending}
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 