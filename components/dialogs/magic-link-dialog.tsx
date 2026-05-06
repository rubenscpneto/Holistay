"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Copy, Check } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createTeamMemberMagicLink } from "./actions";

const schema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  contact_info: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function buildPortalLink(accessToken: string): string {
  if (typeof window === "undefined") {
    return `/portal/t/${accessToken}`;
  }
  const origin = window.location.origin;
  return `${origin}/portal/t/${accessToken}`;
}

export function MagicLinkDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: "", contact_info: "" },
  });

  React.useEffect(() => {
    if (!open) {
      setToken(null);
      setCopied(false);
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(values: FormValues) {
    const result = await createTeamMemberMagicLink(values);
    if ("ok" in result && result.ok && result.access_token) {
      setToken(result.access_token);
      return;
    }
    if (typeof result.error === "string") {
      form.setError("root", { message: result.error });
    }
  }

  const link = token ? buildPortalLink(token) : "";

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="glass-panel border-white/15">
            <Link2 className="mr-2 h-4 w-4" />
            Gerar Link Mágico
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-panel border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Link Mágico</DialogTitle>
          <DialogDescription>
            Cadastre um membro da equipe operacional e gere um token de acesso
            para limpeza e tarefas no portal.
          </DialogDescription>
        </DialogHeader>

        {!token ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo"
                        className="glass-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Telefone ou e-mail"
                        className="glass-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  Gerar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Copie o link abaixo e envie ao colaborador. O token é único e
              seguro.
            </p>
            <div className="flex gap-2 rounded-lg border border-white/10 bg-black/30 p-3">
              <code className="flex-1 break-all text-xs text-primary">
                {link}
              </code>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="shrink-0"
                onClick={copyLink}
                aria-label="Copiar link"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                Concluir
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
