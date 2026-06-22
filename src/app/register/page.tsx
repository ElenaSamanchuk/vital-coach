import { redirect } from "next/navigation";
import { STANDALONE_MODE } from "@/lib/app-config";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  if (STANDALONE_MODE) redirect("/");
  return <RegisterForm />;
}
