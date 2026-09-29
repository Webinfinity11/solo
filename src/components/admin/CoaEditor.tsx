"use client";

import { useState } from "react";
import type { CoaDocument } from "@/lib/types";
import { saveCoa } from "@/app/admin/actions";
import { PageTitle, SaveBar, Select, TextInput, UploadButton, newId, useSave } from "./ui";

export function CoaEditor({ initial, products }: { initial: CoaDocument[]; products: { value: string; label: string }[] }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState("");
  const { save, pending, status, dirty, markDirty } = useSave();

  function change(next: CoaDocument[]) {
    setList(next);
    markDirty();
  }
  const patch = (id: string, p: Partial<CoaDocument>) => change(list.map((d) => (d.id === id ? { ...d, ...p } : d)));
  const productName = (slug: string) => products.find((p) => p.value === slug)?.label ?? slug;

  const q = filter.trim().toLowerCase();
  const visible = list.filter((d) => !q || productName(d.productSlug).toLowerCase().includes(q) || d.lot.toLowerCase().includes(q));

  function add() {
    const productSlug = products.find((p) => q && p.label.toLowerCase().includes(q))?.value ?? products[0]?.value ?? "";
    const doc: CoaDocument = { id: newId("coa"), productSlug, lot: "", testDate: new Date().toISOString().slice(0, 10), purity: "", method: "HPLC + MS" };
    change([doc, ...list]);
  }

  return (
    <>
      <PageTitle
        title="COA სერტიფიკატები"
        description="ლოტების სია „ლაბ. შედეგების“ გვერდზე და პროდუქტის გვერდზე. ატვირთეთ PDF, რომ ღილაკი „ჩამოტვირთვა“ გააქტიურდეს."
        actions={
          <button type="button" className="adm-btn adm-btn-primary" onClick={add}>
            + სერტიფიკატი
          </button>
        }
      />
      <TextInput className="mb-4 max-w-sm" value={filter} onChange={setFilter} placeholder="ძიება: პროდუქტი ან ლოტი…" />
      <div className="adm-card overflow-x-auto p-0">
        <table className="adm-table min-w-[900px]">
          <thead>
            <tr>
              <th>პროდუქტი</th>
              <th>ლოტი</th>
              <th>ტესტის თარიღი</th>
              <th>სისუფთავე</th>
              <th>მეთოდი</th>
              <th>PDF</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((d) => (
              <tr key={d.id}>
                <td className="w-[200px]">
                  <Select value={d.productSlug} onChange={(productSlug) => patch(d.id, { productSlug })} options={products} />
                </td>
                <td>
                  <TextInput value={d.lot} onChange={(lot) => patch(d.id, { lot })} />
                </td>
                <td className="w-[160px]">
                  <TextInput type="date" value={d.testDate} onChange={(testDate) => patch(d.id, { testDate })} />
                </td>
                <td className="w-[110px]">
                  <TextInput value={d.purity} onChange={(purity) => patch(d.id, { purity })} />
                </td>
                <td className="w-[130px]">
                  <TextInput value={d.method} onChange={(method) => patch(d.id, { method })} />
                </td>
                <td className="w-[150px]">
                  {d.fileUrl ? (
                    <span className="flex items-center gap-2">
                      <a href={d.fileUrl} target="_blank" className="text-[13px] font-bold text-success hover:underline">
                        PDF ✓
                      </a>
                      <button type="button" className="text-[12px] text-danger hover:underline" onClick={() => patch(d.id, { fileUrl: undefined })}>
                        მოხსნა
                      </button>
                    </span>
                  ) : (
                    <UploadButton label="PDF ატვირთვა" accept="application/pdf" folder="coa" onUploaded={([fileUrl]) => patch(d.id, { fileUrl })} />
                  )}
                </td>
                <td className="w-12">
                  <button
                    type="button"
                    className="adm-btn adm-btn-danger px-2.5"
                    title="წაშლა"
                    onClick={() => window.confirm(`წავშალო ლოტი ${d.lot || ""}?`) && change(list.filter((x) => x.id !== d.id))}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SaveBar onSave={() => save(() => saveCoa(list))} pending={pending} status={status} dirty={dirty} />
    </>
  );
}
