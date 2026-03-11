const currencyFormatterPEN = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function formatCurrencyPEN(amount: number | string): string {
  const numeric =
    typeof amount === "string" ? Number.parseFloat(amount) : Number(amount);

  const safeAmount = Number.isNaN(numeric) ? 0 : numeric;
  return currencyFormatterPEN.format(safeAmount);
}

export function formatDateShortPE(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTimeLongPE(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

