import { auth } from "./auth";
import { prisma } from "./db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireProfile() {
  const user = await requireUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  return { user, profile };
}
