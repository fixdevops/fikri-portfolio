import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import Layout from "../../components/Layout";

export default function ManageChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const OWNER_EMAIL = "fixzdeveloper@gmail.co";

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("admin_chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, fetchMessages)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      await supabase.from("chat_messages").insert([{
        text: replyText,
        display_name: "Fikri Asyam",
        photo_url: "/fotoprofile fixz.png",
        uid: user?.id || "owner",
        is_owner: true,
        created_at: new Date().toISOString(),
      }]);
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus pesan ini?")) return;
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  const formatTime = (d) =>
    d ? new Date(d).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : "";

  return (
    <Layout>
      <div className="flex flex-col h-[75vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Belum ada pesan</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 items-start ${msg.is_owner ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {msg.photo_url ? (
                  <img src={msg.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-1">
                    {msg.display_name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className={`max-w-[70%] ${msg.is_owner ? "items-end" : "items-start"} flex flex-col`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[11px] font-semibold text-gray-600">{msg.display_name}</span>
                    {msg.is_owner && (
                      <span className="text-[9px] bg-gray-600 text-white px-1 py-0.5 rounded">Admin</span>
                    )}
                    <span className="text-[10px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>

                  <div className={`flex items-center gap-1 ${msg.is_owner ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`px-3 py-2 rounded-xl text-sm ${
                        msg.is_owner
                          ? "bg-gray-800 text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity"
                      title="Hapus"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input balas */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 pt-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasan sebagai Fikri Asyam..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm hover:bg-gray-700 disabled:opacity-40 flex items-center gap-1"
          >
            <i className="ri-send-plane-fill"></i>
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </Layout>
  );
}
