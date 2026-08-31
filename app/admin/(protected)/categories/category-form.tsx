"use client";

// One card in the category manager — used for both editing existing
// categories (id set) and creating a new one (no id). Client component for
// the delete confirm; the forms post straight to server actions.
import { useFormStatus } from "react-dom";
import {
  adminControlClass,
  adminDangerButtonClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { deleteCategory, saveCategory } from "./actions";

export interface CategoryFormValues {
  id?: string;
  slug?: string;
  nameDe?: string;
  nameEn?: string;
  nameEs?: string;
  sortOrder?: number;
}

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${isNew ? adminPrimaryButtonClass : adminSecondaryButtonClass} w-full sm:w-auto`}
    >
      {pending ? "Working…" : isNew ? "Add category" : "Save changes"}
    </button>
  );
}

export function CategoryForm({ values }: { values: CategoryFormValues }) {
  const isNew = !values.id;
  const fieldId = values.id ?? "new";

  return (
    <div
      data-admin-category-card
      className="border-border bg-surface-alt min-w-0 rounded-xl border p-4 sm:p-5"
    >
      <form action={saveCategory} className="flex min-w-0 flex-col gap-4">
        {values.id && <input type="hidden" name="id" value={values.id} />}

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`category-name-de-${fieldId}`}>
              Name (de) *
            </label>
            <input
              id={`category-name-de-${fieldId}`}
              name="nameDe"
              defaultValue={values.nameDe}
              required
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`category-name-en-${fieldId}`}>
              Name (en)
            </label>
            <input
              id={`category-name-en-${fieldId}`}
              name="nameEn"
              defaultValue={values.nameEn}
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`category-name-es-${fieldId}`}>
              Name (es)
            </label>
            <input
              id={`category-name-es-${fieldId}`}
              name="nameEs"
              defaultValue={values.nameEs}
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`category-slug-${fieldId}`}>
              Slug (auto)
            </label>
            <input
              id={`category-slug-${fieldId}`}
              name="slug"
              defaultValue={values.slug}
              className={adminControlClass}
            />
          </div>
          <div className="min-w-0">
            <label className={adminLabelClass} htmlFor={`category-order-${fieldId}`}>
              Sort order
            </label>
            <input
              id={`category-order-${fieldId}`}
              name="sortOrder"
              type="number"
              inputMode="numeric"
              defaultValue={values.sortOrder ?? 0}
              className={adminControlClass}
            />
          </div>
        </div>

        <div className="flex justify-stretch sm:justify-end">
          <SaveButton isNew={isNew} />
        </div>
      </form>

      {values.id && (
        <form
          action={deleteCategory}
          onSubmit={(event) => {
            if (
              !window.confirm("Delete this category? Posts keep existing but lose the category.")
            ) {
              event.preventDefault();
            }
          }}
          className="border-border mt-4 flex border-t pt-4 sm:justify-end"
        >
          <input type="hidden" name="id" value={values.id} />
          <button type="submit" className={`${adminDangerButtonClass} w-full sm:w-auto`}>
            Delete category
          </button>
        </form>
      )}
    </div>
  );
}
