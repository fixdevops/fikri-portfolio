export function nowIso() {
  return new Date().toISOString();
}

export function toIso(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const asDate = new Date(value);
    return Number.isNaN(asDate.getTime()) ? null : asDate.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "object") {
    if (value.__timestamp) {
      const asDate = new Date(value.__timestamp);
      return Number.isNaN(asDate.getTime()) ? null : asDate.toISOString();
    }

    if (typeof value.toDate === "function") {
      const asDate = value.toDate();
      return asDate instanceof Date && !Number.isNaN(asDate.getTime())
        ? asDate.toISOString()
        : null;
    }
  }

  return null;
}
