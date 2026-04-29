import { useState, useEffect } from "react";
import { useContext } from "@juo/blocks/react";
import { CustomerServiceContext } from "@juo/blocks";

interface Props {
  greetingPrefix: string;
  subtitle: string;
  showSubtitle: boolean;
}

export function BeautyWelcome({ greetingPrefix, subtitle, showSubtitle }: Props) {
  const customerService = useContext(CustomerServiceContext);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void customerService.getCurrent().then((result) => {
      if (result._tag === "Success" && result.data) {
        setCustomerName(result.data.name);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div
      className="rounded-card-1 px-xl py-lg"
      style={{
        background: "linear-gradient(135deg, var(--accent-100) 0%, var(--accent-50) 100%)",
        border: "1px solid var(--accent-200)",
      }}
    >
      {loading ? (
        <div className="animate-pulse">
          <div
            className="h-7 rounded-card-3 mb-sm"
            style={{ background: "var(--accent-200)", width: "60%" }}
          />
          <div
            className="h-4 rounded-card-3"
            style={{ background: "var(--accent-200)", width: "40%" }}
          />
        </div>
      ) : (
        <div>
          <h2
            className="text-2xl font-bold mb-xs ivypresto-display"
            style={{ color: "var(--accent-900)" }}
          >
            <juo-text prop="greetingPrefix">{greetingPrefix}</juo-text> {customerName}
          </h2>
          {showSubtitle && (
            <p className="text-sm" style={{ color: "var(--accent-700)" }}>
              <juo-text prop="subtitle">{subtitle}</juo-text>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
