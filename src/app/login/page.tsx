import { redirect } from "next/navigation";
import { STANDALONE_MODE } from "@/lib/app-config";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  if (STANDALONE_MODE) redirect("/");
  return <LoginForm />;
}
