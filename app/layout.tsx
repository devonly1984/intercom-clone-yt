import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";
import ApolloProviderWrapper from "@/components/ApolloProvider";
import { Toaster } from "sonner";




export const metadata: Metadata = {
  title: "Intercom Clone",
  description: "Intercom clone with openai,IBM and Neon Postgresql",
};

const RootLayout =({
  children,
}: Readonly<{
  children: ReactNode;
}>)=>{
  return (
    <ApolloProviderWrapper>
      <ClerkProvider>
        <html lang="en">
          <body className="flex min-h-screen">
            {children}
            <Toaster position="bottom-center" />
          </body>
        </html>
      </ClerkProvider>
    </ApolloProviderWrapper>
  );
}
export default RootLayout;