import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabase";
import Layout from "../../components/Layout";

export default function ManageChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});
  const [error, setError] = useState({});
  const [filter, setFilter] = useState("all"); // all | unreplied | replied
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("is_owner", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("manage_chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, fetchMessages)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleReply = async (msg) => {
    const reply = replyText[msg.id]?.trim();
    if (!reply) return;
    if (!msg.user_email) {
      setError((prev) => ({ ...prev, [msg.id]: "User tidak punya email terdaftar." }));
      return;
    }

    setSending((prev) => ({ ...prev, [msg.id]: true }));
    setError((prev) => ({ ...prev, [msg.id]: null }));

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reply-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message_id: msg.id,
            reply_text: reply,
            user_email: msg.user_email,
            user_name: msg.display_name,
            original_message: msg.text,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal kirim email");

      setSent((prev) => ({ ...prev, [msg.id]: true }));
      setReplyText((prev) => ({ ...prev, [msg.id]: "" }));
      fetchMessages();
    } catch (err) {
      setError((prev) => ({ ...prev, [msg.id]: err.message }));
    } finally {
      setSending((prev) => ({ ...prev, [msg.id]: false }));
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

  const filtered = messages.filter((m) => {
    if (filter === "unreplied") return !m.admin_reply;
    if (filter === "replied") return !!m.admin_reply;
    return true;
  });

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Manage Chat</h1>
            <p className="text-xs text-gray-500 mt-0.5">Balas pesan user — balasan dikirim ke email mereka</p>
          </div>
          <div className="flex gap-2">
            {["all", "unreplied", "replied"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition ${
                  filter === f
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "Semua" : f === "unreplied" ? "Belum Dibalas" : "Sudah Dibalas"}
              </button>
            ))}
            <button onClick={fetchMessages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">
            Tidak ada pesan
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white border rounded-xl p-4 ${msg.admin_reply ? "border-green-200" : "border-gray-200"}`}
              >
                {/* User info + waktu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {msg.photo_url ? (
                      <img src={msg.photo_url} alt={msg.display_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                        {msg.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{msg.display_name}</p>
                      <p className="text-xs text-gray-400">{msg.user_email || <span className="text-red-400">Email tidak tersedia</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.admin_reply ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Sudah Dibalas</span>
                    ) : (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Belum Dibalas</span>
                    )}
                    <span className="text-[10px] text-gray-400">{formatDate(msg.created_at)}</span>
                  </div>
                </div>

                {/* Pesan user */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  <p className="text-sm text-gray-800">{msg.text}</p>
                  {msg.reply_to && (
                    <div className="text-xs text-gray-400 mt-1 border-l-2 border-gray-300 pl-2">
                      Reply to: {msg.reply_to.text}
                    </div>
                  )}
                </div>

                {/* Balasan sebelumnya */}
                {msg.admin_reply && (
                  <div className="bg-gray-800 text-white rounded-lg px-3 py-2 mb-3 text-sm">
                    <p className="text-xs text-gray-400 mb-1">Balasan kamu ({formatDate(msg.admin_replied_at)}):</p>
                    <p>{msg.admin_reply}</p>
                  </div>
                )}

                {/* Form balas */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText[msg.id] || ""}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [msg.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleReply(msg)}
                    placeholder={msg.admin_reply ? "Kirim balasan lagi..." : "Tulis balasan..."}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    disabled={sending[msg.id]}
                  />
                  <button
                    onClick={() => handleReply(msg)}
                    disabled={sending[msg.id] || !replyText[msg.id]?.trim()}
                    className="px-4 py-2 bg-gray-800 text-white text-xs font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                  >
                    {sending[msg.id] ? (
                      <><i className="ri-loader-4-line animate-spin"></i> Mengirim...</>
                    ) : (
                      <><i className="ri-send-plane-fill"></i> Kirim Email</>
                    )}
                  </button>
                </div>

                {error[msg.id] && (
                  <p className="text-xs text-red-500 mt-1">{error[msg.id]}</p>
                )}
                {sent[msg.id] && (
                  <p className="text-xs text-green-600 mt-1">✓ Email berhasil dikirim ke {msg.user_email}</p>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </Layout>
  );
}
