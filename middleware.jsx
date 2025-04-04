// // middleware.ts
import { NextResponse } from "next/server";
import { stackServerApp } from './stack';

export async function middleware(request) {
  // try {
  //   // const user = await stackServerApp.getUser({ request });
  //   // if (!user) {
  //   //   return NextResponse.redirect(new URL('/handler/sign-up', request.url));
  //   // }
  //   // return NextResponse.next();
  // } catch (error) {
  //   // console.error("Middleware error:", error);
  //   // return NextResponse.redirect(new URL('/handler/sign-up', request.url));
  // }
  const user=await stackServerApp.getUser();
  if(!user){
    return NextResponse.redirect(new URL('/handler/sign-in',request.url))
  }return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};