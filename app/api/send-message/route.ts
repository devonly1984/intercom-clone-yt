import { INSERT_MESSAGE } from "@/graphql/mutations/mutations";
import { GET_CHATBOT_BY_ID, GET_MESSAGES_BY_CHAT_SESSION_ID } from "@/graphql/queries/queries";
import serverClient from "@/lib/server/serverClient";
import { GetChatbotByIdResponse, GetChatbotByIdVariables, MessagesByChatSessionIdResponse, MessagesByChatSessionIdVariables } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})
const POST = async (req:NextRequest)=>{
    const { chat_session_id, chatbot_id, content, name } = await req.json();
    try {
      const { data } = await serverClient.query<
        GetChatbotByIdResponse,
        GetChatbotByIdVariables
      >({
        query: GET_CHATBOT_BY_ID,
        variables: { id: chatbot_id },
      });
      const chatbot = data.chatbots;
      if (!chatbot) {
        return NextResponse.json(
          { error: "Chatbot not found" },
          { status: 404 }
        );
      }
      const { data: messagesData } = await serverClient.query<
        MessagesByChatSessionIdResponse,
        MessagesByChatSessionIdVariables
      >({
        query: GET_MESSAGES_BY_CHAT_SESSION_ID,
        variables: { chat_session_id },
        fetchPolicy: "no-cache",
      });
      const previousMessages = messagesData.chat_sessions.messages;

      const formattedPreviousMessages: ChatCompletionMessageParam[] =
        previousMessages.map((message) => ({
          role: message.sender === "ai" ? "system" : "user",
          name: message.sender === "ai" ? "system" : name,
          content: message.content,
        }));
        const systemPrompt = chatbot.chatbot_characteristics.map(c=>c.content).join(" + ")
        const messages: ChatCompletionMessageParam[] = [
          {
            role: "system",
            name: "system",
            content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not relevant or in the same scope or domain as the points mentioned in the key information section, kindly inform the user theyre only allowed to search for the specified content. Use Emoji's where possible. Here is some key information that you need to be aware of, these are elements you may be asked about ${systemPrompt}`,
          },
          ...formattedPreviousMessages,
          {
            role: "user",
            name: name,
            content: content,
          },
        ];
        const openaiResponse = await openai.chat.completions.create({
          messages: messages,
          model: "gpt-4o",
        });
        const aiResponse =
          openaiResponse?.choices?.[0]?.message?.content?.trim();
          if (!aiResponse) {
            return NextResponse.json(
              {
                error: "Failed to generate an AI response",
              },
              { status: 500 }
            );
          }
          await serverClient.mutate({
            mutation: INSERT_MESSAGE,
            variables: { chat_session_id, content, sender: "user" },
          });
          const aiMessageResult = await serverClient.mutate({
            mutation: INSERT_MESSAGE,
            variables: { chat_session_id, content: aiResponse, sender: "ai" },
          });
          return NextResponse.json({
            id: aiMessageResult.data.insertMessages.id,
            content: aiResponse,
          });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
}