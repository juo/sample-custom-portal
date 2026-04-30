interface Props {
  orderId: string;
}

export function OrderDetailsDrawer({ orderId }: Props) {
  return (
    <div className="flex flex-col gap-lg">
      <p className="text-sm" style={{ color: "var(--accent-700)" }}>
        Tutaj możesz podpiąć fetch szczegółów zamówienia po `orderId`.
      </p>

      <div
        className="rounded-card-2 p-lg"
        style={{ background: "var(--accent-50)", border: "1px solid var(--accent-200)" }}
      >
        <div className="text-sm font-semibold">Order ID</div>
        <div>{orderId}</div>
      </div>
    </div>
  );
}
