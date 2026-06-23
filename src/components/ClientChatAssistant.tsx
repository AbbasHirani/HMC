'use client';
import dynamic from 'next/dynamic';

const ChatAssistant = dynamic(() => import('./ChatAssistant'), {
  ssr: false,
});

export default function ClientChatAssistant() {
  return <ChatAssistant />;
}
