import { requireAdmin } from "@/lib/admin/auth";
import { hasDatabase } from "@/lib/content/store";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[230px_1fr]">
      <AdminNav />
      <div className="min-w-0 px-4 pb-0 pt-6 sm:px-8 sm:pt-8">
        {hasDatabase() ? null : (
          <p className="mb-6 border-l-[3px] border-danger bg-white px-4 py-3 text-[14px]">
            ბაზა ჯერ არ არის დაკავშირებული (DATABASE_URL). ნახვა შეგიძლიათ, მაგრამ შენახვა ვერ მოხერხდება.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
