import serverClient from "@/lib/server/serverClient";
import { gql } from "@apollo/client";

import { NextRequest, NextResponse } from "next/server";
const corsHeader ={
    "Allow-Control-Allow-Origin": "*",
    "Allow-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Allow-Control-Allow-Headers": "Content-Type, Authorization"
}
const POST = async(request:NextRequest)=>{
  const { query, variables } = await request.json();
  try {
    let result;
    if (query.trim().startsWith("mutation")) {
      //handle mutations
      result = await serverClient.mutate({
        mutation: gql`
          ${query}
        `,
        variables,
      });
    } else {
      //handle queries
      result = await serverClient.query({
        query: gql`
          ${query}
        `,
        variables,
      });
    }

    const data = result.data;

    return NextResponse.json(
      {
        data,
      },
      {
        headers: corsHeader,
      }
    );

  } catch (error) {
    console.log(error)
    return NextResponse.json(error, {
      status: 500,
    });
  }
}
export { POST };