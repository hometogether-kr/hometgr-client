export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  const middleEnd = digits.length === 10 ? 6 : 7;
  return `${digits.slice(0, 3)}-${digits.slice(3, middleEnd)}-${digits.slice(middleEnd)}`;
}

export function maskPhone(value: string) {
  return `${value.slice(0, 3)}-****-${value.slice(-4)}`;
}

export function maskEmail(value: string) {
  const separator = value.lastIndexOf("@");
  if (separator < 1) return "***";
  return `${value.slice(0, 1)}***${value.slice(separator)}`;
}
