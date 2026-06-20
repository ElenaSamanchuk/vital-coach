import { STANDALONE_MODE } from "@/lib/app-config";
import { StandaloneAppLayout } from "@/components/StandaloneAppLayout";

export const dynamic = "auto";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (STANDALONE_MODE) {
    return <StandaloneAppLayout>{children}</StandaloneAppLayout>;
  }

  const { auth } = await import("@/lib/auth");
  const { redirect } = await import("next/navigation");
  const { prisma } = await import("@/lib/db");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session!.user!.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (profile && !profile.onboardingDone) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
