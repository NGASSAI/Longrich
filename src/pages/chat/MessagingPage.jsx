import { useState, useEffect, useRef, useCallback } from "react";
import { Send, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSocket, useSocketEvent } from "@/context/SocketContext";
import { Button } from "@/components/ui/button";
import { vibrate } from "@/lib/haptics";

const formatTime = (value) =>
  new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function MessagingPage() {
  const { user } = useAuth();
  const { isConnected, emit } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const hasJoinedRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Chargement initial via REST (cree la conversation si elle n'existe pas encore).
  useEffect(() => {
    api
      .get("/conversations/my-conversation")
      .then(({ data }) => {
        setConversation(data.data.conversation);
        setMessages(data.data.conversation.messages || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) scrollToBottom(false);
  }, [isLoading, scrollToBottom]);

  // Rejoint la room Socket.IO de la conversation une fois qu'on la connait
  // et que le socket est connecte, puis marque les messages comme lus.
  useEffect(() => {
    if (!conversation || !isConnected || hasJoinedRef.current) return;
    emit("join_conversation", conversation.id);
    emit("mark_read", conversation.id);
    hasJoinedRef.current = true;
  }, [conversation, isConnected, emit]);

  // Reception d'un nouveau message en temps reel (le sien ou celui de l'admin).
  useSocketEvent("message:new", (message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
    setTimeout(() => scrollToBottom(), 50);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation) return;
    vibrate(8);
    setIsSending(true);
    const content = text.trim();
    setText("");

    try {
      if (isConnected) {
        // Envoi via Socket.IO (temps reel + persistance faite cote serveur).
        emit("send_message", { conversationId: conversation.id, content });
      } else {
        // Repli REST si le socket n'est pas connecte pour une raison quelconque.
        const { data } = await api.post(`/conversations/${conversation.id}/messages`, { content });
        setMessages((prev) => [...prev, data.data.message]);
      }
      setTimeout(() => scrollToBottom(), 50);
    } catch {
      vibrate(30);
      setText(content); // on remet le texte si l'envoi echoue
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="h-8 w-40 bg-sage-pale rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-12 rounded-2xl bg-sage-pale animate-pulse ${i % 2 ? "ml-auto w-2/3" : "w-2/3"}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-emerald-deep flex items-center justify-center text-ivory-warm">
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-display text-xl text-emerald-deep">Assistance Longrich</p>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "En ligne" : "Connexion..."}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" strokeWidth={1.25} />
            <p className="text-muted-foreground text-sm">
              Posez vos questions à notre équipe, elle vous répondra rapidement.
            </p>
          </div>
        ) : (
          messages.map((message) => {
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
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-3 border-t border-border">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrivez votre message..."
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
    </div>
  );
}