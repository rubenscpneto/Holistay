import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
          return NextResponse.redirect(new URL("/portal", origin));
        } else {
          return NextResponse.redirect(new URL("/dashboard", origin));
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/login?error=Não foi possível autenticar. Tente novamente.", origin));
}

