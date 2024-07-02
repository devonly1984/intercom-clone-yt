"use client"
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CREATE_CHATBOT } from "@/graphql/mutations/mutations";
import { useMutation } from "@apollo/client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const CreateChatbot = () => {
  const {user} = useUser();
  const [name, setName] = useState("")
  const [createChatbot, { data, loading, error }] = useMutation(
    CREATE_CHATBOT,
    {
      variables: {
        clerk_user_id: user?.id,
        name,
        created_at: new Date(),
      },
    }
  );

  const router = useRouter();

  const handleSubmit = async (e:FormEvent) =>{
    e.preventDefault();
    try {
        const data = await createChatbot();
        console.log(data);
        
        setName("");
        router.push(`/edit-chatbot/${data.data.insertChatbots.id}`)
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="flex-col flex items-center justify-center md:flex-row md: space-x-10 bg-white p-10 rounded-md m-10">
      <Avatar seed="create-chatbot" />
      <div className="">
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a new chatbot to assist you in your conversations with your
          customers
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2 mt-5"
        >
          <Input
            placeholder="Chatbot Name"
            className="max-w-lg"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button disabled={loading || !name} type="submit">
            {loading ? "Creating Chatbot" : "Create Chatbot"}
          </Button>
        </form>
        <p className="text-gray-300 mt-5">Example: Customer Support Chatbot</p>
      </div>
    </div>
  );
};

export default CreateChatbot;