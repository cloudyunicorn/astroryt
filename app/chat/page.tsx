'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useChat } from "@/context/ChatContext";
import { Loader2 } from "lucide-react"; // Spinner icon

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { personalData } = useChat();

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError('');

    const prompt = `You're my personal astrologer. My zodiac sign is ${personalData.zodiac} and my planetary positions are: ${personalData.planetarySummary}. Please answer my query: "${input.trim()}". Give the reply in a structured way using emoticons and new lines and concise language`;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const aiText = data?.choices?.[0]?.message?.content || "No answer provided.";
      const aiMessage: Message = { role: 'ai', content: aiText };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">AI Astrologer Chat</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto space-y-4 p-4">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 rounded">
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin w-6 h-6 text-primary" />
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter className="flex items-center gap-2 p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your question..."
          className="flex-grow p-2 border rounded"
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Send'}
        </Button>
      </CardFooter>
    </Card>
  );
}
