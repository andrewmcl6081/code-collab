import CodeEditor from "../components/CodeEditor";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <a href="/auth/login">Login</a>
    );
  }
  
  return (
    <>
      <CodeEditor />
    </>
  );
}
