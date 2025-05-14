'use client';

import { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { tr, enUS } from 'date-fns/locale';
import { Mail, Clock, User, MessageSquare, X } from 'lucide-react';

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
};

export default function MessagesPage() {
  const { language } = useThemeLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Format date time
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString(
      language === 'tr' ? 'tr-TR' : 'en-US',
      { 
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  // Fetch messages from API
  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/messages');
        
        if (!response.ok) {
          throw new Error('Mesajlar yüklenirken hata oluştu');
        }
        
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err: any) {
        setError(err.message || 'Mesajlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMessages();
  }, []);

  // Handle message selection
  const handleMessageClick = (message: ContactMessage) => {
    setSelectedMessage(message);
  };

  // Handle close message
  const handleCloseMessage = () => {
    setSelectedMessage(null);
  };

  // Dark theme colors
  const bgPrimary = 'bg-dark-grey';
  const bgSecondary = 'bg-graphite';
  const bgAccent = 'bg-carbon-grey';
  const textPrimary = 'text-white';
  const textSecondary = 'text-silver';
  const accentColor = 'text-electric-blue';
  const highlightColor = 'bg-[#213213]';
  const borderColor = 'border-carbon-grey';
  const hoverBg = 'hover:bg-carbon-grey/50';

  if (loading) {
    return (
      <div className={`rounded shadow p-2 flex items-center justify-center h-36 ${bgSecondary}`}>
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={`mt-2 text-sm font-medium ${textPrimary}`}>
            {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded shadow p-2 ${bgSecondary} ${textPrimary}`}>
        <div className="text-red-400 text-center">
          <h2 className="text-sm font-bold mb-1">
            {language === 'tr' ? 'Hata Oluştu' : 'Error Occurred'}
          </h2>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgPrimary} min-h-screen w-full max-w-[100vw] overflow-x-hidden`}>
      <div className="overflow-x-hidden max-w-full p-1">
        <div className="flex items-center mb-2">
          <Mail className={`w-4 h-4 mr-1 ${accentColor}`} />
          <h1 className={`text-base font-bold ${textPrimary}`}>
            {language === 'tr' ? 'İletişim Mesajları' : 'Contact Messages'}
          </h1>
        </div>

        {/* Mobile: Stack vertically */}
        <div className="flex flex-col md:hidden space-y-1 max-w-full overflow-hidden px-0">
          {/* Messages List on Mobile */}
          <div className={`w-[95%] sm:w-[85%] min-w-[220px] max-w-[300px] ml-1 mr-auto rounded ${bgSecondary} shadow border ${borderColor} overflow-hidden`}>
            <div className={`p-1 border-b ${borderColor} flex items-center justify-between`}>
              <div className="flex items-center">
                <MessageSquare className={`w-3 h-3 mr-1 ${accentColor}`} />
                <h2 className={`font-bold text-xs ${textPrimary}`}>
                  {language === 'tr' ? 'Mesajlar' : 'Messages'} 
                </h2>
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${bgAccent} ${textSecondary}`}>
                {messages.length}
              </span>
            </div>
            
            <div className="overflow-y-auto overflow-x-hidden max-h-[20vh]">
              {messages.length === 0 ? (
                <div className="p-2 text-center">
                  <p className={`text-xs ${textSecondary}`}>
                    {language === 'tr' ? 'Mesaj yok' : 'No messages'}
                  </p>
                </div>
              ) : (
                <ul className="text-xs w-full">
                  {messages.map((message) => (
                    <li 
                      key={message.id} 
                      className={`border-b ${borderColor} last:border-b-0 cursor-pointer p-1 ${
                        selectedMessage?.id === message.id ? highlightColor : hoverBg
                      } w-full overflow-hidden`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start overflow-hidden w-full">
                        <User className={`w-2.5 h-2.5 mt-0.5 mr-1 shrink-0 ${accentColor}`} />
                        <div className="w-full overflow-hidden">
                          <div className="truncate text-[10px] font-medium w-3/5">
                            {message.name}
                          </div>
                          <div className="flex justify-end">
                            <span className="text-[8px] whitespace-nowrap text-silver">
                              {formatDateTime(message.createdAt).split(',')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Message Detail on Mobile */}
          {selectedMessage ? (
            <div className={`w-[95%] sm:w-[85%] min-w-[220px] max-w-[300px] ml-1 mr-auto rounded ${bgSecondary} shadow border ${borderColor} overflow-hidden flex-grow`}>
              <div className="p-0.5 overflow-hidden">
                <div className={`p-0.5 rounded ${bgAccent} border ${borderColor} mb-0.5 overflow-hidden`}>
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-start justify-between w-full mb-0.5">
                      <div className="flex items-start max-w-[75%]">
                        <User className={`w-1.5 h-1.5 mt-0.5 mr-0.5 shrink-0 ${accentColor}`} />
                        <div className="text-[8px] font-medium pr-1 break-words">
                          {selectedMessage.name}
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseMessage}
                        className="p-0.5 rounded-full hover:bg-carbon-grey/70 text-silver shrink-0"
                        aria-label="Kapat"
                      >
                        <X className="w-1.5 h-1.5" />
                      </button>
                    </div>
                    <div className="text-[6px] text-silver truncate max-w-full">
                      {selectedMessage.email}
                    </div>
                    <div className="flex items-center text-[6px] text-silver">
                      <Clock className="w-1.5 h-1.5 mr-0.5 shrink-0" />
                      <span className="truncate">
                        {formatDateTime(selectedMessage.createdAt).split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`rounded p-0.5 ${bgPrimary} border ${borderColor} overflow-y-auto overflow-x-hidden w-full max-w-full mb-0.5`}>
                  <p className="text-[8px] break-all whitespace-pre-wrap overflow-x-hidden w-full">
                    {selectedMessage.subject}
                  </p>
                </div>
                
                <div className={`rounded p-0.5 ${bgPrimary} border ${borderColor} overflow-y-auto overflow-x-hidden w-full max-w-full`}>
                  <p className="text-[8px] break-all whitespace-pre-wrap overflow-x-hidden w-full">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-[95%] sm:w-[85%] min-w-[220px] max-w-[300px] ml-1 mr-auto rounded ${bgSecondary} shadow border ${borderColor} p-1 flex flex-col justify-center items-center h-16 overflow-hidden`}>
              <MessageSquare className={`w-4 h-4 mb-1 ${textSecondary} opacity-30`} />
              <p className={`${textSecondary} text-center text-[9px]`}>
                {language === 'tr' 
                  ? 'Bir mesaj seçin' 
                  : 'Select a message'}
              </p>
            </div>
          )}
        </div>

        {/* Desktop: Side by side */}
        <div className="hidden md:flex md:space-x-2 md:h-[calc(100vh-60px)] max-w-full">
          {/* Messages List on Desktop */}
          <div className={`w-80 rounded ${bgSecondary} shadow border ${borderColor} flex flex-col`}>
            <div className={`p-1.5 border-b ${borderColor} flex items-center justify-between`}>
              <div className="flex items-center">
                <MessageSquare className={`w-3 h-3 mr-1 ${accentColor}`} />
                <h2 className={`font-bold text-xs ${textPrimary}`}>
                  {language === 'tr' ? 'Mesajlar' : 'Messages'} 
                </h2>
              </div>
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${bgAccent} ${textSecondary}`}>
                {messages.length}
              </span>
            </div>
            
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {messages.length === 0 ? (
                <div className="p-2 text-center">
                  <p className={`text-xs ${textSecondary}`}>
                    {language === 'tr' ? 'Mesaj yok' : 'No messages'}
                  </p>
                </div>
              ) : (
                <ul className="text-xs">
                  {messages.map((message) => (
                    <li 
                      key={message.id} 
                      className={`border-b ${borderColor} last:border-b-0 cursor-pointer p-1.5 ${
                        selectedMessage?.id === message.id ? highlightColor : hoverBg
                      }`}
                      onClick={() => handleMessageClick(message)}
                    >
                      <div className="flex items-start">
                        <User className={`w-2.5 h-2.5 mt-0.5 mr-1 shrink-0 ${accentColor}`} />
                        <div className="w-full min-w-0 overflow-hidden">
                          <div className="truncate text-xs font-medium">
                            {message.name}
                          </div>
                          <div className="flex justify-end">
                            <span className="text-[10px] whitespace-nowrap text-silver">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Message Detail on Desktop */}
          <div className={`flex-1 rounded ${bgSecondary} shadow border ${borderColor} flex flex-col overflow-hidden`}>
            {selectedMessage ? (
              <div className="p-1.5 flex flex-col flex-grow overflow-hidden">
                <div className={`p-1.5 rounded ${bgAccent} border ${borderColor} mb-1.5 overflow-hidden`}>
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-start justify-between w-full mb-1">
                      <div className="flex items-start">
                        <User className={`w-2.5 h-2.5 mt-0.5 mr-1 shrink-0 ${accentColor}`} />
                        <div className="text-xs font-medium pr-2">
                          {selectedMessage.name}
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseMessage}
                        className="p-0.5 rounded-full hover:bg-carbon-grey/70 text-silver shrink-0"
                        aria-label="Kapat"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-silver truncate">
                      {selectedMessage.email}
                    </div>
                    <div className="flex items-center text-[10px] text-silver">
                      <Clock className="w-2 h-2 mr-0.5 shrink-0" />
                      <span className="truncate">{formatDateTime(selectedMessage.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`rounded p-2 ${bgPrimary} border ${borderColor} overflow-y-auto overflow-x-hidden max-w-full mb-1.5`}>
                  <p className="text-xs break-all whitespace-pre-wrap overflow-x-hidden w-full">
                    {selectedMessage.subject}
                  </p>
                </div>
                
                <div className={`rounded p-2 ${bgPrimary} border ${borderColor} overflow-y-auto overflow-x-hidden flex-grow max-w-full`}>
                  <p className="text-xs break-all whitespace-pre-wrap overflow-x-hidden w-full">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full">
                <MessageSquare className={`w-6 h-6 mb-1.5 ${textSecondary} opacity-30`} />
                <p className={`${textSecondary} text-center text-xs`}>
                  {language === 'tr' 
                    ? 'Bir mesaj seçin' 
                    : 'Select a message'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}