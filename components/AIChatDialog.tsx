// app/components/AIChatDialog.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

interface AIChatDialogProps {
  // Personal data to include in the prompt (you can extend this object as needed)
  personalData: {
    zodiac: string;
    planetarySummary: string; // A summary string of planetary positions
  };
}

export default function AIChatDialog({ personalData }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Function to send the user query to the AI
  const sendQuery = async () => {
    if (!input.trim()) return;
    // Add the user's message to the conversation
    const userMessage: Message = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError('');

    // Construct the prompt for the AI using the personal data and user query.
    // You can further adjust this prompt to instruct the AI to beautify the output.
    const prompt = `You're my personal astrologer. My zodiac sign is ${personalData.zodiac} and my planetary positions are: ${personalData.planetarySummary}. Please answer my query: "${input.trim()}"`;

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
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
      // Extract the AI's response (assumes the response has a choices array with a message field)
      const aiResponse = data?.choices?.[0]?.message?.content || "No response received.";
      const aiMessage: Message = { sender: 'ai', text: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New Conversation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto p-4">
        <DialogTitle className="text-lg font-semibold">AI Astrologer Chat</DialogTitle>
        <DialogDescription className="mb-4 text-sm text-muted-foreground">
          Ask your astrological question below. Your personal data will be used to give a tailored response.
        </DialogDescription>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === 'user' ? "text-right" : "text-left"}
            >
              <p className="p-2 rounded">
                {msg.text}
              </p>
            </div>
          ))}
          {loading && <p className="text-sm text-muted-foreground">Loading response…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your question"
            className="flex-grow p-2 border rounded"
          />
          <Button onClick={sendQuery} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="mt-4 w-full">
            Close Chat
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
