import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has owner role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-3xl font-bold mb-6">Portal do Proprietário</h1>
      <p className="text-muted-foreground">
        Owner portal will be implemented in Phase 4.
      </p>
    </div>
  );
}

