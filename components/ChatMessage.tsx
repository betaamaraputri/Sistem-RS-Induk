import React from 'react';
import { ChatMessage, SenderType, AgentRole } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const getAgentColor = (role?: AgentRole) => {
  switch (role) {
    case AgentRole.PATIENT_MGMT: return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case AgentRole.SCHEDULING: return "bg-violet-100 text-violet-900 border-violet-200";
    case AgentRole.MEDICAL_RECORDS: return "bg-rose-100 text-rose-900 border-rose-200";
    case AgentRole.BILLING: return "bg-amber-100 text-amber-900 border-amber-200";
    case AgentRole.ORCHESTRATOR: default: return "bg-white text-slate-800 border-slate-200";
  }
};

const getAgentIcon = (role?: AgentRole) => {
    // Simple SVG icons for roles
    switch (role) {
        case AgentRole.PATIENT_MGMT: 
            return <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
        case AgentRole.SCHEDULING:
            return <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case AgentRole.MEDICAL_RECORDS:
            return <svg className="w-5 h-5 mr-2 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
        case AgentRole.BILLING:
            return <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default:
            return <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
    }
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === SenderType.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[80%] rounded-2xl p-4 shadow-sm border ${
          isUser
            ? 'bg-blue-600 text-white border-blue-600 rounded-br-none'
            : `${getAgentColor(message.agentRole)} rounded-bl-none`
        }`}
      >
        {!isUser && (
            <div className="flex items-center mb-2 border-b border-black/10 pb-2">
                {getAgentIcon(message.agentRole)}
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {message.agentRole || AgentRole.ORCHESTRATOR}
                </span>
            </div>
        )}
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
        <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};