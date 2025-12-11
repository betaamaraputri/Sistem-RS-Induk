import React, { useState, useRef, useEffect } from 'react';
import { ChatMessageComponent } from './components/ChatMessage';
import { sendMessageToOrchestrator, resetChat } from './services/geminiService';
import { ChatMessage, SenderType, AgentRole, ProcessingState } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: SenderType.AGENT,
      text: "Selamat datang di Sistem Agen Cerdas Rumah Sakit INDUK. Saya adalah Orkestrator Operasional.\n\nSaya dapat membantu Anda menghubungkan ke divisi:\n• Manajemen Pasien\n• Penjadwalan Janji Temu\n• Rekam Medis\n• Penagihan & Asuransi\n\nSilakan pilih salah satu aksi cepat di bawah atau ketik permintaan Anda.",
      timestamp: new Date(),
      agentRole: AgentRole.ORCHESTRATOR
    }
  ]);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isThinking: false,
    activeAgent: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, processingState.isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || processingState.isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: SenderType.USER,
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setProcessingState({ isThinking: true, activeAgent: AgentRole.ORCHESTRATOR });

    // Call API
    const response = await sendMessageToOrchestrator(
      userMsg.text,
      (activeRole) => {
        // Callback when a tool starts executing
        setProcessingState({ isThinking: true, activeAgent: activeRole });
      },
      () => {
        // Callback when tool finishes
        setProcessingState(prev => ({ ...prev, activeAgent: AgentRole.ORCHESTRATOR }));
      }
    );

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: SenderType.AGENT,
      text: response.text,
      timestamp: new Date(),
      agentRole: response.role
    };

    setMessages(prev => [...prev, aiMsg]);
    setProcessingState({ isThinking: false, activeAgent: null });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleReset = () => {
    resetChat();
    setMessages([
        {
          id: Date.now().toString(),
          sender: SenderType.AGENT,
          text: "Sistem telah di-reset. Ada yang bisa saya bantu terkait operasional rumah sakit?",
          timestamp: new Date(),
          agentRole: AgentRole.ORCHESTRATOR
        }
    ]);
  };

  const quickActions = [
    { label: "Daftar Pasien", prompt: "Tolong daftarkan pasien baru bernama Budi Santoso, keluhan demam tinggi." },
    { label: "Jadwal Dokter", prompt: "Saya ingin menjadwalkan pertemuan dengan dr. Siti untuk Budi Santoso besok jam 10 pagi." },
    { label: "Cek Riwayat Medis", prompt: "Bisa tolong cek riwayat medis dan hasil tes terakhir pasien Budi Santoso?" },
    { label: "Cek Tagihan", prompt: "Berapa total tagihan asuransi untuk pasien Budi Santoso?" }
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden">
      {/* Sidebar - Context & Architecture Visualization */}
      <aside className="hidden md:flex flex-col w-80 bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-blue-500 text-2xl">✚</span> RS INDUK AI
          </h1>
          <p className="text-xs mt-2 text-slate-500">Sistem Orkestrasi Agen Cerdas</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Active Agent Indicator */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status Agen</h3>
            <div className={`p-4 rounded-lg border transition-all duration-300 ${processingState.activeAgent ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                    {processingState.activeAgent ? "Sedang Memproses..." : "Menunggu Input"}
                </span>
                {processingState.isThinking && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {processingState.activeAgent || AgentRole.ORCHESTRATOR}
              </p>
            </div>
          </div>

          {/* Architecture Map */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Arsitektur Agen</h3>
            
            <div className={`flex items-center gap-3 p-2 rounded transition-colors ${processingState.activeAgent === AgentRole.ORCHESTRATOR ? 'bg-blue-600/20 text-blue-200' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm">Orkestrator Pusat</span>
            </div>

            <div className="pl-4 border-l border-slate-700 space-y-3">
               <div className={`flex items-center gap-3 p-2 rounded transition-colors ${processingState.activeAgent === AgentRole.PATIENT_MGMT ? 'bg-emerald-600/20 text-emerald-200' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-sm">Manajemen Pasien</span>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded transition-colors ${processingState.activeAgent === AgentRole.SCHEDULING ? 'bg-violet-600/20 text-violet-200' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                <span className="text-sm">Penjadwalan</span>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded transition-colors ${processingState.activeAgent === AgentRole.MEDICAL_RECORDS ? 'bg-rose-600/20 text-rose-200' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <span className="text-sm">Rekam Medis</span>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded transition-colors ${processingState.activeAgent === AgentRole.BILLING ? 'bg-amber-600/20 text-amber-200' : ''}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-sm">Keuangan & Asuransi</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
             <button onClick={handleReset} className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors border border-slate-700 hover:border-slate-600">
                Reset Sesi
             </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header (Mobile only) */}
        <header className="md:hidden bg-slate-900 text-white p-4 shadow-md flex justify-between items-center z-10">
           <span className="font-bold">RS INDUK AI</span>
           <button onClick={handleReset} className="text-xs bg-slate-800 px-3 py-1 rounded">Reset</button>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-slate-50">
          <div className="max-w-4xl mx-auto w-full pb-4">
             {messages.map((msg) => (
               <ChatMessageComponent key={msg.id} message={msg} />
             ))}
             
             {processingState.isThinking && (
               <div className="flex justify-start w-full animate-pulse">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center gap-3">
                     <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                     <span className="text-sm text-slate-500">
                        {processingState.activeAgent === AgentRole.ORCHESTRATOR 
                            ? "Orkestrator sedang menganalisis..." 
                            : `Menghubungi ${processingState.activeAgent}...`}
                     </span>
                  </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 md:p-6 pb-6">
           <div className="max-w-4xl mx-auto w-full relative">
              
              {/* Quick Actions */}
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider ml-1">Aksi Cepat</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => setInput(action.prompt)}
                        disabled={processingState.isThinking}
                        className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                    >
                        {action.label}
                    </button>
                    ))}
                </div>
              </div>

              <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ketik pesan Anda di sini..."
                    disabled={processingState.isThinking}
                    className="w-full pl-6 pr-14 py-4 rounded-full bg-slate-100 border-2 border-slate-100 focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-sm text-slate-700 placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || processingState.isThinking}
                    className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                >
                    <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
              </div>
           </div>
           <p className="text-center text-xs text-slate-400 mt-3">
              Agen AI Rumah Sakit • Menjaga Privasi & Keamanan Data
           </p>
        </div>
      </main>
    </div>
  );
};

export default App;