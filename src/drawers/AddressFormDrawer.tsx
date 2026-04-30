interface Props {
  addressId?: string;
}

export function AddressFormDrawer({ addressId }: Props) {
  return (
    <div className="flex flex-col gap-lg">
      <p className="text-sm" style={{ color: "var(--accent-700)" }}>
        Ten komponent może renderować formularz create/edit zależnie od `addressId`.
      </p>

      <input
        placeholder="Imię i nazwisko"
        className="w-full rounded-card-2 px-md py-sm border"
        style={{ borderColor: "var(--accent-200)" }}
      />
      <input
        placeholder="Ulica i numer"
        className="w-full rounded-card-2 px-md py-sm border"
        style={{ borderColor: "var(--accent-200)" }}
      />

      {addressId ? <div className="text-xs">Edycja adresu: {addressId}</div> : null}
    </div>
  );
}
