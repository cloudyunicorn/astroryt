"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

interface PersonalData {
  zodiac: string;
  planetarySummary: string;
}

interface ChatContextType {
  personalData: PersonalData;
  setPersonalData: (data: PersonalData) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [personalData, setPersonalData] = useState<PersonalData>({
    zodiac: '',
    planetarySummary: '',
  });

  return (
    <ChatContext.Provider value={{ personalData, setPersonalData }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
