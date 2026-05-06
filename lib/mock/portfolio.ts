import type { Tables } from "@/types/supabase";

type Property = Tables<"properties">;
type Booking = Tables<"bookings">;
type Task = Tables<"tasks">;
type Expense = Tables<"expenses">;
type FixedCost = Tables<"fixed_costs">;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function isoDateTime(d: Date): string {
  return d.toISOString();
}

function stableId(prefix: string, n: number): string {
  return `${prefix}_${String(n).padStart(4, "0")}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function makePropertyBase(input: {
  id: string;
  managerId: string;
  name: string;
  city: string;
  neighborhood: string;
  commissionRate: number;
  imageUrl?: string | null;
}): Property {
  return {
    id: input.id,
    manager_id: input.managerId,
    name: input.name,
    commission_rate: input.commissionRate,
    image_url: input.imageUrl ?? null,
    owner_id: null,
    status: "active",
    ical_url: null,
    default_check_in_time: "15:00",
    default_check_out_time: "11:00",
    address_country: "Brasil",
    address_state: "SC",
    address_city: input.city,
    address_neighborhood: input.neighborhood,
    address_street: "Av. Atlântica",
    address_number: "100",
    address_complement: null,
    address_zip_code: "00000000",
    created_at: isoDateTime(new Date(Date.now() - 40 * 86400000)),
    updated_at: isoDateTime(new Date()),
  };
}

export function mockManagerId(): string {
  return "mock_manager_0001";
}

export function mockProperties(managerId: string = mockManagerId()): Property[] {
  return [
    makePropertyBase({
      id: "prop_001",
      managerId,
      name: "Cobertura Beira‑Mar",
      city: "Florianópolis",
      neighborhood: "Centro",
      commissionRate: 15,
      imageUrl: null,
    }),
    makePropertyBase({
      id: "prop_002",
      managerId,
      name: "Villa dos Pinheiros",
      city: "Florianópolis",
      neighborhood: "Lagoa da Conceição",
      commissionRate: 12.5,
      imageUrl: null,
    }),
    makePropertyBase({
      id: "prop_003",
      managerId,
      name: "Loft Vista Mar",
      city: "Balneário Camboriú",
      neighborhood: "Barra Sul",
      commissionRate: 18,
      imageUrl: null,
    }),
  ];
}

function makeBooking(input: {
  id: string;
  propertyId: string;
  start: Date;
  end: Date;
  guestName: string;
  totalRevenue: number;
  platformFee: number;
  status?: Booking["status"];
}): Booking {
  return {
    id: input.id,
    property_id: input.propertyId,
    ical_uid: input.id,
    start_date: isoDateTime(input.start),
    end_date: isoDateTime(input.end),
    guest_name: input.guestName,
    total_revenue: input.totalRevenue,
    platform_fee: input.platformFee,
    status: input.status ?? "confirmed",
    created_at: isoDateTime(new Date(Date.now() - 120 * 86400000)),
    updated_at: isoDateTime(new Date()),
  };
}

export function mockBookings(propertyIds: string[]): Booking[] {
  const today = startOfDay(new Date());
  const monthRef = new Date(today.getFullYear(), today.getMonth(), 1);
  const prevRef = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const rows: Booking[] = [];
  let i = 1;

  for (const pid of propertyIds) {
    // Previous month: a few stays
    rows.push(
      makeBooking({
        id: stableId("b_prev", i++),
        propertyId: pid,
        start: addDays(prevRef, 3),
        end: addDays(prevRef, 7),
        guestName: "Ana Ribeiro",
        totalRevenue: 2800,
        platformFee: 210,
      })
    );
    rows.push(
      makeBooking({
        id: stableId("b_prev", i++),
        propertyId: pid,
        start: addDays(prevRef, 14),
        end: addDays(prevRef, 18),
        guestName: "Carlos Souza",
        totalRevenue: 3200,
        platformFee: 260,
      })
    );

    // Current month: a past stay + an upcoming stay + a spanning booking
    rows.push(
      makeBooking({
        id: stableId("b_cur", i++),
        propertyId: pid,
        start: addDays(monthRef, 2),
        end: addDays(monthRef, 5),
        guestName: "Mariana Lima",
        totalRevenue: 2400,
        platformFee: 190,
      })
    );
    rows.push(
      makeBooking({
        id: stableId("b_cur", i++),
        propertyId: pid,
        start: addDays(today, 1),
        end: addDays(today, 4),
        guestName: "João Silva",
        totalRevenue: 3600,
        platformFee: 290,
      })
    );
    rows.push(
      makeBooking({
        id: stableId("b_span", i++),
        propertyId: pid,
        start: addDays(today, -2),
        end: addDays(today, 2),
        guestName: "Maria Costa",
        totalRevenue: 2100,
        platformFee: 160,
      })
    );
  }

  return rows;
}

function makeTask(input: {
  id: string;
  propertyId: string;
  due: Date;
  title: string;
  type: Task["type"];
  status: Task["status"];
}): Task {
  return {
    id: input.id,
    property_id: input.propertyId,
    due_date: isoDateTime(input.due),
    title: input.title,
    type: input.type,
    status: input.status,
    assignee_id: null,
    booking_id: null,
    created_at: isoDateTime(new Date(Date.now() - 20 * 86400000)),
    updated_at: isoDateTime(new Date()),
  };
}

export function mockTasks(propertyIds: string[]): Task[] {
  const today = startOfDay(new Date());
  const rows: Task[] = [];
  let i = 1;

  for (const pid of propertyIds) {
    rows.push(
      makeTask({
        id: stableId("t_clean", i++),
        propertyId: pid,
        due: addDays(today, 0),
        title: "Limpeza pós check-out",
        type: "cleaning",
        status: i % 3 === 0 ? "done" : "inprogress",
      })
    );
    rows.push(
      makeTask({
        id: stableId("t_clean", i++),
        propertyId: pid,
        due: addDays(today, 1),
        title: "Limpeza pré check-in",
        type: "cleaning",
        status: "todo",
      })
    );
    rows.push(
      makeTask({
        id: stableId("t_main", i++),
        propertyId: pid,
        due: addDays(today, 10),
        title: "Revisar ar-condicionado",
        type: "maintenance",
        status: "todo",
      })
    );
  }

  return rows;
}

function makeExpense(input: {
  id: string;
  propertyId: string;
  authorId: string;
  date: Date;
  amount: number;
  category: Expense["category"];
  description: string;
}): Expense {
  return {
    id: input.id,
    property_id: input.propertyId,
    author_id: input.authorId,
    expense_date: isoDate(input.date),
    amount: input.amount,
    category: input.category,
    description: input.description,
    created_at: isoDateTime(new Date(Date.now() - 5 * 86400000)),
    updated_at: isoDateTime(new Date()),
  };
}

export function mockExpenses(propertyIds: string[], authorId: string): Expense[] {
  const today = startOfDay(new Date());
  const rows: Expense[] = [];
  let i = 1;

  for (const pid of propertyIds) {
    rows.push(
      makeExpense({
        id: stableId("e", i++),
        propertyId: pid,
        authorId,
        date: addDays(today, -6),
        amount: 180,
        category: "supplies",
        description: "Reposição de enxoval e amenities",
      })
    );
    rows.push(
      makeExpense({
        id: stableId("e", i++),
        propertyId: pid,
        authorId,
        date: addDays(today, -2),
        amount: 420,
        category: "maintenance",
        description: "Pequenos reparos e manutenção",
      })
    );
  }

  return rows;
}

function makeFixedCost(input: {
  id: string;
  propertyId: string;
  amount: number;
  description: string;
}): FixedCost {
  return {
    id: input.id,
    property_id: input.propertyId,
    amount: input.amount,
    description: input.description,
    created_at: isoDateTime(new Date(Date.now() - 200 * 86400000)),
  };
}

export function mockFixedCosts(propertyIds: string[]): FixedCost[] {
  const rows: FixedCost[] = [];
  let i = 1;
  for (const pid of propertyIds) {
    rows.push(
      makeFixedCost({
        id: stableId("f", i++),
        propertyId: pid,
        amount: 650,
        description: "Condomínio",
      })
    );
    rows.push(
      makeFixedCost({
        id: stableId("f", i++),
        propertyId: pid,
        amount: 190,
        description: "Internet",
      })
    );
  }
  return rows;
}

