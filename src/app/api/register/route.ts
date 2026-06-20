import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email и пароль (мин. 6 символов) обязательны" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Пользователь уже существует" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        profile: {
          create: {
            name: name ?? "",
            onboardingDone: false,
          },
        },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch {
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
