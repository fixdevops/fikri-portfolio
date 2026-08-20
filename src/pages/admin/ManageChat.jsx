import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import Layout from "../../components/Layout";
import { Trash2, Send, MessageSquare, Users } from "lucide-react";

export default function ManageChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // id pesan
  const [deletingId, setDeletingId] = useState(null);
  // Filter berdasarkan uid user
  const [selectedUid, setSelectedUid] = useState("all");
  const messagesEndRef = useRef(null);

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
  }, [messages, selectedUid]);

  // Daftar user unik (bukan admin) untuk filter
  const uniqueUsers = Array.from(
    new Map(
      messages
        .filter((m) => !m.is_owner)
        .map((m) => [m.uid, { uid: m.uid, display_name: m.display_name }])
    ).values()
  );

  // Pesan yang ditampilkan: jika filter aktif, tampilkan percakapan user itu + balasan admin
  const displayedMessages =
    selectedUid === "all"
      ? messages
      : messages.filter((m) => m.uid === selectedUid || m.is_owner);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      await supabase.from("chat_messages").insert([
        {
          text: replyText,
          display_name: "Fikri Asyam",
          photo_url: "/fotoprofile fixz.png",
          uid: user?.id || "owner",
          is_owner: true,
          created_at: new Date().toISOString(),
        },
      ]);
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await supabase.from("chat_messages").delete().eq("id", id);
    setConfirmDelete(null);
    setDeletingId(null);
  };

  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleString("id-ID", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "";

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100dvh - 180px)", minHeight: "400px" }}>

        {/* Filter user */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={13} />
            <span>Percakapan:</span>
          </div>
          <button
            onClick={() => setSelectedUid("all")}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              selectedUid === "all"
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            Semua
          </button>
          {uniqueUsers.map((u) => (
            <button
              key={u.uid}
              onClick={() => setSelectedUid(u.uid)}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                selectedUid === u.uid
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {u.display_name || "Anonim"}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {loading ? (
            <p className="text-center text-gray-400 py-8 text-sm">Loading...</p>
          ) : displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquare size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Belum ada pesan</p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const isConfirming = confirmDelete === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-start ${msg.is_owner ? "flex-row-reverse" : ""}`}
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => setHoveredMsg(null)}
                >
                  {/* Avatar */}
                  {msg.photo_url ? (
                    <img
                      src={msg.photo_url}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-1">
                      {msg.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] ${
                      msg.is_owner ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[11px] font-semibold text-gray-600">
                        {msg.display_name}
                      </span>
                      {msg.is_owner && (
                        <span className="text-[9px] bg-gray-600 text-white px-1 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>

                    {/* Reply preview */}
                    {msg.reply_to && (
                      <div className="text-[10px] text-gray-500 px-2 py-1 mb-0.5 rounded border-l-2 bg-gray-50 border-gray-300">
                        <span className="font-semibold">{msg.reply_to.display_name}: </span>
                        <span>{msg.reply_to.text}</span>
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 ${
                        msg.is_owner ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-xl text-sm ${
                          msg.is_owner
                            ? "bg-gray-800 text-white rounded-tr-none"
                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Tombol hapus — muncul saat hover */}
                      {hoveredMsg === msg.id && !isConfirming && (
                        <button
                          onClick={() => setConfirmDelete(msg.id)}
                          className="text-gray-300 hover:text-red-400 flex-shrink-0 p-1 rounded transition-colors"
                          title="Hapus pesan"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Konfirmasi hapus inline */}
                    {isConfirming && (
                      <div className={`mt-1 flex items-center gap-1 ${msg.is_owner ? "justify-end" : ""}`}>
                        <span className="text-[11px] text-gray-500">Hapus pesan ini?</span>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={deletingId === msg.id}
                          className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                          {deletingId === msg.id ? "..." : "Hapus"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input balas */}
        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-gray-200 pt-3"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              selectedUid !== "all"
                ? `Balas ke ${uniqueUsers.find((u) => u.uid === selectedUid)?.display_name || "user"}...`
                : "Tulis balasan sebagai Fikri Asyam..."
            }
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim()}
            className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm hover:bg-gray-700 disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
          >
            <Send size={13} />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </Layout>
  );
}
