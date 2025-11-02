"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SignupForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // If validation passes, submit the form
    e.currentTarget.submit();
  };

  return (
    <form action="/auth/signup" method="post" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="João Silva"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar Senha</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
          />
        </div>
        <Button type="submit" className="w-full">
          Criar Conta
        </Button>
      </div>
    </form>
  );
}

