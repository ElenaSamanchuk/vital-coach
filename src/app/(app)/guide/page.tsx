import { redirect } from "next/navigation";
import { GENERIC_MODE } from "@/lib/app-config";
import { GuidePageContent } from "./GuidePageContent";

export default function GuidePage() {
  if (GENERIC_MODE) redirect("/path");
  return <GuidePageContent />;
}
