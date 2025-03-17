import { auth0 } from "@/lib/auth0";
import Link from "next/link";

const Home = async () => {
  const session = await auth0.getSession();

  return (
    <div>
      <h1>Welcome to Code Collab</h1>
      <p>Collaborate and code in real-time with your team.</p>

      {session ? (
        <Link href="/dashboard">
          Go to Dashboard
        </Link>
      ) : (
        <Link href="/auth/login">
          Login
        </Link>
      )}
    </div>
  );
}

export default Home;