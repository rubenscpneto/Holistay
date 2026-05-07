const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function formatDatePtBR(
  input: Date | string,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function formatDateRangePtBR(
  start: Date | string,
  end: Date | string
): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const sameYear = s.getFullYear() === e.getFullYear();
  const startStr = s.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endStr = e.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

export function formatDueLabelPtBR(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const now = new Date();

  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startTomorrow = new Date(startToday);
  startTomorrow.setDate(startTomorrow.getDate() + 1);
  const startDayAfter = new Date(startTomorrow);
  startDayAfter.setDate(startDayAfter.getDate() + 1);

  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (d >= startToday && d < startTomorrow) return `Hoje, ${time}`;
  if (d >= startTomorrow && d < startDayAfter) return `Amanhã, ${time}`;

  const date = d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${date}, ${time}`;
}

export function monthLabelPtBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export function capitalizeFirstPtBR(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
