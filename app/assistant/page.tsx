'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ChatInterface from '@/components/assistant/ChatInterface';

export default function AssistantPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <ChatInterface />
      </div>
    </AppLayout>
  );
}
