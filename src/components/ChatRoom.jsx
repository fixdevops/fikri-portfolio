import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';

export default function ChatRoomComponents() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [lastSeenIndex, setLastSeenIndex] = useState(0);
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const [dateHeaders, setDateHeaders] = useState({});

    // Login state
    const [loginStep, setLoginStep] = useState('form'); // 'form' | 'sent'
    const [loginEmail, setLoginEmail] = useState('');
    const [loginName, setLoginName] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const OWNER_EMAIL = "fixzdeveloper@gmail.co";

    // Handle login dengan Magic Link (email asli wajib)
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginEmail.trim() || !loginName.trim()) return;
        setLoginLoading(true);
        setLoginError('');
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: loginEmail.trim(),
                options: {
                    data: { full_name: loginName.trim() },
                    shouldCreateUser: true,
                }
            });
            if (error) throw error;
            setLoginStep('sent');
        } catch (err) {
            setLoginError(err.message || 'Gagal mengirim link. Coba lagi.');
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setReplyingTo(null);
        } catch (error) {
            console.error('Error saat logout:', error);
        }
    };

    // Handle kirim pesan
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;

        try {
            const messageData = {
                text: newMessage,
                display_name: user.user_metadata?.full_name || user.email,
                photo_url: user.user_metadata?.avatar_url || '',
                user_email: user.email,
                created_at: new Date().toISOString(),
                uid: user.id,
                is_owner: user.email === OWNER_EMAIL
            };

            if (replyingTo) {
                messageData.reply_to = {
                    id: replyingTo.id,
                    text: replyingTo.text,
                    display_name: replyingTo.display_name
                };
            }

            const { error } = await supabase
                .from('chat_messages')
                .insert([messageData]);

            if (error) throw error;
            setNewMessage('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error mengirim pesan:', error);
        }
    };

    // Scroll ke bawah saat ada pesan baru
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Format jam menjadi HH:MM
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    // Format tanggal menjadi "18 Juli 2025"
    const formatFullDate = useCallback((dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }, []);

    // Handle buka chat
    const handleOpenChat = () => {
        setIsOpen(true);
        setLastSeenIndex(messages.length);
    };

    // Handle tutup chat
    const handleCloseChat = () => {
        setIsOpen(false);
        setLastSeenIndex(messages.length);
    };

    // Cek apakah tanggal berbeda untuk menambahkan header tanggal
    const checkDateHeaders = useCallback((messages) => {
        const headers = {};
        let currentDate = '';
        
        messages.forEach((msg, index) => {
            const msgDate = msg.created_at ? formatFullDate(msg.created_at) : '';
            if (msgDate !== currentDate) {
                headers[index] = msgDate;
                currentDate = msgDate;
            }
        });
        
        setDateHeaders(headers);
    }, [formatFullDate]);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            setMessages(data || []);
            checkDateHeaders(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [checkDateHeaders]);

    useEffect(() => {
        if (isOpen) {
            if (messagesContainerRef.current && lastSeenIndex > 0) {
                const lastSeenElement = document.getElementById(`msg-${lastSeenIndex-1}`);
                if (lastSeenElement) {
                    lastSeenElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                scrollToBottom();
            }
        }
    }, [messages, isOpen, lastSeenIndex]);

    // Subscribe to real-time changes using Supabase Realtime
    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel('chat_messages_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_messages'
            }, () => {
                fetchMessages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchMessages]);

    // Listen to auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            if (session?.user) {
                setLastSeenIndex(messages.length);
            }
        });

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [messages.length]);

    const handleReply = (message) => {
        setReplyingTo(message);
        scrollToBottom();
    };

    const cancelReply = () => {
        setReplyingTo(null);
    };

    return (
        <div className="fixed bottom-[70px] md:bottom-6 right-6 z-50">
            {/* Chat bubble toggle */}
            <div className="relative">
                <button
                    onClick={isOpen ? handleCloseChat : handleOpenChat}
                    className="w-10 h-10 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all flex items-center justify-center relative"
                >
                    {isOpen ? (
                        <i className="ri-close-line text-md"></i>
                    ) : (
                        <i className="ri-message-2-line text-md"></i>
                    )}
                </button>
            </div>

            {/* Chat window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] h-[28rem] bg-white/60 backdrop-blur-sm rounded-lg shadow-xl flex flex-col border border-gray-200 transition-all duration-300">
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-md text-black p-2 rounded-t-lg flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center gap-1">
                            {user ? (
                                <>
                                    <img
                                        src={user.user_metadata?.avatar_url || ''}
                                        alt={user.user_metadata?.full_name || 'User'}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <h3 className="font-semibold text-sm">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
                                </>
                            ) : (
                                <>
                                    <i className="ri-chat-smile-2-line"></i>
                                    <h3 className="font-semibold text-sm">Chat Room</h3>
                                </>
                            )}
                        </div>

                        {user && (
                            <div className="relative flex items-center">
                                <button
                                    onClick={() => setShowMenu((prev) => !prev)}
                                    className="text-gray-600 hover:text-black text-lg"
                                >
                                    <i className="ri-more-2-fill"></i>
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 top-8 bg-white shadow-md rounded-md z-10">
                                        <button
                                            onClick={handleLogout}
                                            className="text-sm text-red-600 hover:bg-red-50 px-4 py-2 w-full text-left"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Messages area */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 p-4 overflow-y-auto scrollbar-hide"
                        onScroll={() => {
                            if (messagesContainerRef.current) {
                                const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
                                if (scrollTop + clientHeight >= scrollHeight - 50) {
                                    setLastSeenIndex(messages.length);
                                }
                            }
                        }}
                    >
                        {messages.map((message, index) => (
                            <React.Fragment key={message.id}>
                                {dateHeaders[index] && (
                                    <div className="text-center my-3">
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                            {dateHeaders[index]}
                                        </span>
                                    </div>
                                )}
                                
                                <div 
                                    id={`msg-${index}`}
                                    className={`mb-3 flex ${message.uid === user?.id ? 'justify-end' : 'justify-start'}`}
                                    onMouseEnter={() => setHoveredMessage(message.id)}
                                    onMouseLeave={() => setHoveredMessage(null)}
                                >
                                    <div className={`relative max-w-xs ${message.uid === user?.id ? 'ml-8' : 'mr-8'}`}>
                                        {message.uid !== user?.id && (
                                            <div className="flex items-center mb-1">
                                                <img
                                                    src={message.photo_url}
                                                    alt={message.display_name}
                                                    className="w-5 h-5 rounded-full mr-2 object-cover"
                                                />
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {message.display_name}
                                                    {message.is_owner && (
                                                        <span className="ml-1 bg-gray-500 text-white text-[9px] px-1 py-0.5 rounded">
                                                            Author
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {/* Reply preview */}
                                        {message.reply_to && (
                                            <div className={`bg-gray-100/70 text-gray-600 text-xs p-2 mb-1 rounded border-l-2 ${message.uid === user?.id ? 'border-gray-500' : 'border-gray-400'}`}>
                                                <div className="font-semibold">
                                                    {message.reply_to.display_name}
                                                </div>
                                                <div className="truncate">
                                                    {message.reply_to.text}
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`inline-block p-2 rounded-lg text-sm relative ${message.uid === user?.id
                                                    ? 'bg-gray-600 text-white rounded-br-none'
                                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                                }`}
                                        >
                                            {message.text}
                                            
                                            {hoveredMessage === message.id && message.uid !== user?.id && (
                                                <button
                                                    onClick={() => handleReply(message)}
                                                    className={`absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm`}
                                                    title="Reply"
                                                >
                                                    <i className="ri-reply-line"></i>
                                                </button>
                                            )}
                                        </div>

                                        <div className={`flex items-center mt-1 ${message.uid === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className="text-[10px] text-gray-500">
                                                {formatTime(message.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply indicator */}
                    {replyingTo && (
                        <div className="bg-gray-100/80 border-t border-gray-200 px-3 py-2 flex justify-between items-center">
                            <div className="text-xs text-gray-600">
                                Replying to <span className="font-semibold">{replyingTo.display_name}</span>
                            </div>
                            <button
                                onClick={cancelReply}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>
                    )}

                    {/* Input area */}
                    <div className="p-3 border-t border-gray-200 bg-white/80 backdrop-blur-md rounded-b-lg">
                        {user ? (
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={replyingTo ? `Reply to ${replyingTo.display_name}...` : "Ketik pesan..."}
                                    className="flex-1 border border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:border-gray-200 transition"
                                />
                                <button
                                    type="submit"
                                    className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition flex items-center justify-center"
                                >
                                    <i className="ri-send-plane-fill"></i>
                                </button>
                            </form>
                        ) : loginStep === 'sent' ? (
                            <div className="text-center py-2">
                                <i className="ri-mail-send-line text-2xl text-gray-400 mb-1 block"></i>
                                <p className="text-xs font-semibold text-gray-700">Cek email kamu!</p>
                                <p className="text-xs text-gray-500 mt-1">Link masuk sudah dikirim ke <span className="font-medium">{loginEmail}</span></p>
                                <button onClick={() => { setLoginStep('form'); setLoginError(''); }} className="text-xs text-gray-400 underline mt-2">Ganti email</button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-2">
                                <p className="text-xs text-gray-500 text-center mb-1">Masukkan nama & email untuk chat</p>
                                <input
                                    type="text"
                                    value={loginName}
                                    onChange={(e) => setLoginName(e.target.value)}
                                    placeholder="Nama kamu"
                                    required
                                    className="w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                                />
                                <input
                                    type="email"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="Email kamu (wajib asli)"
                                    required
                                    className="w-full border border-gray-300 bg-white text-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                                />
                                {loginError && <p className="text-xs text-red-500">{loginError}</p>}
                                <button
                                    type="submit"
                                    disabled={loginLoading}
                                    className="w-full bg-gray-700 hover:bg-gray-800 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 transition"
                                >
                                    {loginLoading ? 'Mengirim...' : 'Kirim Link Masuk →'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
