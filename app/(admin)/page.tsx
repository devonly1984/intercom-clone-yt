import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  return (
    <main className="p-10 bg-white m-10 rounded-md w-full">
      <h1 className="text-4xl font-light">
        Welcome to{" "}
        <span className="font-semibold text-[#64b5f5]">Assistly</span>
      </h1>
      <h2 className="mt-2 mb-10">
        Your customizable AI chat agent that helps you manage your customer
        conversations
      </h2>
      <Link href="/create-chatbot">
        <Button className="bg-[#64b5f5]">
          Lets get started by creating your first chatbot
        </Button>
      </Link>
    </main>
  );
};
export default Home;
