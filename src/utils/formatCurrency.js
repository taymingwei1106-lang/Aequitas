export default function formatCurrency(value) {

  const amount = Number(value || 0);

  return amount.toLocaleString("en-MY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

}