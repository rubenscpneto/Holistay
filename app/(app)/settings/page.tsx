import { createClient } from "@/lib/supabase/server";
import { AddPropertyModal } from "./add-property-modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error fetching properties:", error);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Gestão de Imóveis</h1>
        <AddPropertyModal />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seus Imóveis</CardTitle>
          <CardDescription>
            Gerencie aqui todos os seus imóveis cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {properties && properties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{`${property.street}, ${property.number}`}</TableCell>
                    <TableCell>{property.city}</TableCell>
                    <TableCell>{property.state}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">
              Você ainda não adicionou nenhum imóvel.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

