import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // After signup, the trigger will create the profile
  // We redirect to login with a success message
  return NextResponse.redirect(
    new URL("/login?message=Conta criada com sucesso! Verifique seu email e clique no link de confirmação para ativar sua conta. Após confirmar, você poderá fazer login.", request.url)
  );
}

