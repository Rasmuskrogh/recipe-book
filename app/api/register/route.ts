import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Namn krävs"),
  email: z.string().email("Ogiltig e-post"),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken"),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function uniqueUsername(name: string, email: string): Promise<string> {
  const base =
    slugify(name) ||
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  let username = base;
  let n = 0;
  while (true) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
    username = `${base}-${++n}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: { email: ["Denna e-post är redan registrerad."] } }, { status: 400 });
    }

    const username = await uniqueUsername(name, email);
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ ok: true, username }, { status: 201 });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registreringen misslyckades." }, { status: 500 });
  }
}
