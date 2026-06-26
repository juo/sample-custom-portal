export function LoginPage() {
  return (
    <juo-page name="CustomLoginPage">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, var(--accent-100) 0%, var(--accent-50) 100%)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", padding: "24px" }}>
          <juo-extension-root name="default" />
        </div>
      </div>
    </juo-page>
  );
}
