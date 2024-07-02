import Link from "next/link";
import Avatar from "./Avatar";
import { SignedIn, UserButton, SignInButton, SignedOut } from "@clerk/nextjs";


const Header = () => {
  return (
    <header className="shadow-sm text-gray-800 flex justify-between p-5 bg-white">
      <Link href="/" className="flex items-center text-4xl font-thin">
        <Avatar seed="Support Agent" />
        <div className="space-y-1">
          <h1>Assistly</h1>

          <h2 className="text-sm">Customizable Ai Chat Agent</h2>
        </div>
      </Link>
      <div className="flex items-center">
        <SignedIn>
          <UserButton showName />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
