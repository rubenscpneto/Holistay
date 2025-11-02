import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=Credenciais inválidas. Verifique seu email e senha.", request.url)
    );
  }

  // Get user profile to determine role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Role-based redirect
    if (profile?.role === "owner") {
      return NextResponse.redirect(new URL("/portal", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

