/**
 * Simulação de consulta de CEP (substituir por API real ou Edge Function em produção).
 */
export async function lookupCepSimulated(cepDigits: string): Promise<{
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
}> {
  await new Promise((r) => setTimeout(r, 450));
  if (cepDigits.length !== 8) {
    throw new Error("CEP deve ter 8 dígitos");
  }
  return {
    address_street: "Rua das Palmeiras",
    address_neighborhood: "Jardim Holistay",
    address_city: "São Paulo",
    address_state: "SP",
  };
}
