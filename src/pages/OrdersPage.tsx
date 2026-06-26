import { navigate } from "../lib/router";

export function OrdersPage() {
  return (
    <juo-page name="CustomOrdersPage">
      <div className="custom-page-layout">
        <div className="custom-sidebar-col">
          <juo-extension-root name="nav" />
        </div>
        <div
          className="custom-content-col"
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "32px 20px 96px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              paddingBottom: "8px",
            }}
          >
            <button
              onClick={() => navigate("subscription")}
              aria-label="Go back to subscription page"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--accent-100)",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "var(--primary)",
                flexShrink: 0,
              }}
            >
              ←
            </button>
            <h1
              style={{
                margin: "0",
                fontSize: "var(--text-lg)",
                fontWeight: "700",
                color: "var(--accent-900)",
              }}
            >
              Orders
            </h1>
          </div>
          <juo-extension-root name="history" style={{ width: "100%" }} />
        </div>
      </div>
    </juo-page>
  );
}
