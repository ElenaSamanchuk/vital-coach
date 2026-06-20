import { STANDALONE_MODE } from "@/lib/app-config";

export const dynamic = "auto";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  if (STANDALONE_MODE) {
    return <>{children}</>;
  }

  const { auth } = await import("@/lib/auth");
  const { redirect } = await import("next/navigation");
  const { prisma } = await import("@/lib/db");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session!.user!.id },
    select: { onboardingDone: true },
  });

  if (profile?.onboardingDone) {
    redirect("/");
  }

  return <>{children}</>;
}
