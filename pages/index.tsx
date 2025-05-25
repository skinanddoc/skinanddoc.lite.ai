import { Chat } from "@/components/Chat/Chat";
import { Footer } from "@/components/Layout/Footer";
import { Navbar } from "@/components/Layout/Navbar";
import { Message } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: updatedMessages
      })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const data = response.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let isFirst = true;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (isFirst) {
        isFirst = false;
        setMessages((messages) => [
          ...messages,
          {
            role: "assistant",
            content: chunkValue
          }
        ]);
      } else {
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            content: lastMessage.content + chunkValue
          };
          return [...messages.slice(0, -1), updatedMessage];
        });
      }
    }
  };

  const handleReset = () => {
setMessages([
  {
    role: "assistant",
    content: `Assalam o Alaikum! I’m Skin & Doc AI — Doctor-supervised assistant for skin and hair care.

To start, please answer a few quick questions:

1. What’s your age and gender?
2. What is your skin/hair type? (e.g., oily, dry, sensitive, normal)
3. What’s your main concern? (e.g., acne, melasma, pigmentation, hair fall, aging, glow, dandruff)
4. Do you wear makeup or go out in the sun often?
5. Any medical problems, medications or allergies?

Based on your answers, I’ll create a tailored daily routine (AM + PM), recommend ingredients, and share do’s and don’ts.

🧴 Want a doctor-reviewed plan with personalized formula cream?  
👉 [Book now](https://skinanddoc.com/pages/consult-now)

Let’s begin!`
  }
]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
   setMessages([
  {
    role: "assistant",
    content: `Assalam o Alaikum! I’m Skin & Doc AI — Doctor-supervised assistant for skin and hair care.

To start, please answer a few quick questions:

1. What’s your age and gender?
2. What is your skin/hair type? (e.g., oily, dry, sensitive, normal)
3. What’s your main concern? (e.g., acne, melasma, pigmentation, hair fall, aging, glow, dandruff)
4. Do you wear makeup or go out in the sun often?
5. Any medical problems, medications or allergies?

Based on your answers, I’ll create a tailored daily routine (AM + PM), recommend ingredients, and share do’s and don’ts.

🧴 Want a doctor-reviewed plan with personalized formula cream?  
👉 [Book now](https://skinanddoc.com/pages/consult-now)

Let’s begin!`
  }
]);
  }, []);

  return (
    <>
      <Head>
        <title>Chatbot UI</title>
        <meta
          name="description"
          content="A simple chatbot starter kit for OpenAI's chat model using Next.js, TypeScript, and Tailwind CSS."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />

        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="max-w-[800px] mx-auto mt-4 sm:mt-12">
            <Chat
              messages={messages}
              loading={loading}
              onSend={handleSend}
              onReset={handleReset}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
