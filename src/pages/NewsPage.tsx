import { useAppCopy } from "../app-locale";

export function NewsPage() {
  const { pages } = useAppCopy();

  return (
    <juo-page name="BeautyAktualnosciPage">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_1fr]">
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-r lg:border-[var(--accent-200)] lg:bg-[var(--white)]">
          <juo-extension-root name="nav" />
        </div>
        <div
          className="mx-auto flex max-w-[860px] flex-col gap-4 px-5 pt-8 pb-24 max-[480px]:pb-[calc(106px+env(safe-area-inset-bottom,0px))] lg:pt-8"
        >
          <h1 className="m-0 text-lg font-bold text-[var(--accent-900)]">{pages.aktualnosci.title}</h1>
        </div>
      </div>
    </juo-page>
  );
}
