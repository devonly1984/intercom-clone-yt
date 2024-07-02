import client from '@/graphql/apolloClient';
import {INSERT_CHAT_SESSION, INSERT_GUEST, INSERT_MESSAGE} from '@/graphql/mutations/mutations';
import {gql} from '@apollo/client'
const startNewChat=async(guestName:string,guestEmail:string,chatbotId:number)=>{
    try {
      const guestResult = await client.mutate({
        mutation: INSERT_GUEST,
        variables: { name: guestName, email: guestEmail },
      });

      const guestId = guestResult.data.insertGuests.id;
      //New Chat Session
      const chatSessionResult = await client.mutate({
        mutation: INSERT_CHAT_SESSION,
        variables: { chatbotId: chatbotId, guestId: guestId },
      });
      const chatSessionId = chatSessionResult.data.insertChat_sessions.id;
      // insert initial message(opt)
      await client.mutate({
        mutation: INSERT_MESSAGE,
        variables: {
          chat_session_id: chatSessionId,
          sender: "ai",
          content: `Welcome ${guestName}!\n How can I assist you today?`,
        },
      });
      console.log("New chat session started successfully")
      return chatSessionId;
   
    } catch (error) {
      console.log(error);
    }
}
export default startNewChat;