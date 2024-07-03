"use client"
import Avatar from "@/components/Avatar";
import Messages from "@/components/Messages";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label";
import { GET_CHATBOT_BY_ID, GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/queries/queries";
import { formSchema } from "@/lib/formSchemas/formSchema";
import startNewChat from "@/lib/startNewChat";
import {
  GetChatbotByIdResponse,
  GetChatbotByIdVariables,
  Message,
  MessagesByChatSessionIdResponse,
  MessagesByChatSessionIdVariables,
} from "@/types/types";
import { useQuery } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,

  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
const ChatbotPage = ({ params: { id } }: { params: { id: string } }) => {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [isOpen, setIsOpen] = useState(true);
const [chatId, setChatId] = useState(0);
const [loading, setLoading] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const { data: chatbotData } = useQuery<
  GetChatbotByIdResponse,
  GetChatbotByIdVariables
>(GET_CHATBOT_BY_ID, {
  variables: { id },
});
const {
  loading: loadingQuery,
  error,
  data,
} = useQuery<MessagesByChatSessionIdResponse, MessagesByChatSessionIdVariables>(
  GET_MESSAGES_BY_CHAT_SESSION_ID,
  {
    variables: { chat_session_id: chatId },
    skip: !chatId,
  }
);
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    message: "",
  },
});
useEffect(()=>{
  if (data) {
    setMessages(data.chat_sessions.messages);
  }
},[data])
const handleInformationSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const chatId = await startNewChat(name, email, Number(id));
  setChatId(chatId);
  setLoading(false);
  setIsOpen(false);
};
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setLoading(true);
  const { message: formMessage } = values;
  const message = formMessage;
  form.reset();
  if (!name || !email) {
    setIsOpen(true);
    setLoading(false);
    return;
  }
  if (!message.trim()) {
    return;
  }
  const userMessage: Message = {
    id: Date.now(),
    content: message,
    created_at: new Date().toISOString(),
    chat_session_id: chatId,
    sender: "user",
  };
  const loadingMessage: Message = {
    id: Date.now() + 1,
    content: "Thinking...",
    created_at: new Date().toISOString(),
    chat_session_id: chatId,
    sender: "ai",
  };
  setMessages((prev) => [...prev, userMessage, loadingMessage]);
  try {
    const response = await fetch("/api/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        chat_session_id: chatId,
        chatbot_id: id,
        content: message,
      }),
    });
    const result = await response.json();
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingMessage.id
          ? { ...msg, content: result.content, id: result.id }
          : msg
      )
    );
    
  } catch (error) {
    console.error("Error sending messages:",error)
  }
};
  return (
    <div className="w-full flex bg-gray-100">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="  sm:max-w-[425px]">
          <form className="" onSubmit={handleInformationSubmit}>
            <DialogHeader>
              <DialogTitle>Lets help you out!</DialogTitle>
              <DialogDescription>
                I just need a few details to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" john@appleseed.com"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!name || !email || loading}>
                {!loading ? "Continue" : "Loading..."}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10">
        <div className="pb-4 border-b sticky top-0 z-50 py-5 px-10 text-white md:rounded-t-lg flex items-center space-x-4 bg-[#4d7dfb]">
          <Avatar
            seed={chatbotData?.chatbots.name!}
            className="h-12 w-12 bg-white rounded-full border-2 border-white"
          />
          <div className="">
            <h1 className="truncate text-lg">{chatbotData?.chatbots.name}</h1>
            <p className="text-sm text-gray-300">Typically replies instantly</p>
          </div>
        </div>
        <Messages
          messages={messages}
          chatbotName={chatbotData?.chatbots.name!}
        />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start sticky bottom-0 z-50 space-x-4 drop-shadow-lg p-4 bg-gray-100 rounded-md"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel hidden>Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type a message..."
                      {...field}
                      className="p-8"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={form.formState.isSubmitting || !form.formState.isValid}
              type="submit"
              className="h-full"
            >
              Send
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ChatbotPage;
