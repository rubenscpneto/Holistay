import type { Tables } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";
import { getDataSource } from "@/lib/data/source";
import {
  mockBookings,
  mockExpenses,
  mockFixedCosts,
  mockManagerId,
  mockProperties,
  mockTasks,
} from "@/lib/mock/portfolio";

export type PortfolioData = {
  userId: string | null;
  properties: Tables<"properties">[];
  bookings: Tables<"bookings">[];
  tasks: Tables<"tasks">[];
  expenses: Tables<"expenses">[];
  fixedCosts: Tables<"fixed_costs">[];
};

export async function getPortfolioData(): Promise<PortfolioData> {
  const source = getDataSource();
  if (source === "mock") {
    const userId = mockManagerId();
    const properties = mockProperties(userId);
    const ids = properties.map((p) => p.id);
    return {
      userId,
      properties,
      bookings: mockBookings(ids),
      tasks: mockTasks(ids),
      expenses: mockExpenses(ids, userId),
      fixedCosts: mockFixedCosts(ids),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: null,
      properties: [],
      bookings: [],
      tasks: [],
      expenses: [],
      fixedCosts: [],
    };
  }

  const { data: props } = await supabase
    .from("properties")
    .select("*")
    .eq("manager_id", user.id)
    .order("name");

  const properties = props ?? [];
  const ids = properties.map((p) => p.id);

  if (ids.length === 0) {
    return {
      userId: user.id,
      properties,
      bookings: [],
      tasks: [],
      expenses: [],
      fixedCosts: [],
    };
  }

  const [{ data: bookings }, { data: tasks }, { data: expenses }, { data: fixedCosts }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .in("property_id", ids)
        .eq("status", "confirmed"),
      supabase.from("tasks").select("*").in("property_id", ids),
      supabase.from("expenses").select("*").in("property_id", ids),
      supabase.from("fixed_costs").select("*").in("property_id", ids),
    ]);

  return {
    userId: user.id,
    properties,
    bookings: bookings ?? [],
    tasks: tasks ?? [],
    expenses: expenses ?? [],
    fixedCosts: fixedCosts ?? [],
  };
}

