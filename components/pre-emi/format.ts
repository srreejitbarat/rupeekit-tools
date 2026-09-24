export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export function compactMoney(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return (
    sign +
    "₹" +
    (abs >= 10000000
      ? (abs / 10000000).toFixed(1) + "Cr"
      : abs >= 100000
        ? (abs / 100000).toFixed(1) + "L"
        : abs >= 1000
          ? (abs / 1000).toFixed(0) + "k"
          : Math.round(abs))
  );
}
