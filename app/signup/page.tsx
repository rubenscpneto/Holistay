import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel, AlertCircle, CheckCircle2 } from "lucide-react";
import { SignupForm } from "./signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

type SearchParams = {
  error?: string;
  message?: string;
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Get user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Role-based redirect
    if (profile?.role === "owner") {
      redirect("/portal");
    } else {
      redirect("/dashboard");
    }
  }

  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md relative">
        <ThemeToggle className="absolute top-4 right-4" />
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <Hotel className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">Holistay</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta para começar a gerenciar seus imóveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{decodeURIComponent(error)}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
            </Alert>
          )}
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Link href="/login" className="text-primary hover:underline hover:text-primary/90 transition-all duration-200 font-medium">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

