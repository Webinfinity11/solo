import Link from "next/link";
import { getContentFresh } from "@/lib/content/store";
import { PageTitle } from "@/components/admin/ui";

export const metadata = { title: "პროდუქცია" };

export default async function ProductsPage() {
  const { products, categories } = await getContentFresh();
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.text.ka.name ?? slug;
  const sorted = [...products].sort(
    (a, b) => categories.findIndex((c) => c.slug === a.categorySlug) - categories.findIndex((c) => c.slug === b.categorySlug) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageTitle
        title="პროდუქცია"
        description="პროდუქტის დამატება, ვარიაციები (მგ / მლ), ფოტოები და აღწერები სამივე ენაზე."
        actions={
          <Link href="/admin/products/new" className="adm-btn adm-btn-primary">
            + ახალი პროდუქტი
          </Link>
        }
      />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="w-14" />
              <th>სახელი</th>
              <th>კატეგორია</th>
              <th>ვარიაციები</th>
              <th>სტატუსი</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-mist">
                <td>
                  <div className="size-10 overflow-hidden bg-ice">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="size-full object-contain" />
                    ) : null}
                  </div>
                </td>
                <td>
                  <Link href={`/admin/products/${p.id}`} className="font-bold hover:underline">
                    {p.name}
                  </Link>
                  {p.featured ? <span className="ml-2 text-[11px] font-bold text-eyebrow">★ მთავარზე</span> : null}
                </td>
                <td className="text-muted">{categoryName(p.categorySlug)}</td>
                <td className="text-muted">{p.variants.map((v) => v.label).join(", ") || "—"}</td>
                <td>
                  <span className={p.status === "active" ? "font-bold text-success" : "text-muted"}>{p.status === "active" ? "აქტიური" : "დამალული"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
