import { navigate } from "../lib/router";

export function HistoryPage() {
  return (
    <juo-page name="BeautyOrdersPage">
      <div className="beauty-page-layout">
        <div className="beauty-sidebar-col">
          <juo-extension-root name="nav" />
        </div>
        <div
          className="beauty-content-col"
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
              Historia zamówień
            </h1>
          </div>
        </div>
      </div>
    </juo-page>
  );
}
