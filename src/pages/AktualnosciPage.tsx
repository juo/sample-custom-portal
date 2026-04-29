export function AktualnosciPage() {
  return (
    <juo-page name="BeautyAktualnosciPage">
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
          <h1
            style={{
              margin: "0",
              fontSize: "var(--text-lg)",
              fontWeight: "700",
              color: "var(--accent-900)",
            }}
          >
            Aktualności
          </h1>
        </div>
      </div>
    </juo-page>
  );
}
