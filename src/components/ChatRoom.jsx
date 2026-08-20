import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

const OWNER_UID = 'owner';

export default function ChatRoomComponents() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [dateHeaders, setDateHeaders] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // id pesan yang mau dihapus

    // Guest identity — simpan di localStorage
    const [guestName, setGuestName] = useState(() => localStorage.getItem('chat_name') || '');
    const [nameInput, setNameInput] = useState('');
    const [hasName, setHasName] = useState(() => !!localStorage.getItem('chat_name'));
    // uid unik per browser
    const [guestUid] = useState(() => {
        let uid = localStorage.getItem('chat_uid');
        if (!uid) { uid = crypto.randomUUID(); localStorage.setItem('chat_uid', uid); }
        return uid;
    });

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    const formatFullDate = useCallback((d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }, []);

    const checkDateHeaders = useCallback((msgs) => {
        const headers = {};
        let cur = '';
        msgs.forEach((m, i) => {
            const d = formatFullDate(m.created_at);
            if (d !== cur) { headers[i] = d; cur = d; }
        });
        setDateHeaders(headers);
    }, [formatFullDate]);

    const fetchMessages = useCallback(async () => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true });

        // PRIVASI: hanya tampilkan pesan milik user ini + pesan admin (is_owner=true)
        const filtered = (data || []).filter(m => m.uid === guestUid || m.is_owner === true);
        setMessages(filtered);
        checkDateHeaders(filtered);
    }, [checkDateHeaders, guestUid]);

    useEffect(() => {
        fetchMessages();
        const channel = supabase.channel('chat_room')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchMessages)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [fetchMessages]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleSetName = (e) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        const name = nameInput.trim();
        localStorage.setItem('chat_name', name);
        setGuestName(name);
        setHasName(true);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !hasName) return;
        const msgData = {
            text: newMessage,
            display_name: guestName,
            photo_url: '',
            uid: guestUid,
            is_owner: false,
            created_at: new Date().toISOString(),
        };
        if (replyingTo) {
            msgData.reply_to = { id: replyingTo.id, text: replyingTo.text, display_name: replyingTo.display_name };
        }
        await supabase.from('chat_messages').insert([msgData]);
        setNewMessage('');
        setReplyingTo(null);
    };

    const handleDeleteMessage = async (id) => {
        setDeletingId(id);
        await supabase.from('chat_messages').delete().eq('id', id);
        setConfirmDelete(null);
        setDeletingId(null);
    };

    return (
        <div className="fixed bottom-[70px] md:bottom-6 right-6 z-50">
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                className="w-10 h-10 bg-gray-700 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center relative"
            >
                {isOpen ? <i className="ri-close-line text-lg"></i> : <i className="ri-message-2-line text-lg"></i>}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="absolute bottom-14 right-0 w-[320px] sm:w-[350px] h-[28rem] bg-white/70 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col border border-gray-200">

                    {/* Header */}
                    <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-t-xl flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <i className="ri-chat-smile-2-line text-gray-500"></i>
                            <span className="font-semibold text-sm">Chat Room</span>
                        </div>
                        {hasName && (
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">{guestName}</span>
                                <button
                                    onClick={() => { localStorage.removeItem('chat_name'); setHasName(false); setGuestName(''); setNameInput(''); }}
                                    className="text-xs text-gray-300 hover:text-gray-500 ml-1"
                                    title="Ganti nama"
                                >
                                    <i className="ri-edit-line"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div ref={messagesContainerRef} className="flex-1 p-3 overflow-y-auto space-y-1">
                        {messages.length === 0 && (
                            <p className="text-center text-xs text-gray-400 mt-8">Belum ada pesan. Mulai percakapan! 👋</p>
                        )}
                        {messages.map((msg, index) => {
                            const isMe = msg.uid === guestUid;
                            const isOwner = msg.is_owner;
                            const isConfirming = confirmDelete === msg.id;
                            return (
                                <React.Fragment key={msg.id}>
                                    {dateHeaders[index] && (
                                        <div className="text-center my-2">
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">{dateHeaders[index]}</span>
                                        </div>
                                    )}
                                    <div
                                        id={`msg-${index}`}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                                        onMouseEnter={() => setHoveredMessage(msg.id)}
                                        onMouseLeave={() => { setHoveredMessage(null); }}
                                    >
                                        <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            {/* Nama pengirim */}
                                            {!isMe && (
                                                <div className="flex items-center gap-1 mb-0.5 ml-1">
                                                    <span className="text-[11px] font-semibold text-gray-600">{msg.display_name}</span>
                                                    {isOwner && <span className="text-[9px] bg-gray-600 text-white px-1 rounded">Admin</span>}
                                                </div>
                                            )}

                                            {/* Reply preview */}
                                            {msg.reply_to && (
                                                <div className={`text-[10px] text-gray-500 px-2 py-1 mb-0.5 rounded border-l-2 bg-gray-50 border-gray-300 ${isMe ? 'text-right' : ''}`}>
                                                    <span className="font-semibold">{msg.reply_to.display_name}: </span>
                                                    <span className="truncate">{msg.reply_to.text}</span>
                                                </div>
                                            )}

                                            <div className={`flex items-end gap-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className={`px-3 py-1.5 rounded-2xl text-sm leading-snug relative
                                                    ${isMe ? 'bg-gray-700 text-white rounded-br-sm' : isOwner ? 'bg-gray-800 text-white rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                                    {msg.text}
                                                </div>

                                                {/* Tombol aksi: reply (untuk pesan orang lain) & delete (untuk pesan sendiri) */}
                                                {hoveredMessage === msg.id && (
                                                    <div className={`flex gap-0.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                        {!isMe && (
                                                            <button
                                                                onClick={() => setReplyingTo(msg)}
                                                                className="text-gray-300 hover:text-gray-500 text-xs p-0.5"
                                                                title="Balas"
                                                            >
                                                                <i className="ri-reply-line"></i>
                                                            </button>
                                                        )}
                                                        {isMe && (
                                                            <button
                                                                onClick={() => setConfirmDelete(msg.id)}
                                                                className="text-gray-300 hover:text-red-400 text-xs p-0.5"
                                                                title="Hapus pesan"
                                                            >
                                                                <i className="ri-delete-bin-line"></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Konfirmasi hapus inline */}
                                            {isConfirming && (
                                                <div className="mt-1 flex items-center gap-1 justify-end">
                                                    <span className="text-[10px] text-gray-500">Hapus?</span>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        disabled={deletingId === msg.id}
                                                        className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 disabled:opacity-60"
                                                    >
                                                        {deletingId === msg.id ? '...' : 'Ya'}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(null)}
                                                        className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-300"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            )}

                                            <span className={`text-[9px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.created_at)}</span>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply indicator */}
                    {replyingTo && (
                        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <p className="text-xs text-gray-500">↩ <span className="font-medium">{replyingTo.display_name}</span>: {replyingTo.text.slice(0, 40)}</p>
                            <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600"><i className="ri-close-line"></i></button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white/90 rounded-b-xl">
                        {!hasName ? (
                            <form onSubmit={handleSetName} className="space-y-2">
                                <p className="text-xs text-gray-500 text-center">Masukkan nama untuk mulai chat</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Nama kamu..."
                                        maxLength={30}
                                        required
                                        autoFocus
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-gray-800"
                                    />
                                    <button type="submit" className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800">
                                        OK
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={replyingTo ? `Reply ke ${replyingTo.display_name}...` : "Ketik pesan..."}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-gray-800"
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="bg-gray-700 text-white px-3 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition">
                                    <i className="ri-send-plane-fill"></i>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
