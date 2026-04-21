export function SubscriptionPage() {
  return (
    <juo-page name="BeautySubscriptionPage">
      <div className="beauty-page-layout">
        <div className="beauty-sidebar-col">
          <juo-extension-root name="nav" />
        </div>
        <div
          className="beauty-content-col"
          style={{
            maxWidth: "860px",
            margin: "0 auto 0 0",
            padding: "32px 20px 96px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <juo-extension-root name="welcome" />
          <juo-extension-root name="upcoming" />
          <juo-extension-root name="upsell" />
          <juo-extension-root name="promo" />
        </div>
      </div>
    </juo-page>
  );
}
