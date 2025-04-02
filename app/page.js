import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";

export default function Home() {
  return (
    <div >
      <h2>Welcome to the page</h2>
      <Button variant={'destructive'}>click here</Button>
      <UserButton/>
    </div>
  );
}
