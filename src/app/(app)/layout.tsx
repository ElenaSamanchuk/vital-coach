import { STANDALONE_MODE } from "@/lib/app-config";
import { StandaloneAppLayout } from "@/components/StandaloneAppLayout";
import { ShellDockProvider } from "@/components/layout/ShellDockContext";
import { AppShellLayout } from "@/components/layout/AppShellLayout";

export const dynamic = "auto";

function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <ShellDockProvider>
      <AppShellLayout>{children}</AppShellLayout>
    </ShellDockProvider>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (STANDALONE_MODE) {
    return (
      <StandaloneAppLayout>
        <AppChrome>{children}</AppChrome>
      </StandaloneAppLayout>
    );
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

  return <AppChrome>{children}</AppChrome>;
}
