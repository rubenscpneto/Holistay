"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { z } from "zod";

import { addProperty } from "@/app/(app)/properties/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { lookupCepSimulated } from "@/lib/cep-mock";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  address_zip_code: z.string().min(8, "CEP deve ter 8 dígitos"),
  address_street: z.string().min(1, "Logradouro é obrigatório"),
  address_number: z.string().min(1, "Número é obrigatório"),
  address_complement: z.string().optional(),
  address_neighborhood: z.string().min(1, "Bairro é obrigatório"),
  address_city: z.string().min(1, "Cidade é obrigatória"),
  address_state: z.string().min(1, "Estado é obrigatório"),
  address_country: z.string().optional(),
  commission_rate: z.coerce.number().min(0).max(100),
  default_check_in_time: z.string().min(1, "Informe o horário"),
  default_check_out_time: z.string().min(1, "Informe o horário"),
});

type FormData = z.infer<typeof formSchema>;

export function AddPropertyModal() {
  const [open, setOpen] = React.useState(false);
  const [cepLoading, setCepLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as Resolver<FormData>,
    defaultValues: {
      name: "",
      address_zip_code: "",
      address_street: "",
      address_number: "",
      address_complement: "",
      address_neighborhood: "",
      address_city: "",
      address_state: "",
      address_country: "Brasil",
      commission_rate: 15,
      default_check_in_time: "15:00",
      default_check_out_time: "11:00",
    },
  });

  async function onCepComplete(digits: string) {
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const data = await lookupCepSimulated(digits);
      form.setValue("address_street", data.address_street);
      form.setValue("address_neighborhood", data.address_neighborhood);
      form.setValue("address_city", data.address_city);
      form.setValue("address_state", data.address_state);
      form.clearErrors("address_zip_code");
    } catch {
      form.setError("address_zip_code", { message: "CEP não encontrado." });
    } finally {
      setCepLoading(false);
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    form.setValue("address_zip_code", raw);
    if (raw.length === 8) void onCepComplete(raw);
  };

  async function onSubmit(data: FormData) {
    const result = await addProperty({
      ...data,
      address_country: data.address_country || "Brasil",
    });

    if ("ok" in result && result.ok) {
      form.reset();
      setOpen(false);
      return;
    }
    if (typeof result.error === "string") {
      form.setError("root", { message: result.error });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Adicionar propriedade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar propriedade</DialogTitle>
          <DialogDescription>
            Preencha os dados do imóvel conforme o cadastro no sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 flex flex-1 flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do imóvel</FormLabel>
                  <FormControl>
                    <Input className="glass-input" placeholder="Ex.: Loft Vista Mar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_zip_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP (simulado)</FormLabel>
                  <FormControl>
                    <Input
                      className="glass-input"
                      placeholder="00000000"
                      disabled={cepLoading}
                      {...field}
                      value={field.value}
                      onChange={handleCepChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="address_street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl>
                      <Input className="glass-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input className="glass-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address_complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input className="glass-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="address_neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input className="glass-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input className="glass-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input className="glass-input" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address_country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input className="glass-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commission_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comissão (%)</FormLabel>
                  <FormControl>
                    <Input className="glass-input" type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="default_check_in_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in padrão</FormLabel>
                    <FormControl>
                      <Input className="glass-input" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_check_out_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out padrão</FormLabel>
                    <FormControl>
                      <Input className="glass-input" type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <DialogFooter className="mt-auto gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
