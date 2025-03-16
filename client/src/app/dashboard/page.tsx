import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/");
  }
  
  return (
    <>
      <h1>Dashboard</h1>
      <p>Welcome to the Dashboard!</p>
    </>
  );
}

export default Dashboard;