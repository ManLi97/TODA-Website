"use client";

// One row of the category manager — used for both editing existing
// categories (id set) and creating a new one (no id). Client component for
// the delete confirm; the forms post straight to server actions.
import { useFormStatus } from "react-dom";
import { deleteCategory, saveCategory } from "./actions";

export interface CategoryFormValues {
  id?: string;
  slug?: string;
  nameDe?: string;
  nameEn?: string;
  nameEs?: string;
  sortOrder?: number;
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-gold-500 focus:outline-none";

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
        isNew
          ? "bg-gold-500 text-on-gold hover:opacity-90"
          : "border-border text-text-secondary hover:text-text-primary border"
      }`}
    >
      {pending ? "…" : isNew ? "Add" : "Save"}
    </button>
  );
}

export function CategoryForm({ values }: { values: CategoryFormValues }) {
  const isNew = !values.id;

  return (
    <div className="flex items-end gap-3">
      <form action={saveCategory} className="grid grow grid-cols-2 gap-3 sm:grid-cols-5">
        {values.id && <input type="hidden" name="id" value={values.id} />}
        <input
          name="nameDe"
          defaultValue={values.nameDe}
          placeholder="Name (de) *"
          required
          className={inputClass}
        />
        <input
          name="nameEn"
          defaultValue={values.nameEn}
          placeholder="Name (en)"
          className={inputClass}
        />
        <input
          name="nameEs"
          defaultValue={values.nameEs}
          placeholder="Name (es)"
          className={inputClass}
        />
        <input
          name="slug"
          defaultValue={values.slug}
          placeholder="slug (auto)"
          className={inputClass}
        />
        <div className="flex gap-3">
          <input
            name="sortOrder"
            type="number"
            defaultValue={values.sortOrder ?? 0}
            className={`${inputClass} w-20`}
          />
          <SaveButton isNew={isNew} />
        </div>
      </form>

      {values.id && (
        <form
          action={deleteCategory}
          onSubmit={(e) => {
            if (
              !window.confirm("Delete this category? Posts keep existing but lose the category.")
            ) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={values.id} />
          <button
            type="submit"
            className="border-label-red/40 text-label-red hover:bg-label-red/10 rounded-lg border px-3 py-2 text-sm"
          >
            Delete
          </button>
        </form>
      )}
    </div>
  );
}
