"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Equipment, Category } from "@/app/generated/prisma/client";

type EquipmentWithCategory = Equipment & { category: { id: string; name: string } };

type FormState = {
  name: string;
  categoryId: string;
  stock: string;
};

const EMPTY_FORM: FormState = { name: "", categoryId: "", stock: "1" };

export default function EquipmentManager({
  equipment,
  categories,
}: {
  equipment: EquipmentWithCategory[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(item: EquipmentWithCategory) {
    setEditingId(item.id);
    setForm({ name: item.name, categoryId: item.categoryId, stock: String(item.stock) });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.categoryId) {
      setError("이름과 카테고리를 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { name: form.name.trim(), categoryId: form.categoryId, stock: Number(form.stock) || 1 };
      const res = editingId
        ? await fetch(`/api/admin/equipment/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/equipment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "저장 실패");
      }
      setEditingId(null);
      setForm(EMPTY_FORM);
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "MAINTENANCE" ? "AVAILABLE" : "MAINTENANCE";
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 장비를 삭제하시겠습니까?\n관련 예약 데이터가 있으면 삭제되지 않을 수 있습니다.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/equipment/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  const grouped = categories.map((cat) => ({
    category: cat,
    items: equipment.filter((e) => e.categoryId === cat.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Add / Edit form */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-300">
          {editingId ? "장비 수정" : "장비 추가"}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-500">이름</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="장비 이름"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs text-zinc-500">카테고리</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
            >
              <option value="">선택</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs text-zinc-500">재고</label>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || pending}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 transition-colors"
            >
              {saving ? "저장 중..." : editingId ? "수정 완료" : "추가"}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>

      {/* Equipment list grouped by category */}
      {grouped.map(({ category, items }) => (
        <div key={category.id} className="overflow-hidden rounded-2xl border border-zinc-800">
          <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {category.name}
            </span>
            <span className="ml-2 text-xs text-zinc-600">{items.length}개</span>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {items.map((item) => {
                const isEditing = editingId === item.id;
                const isDeleting = deletingId === item.id;
                const isToggling = togglingId === item.id;
                const isBroken = item.status === "MAINTENANCE";
                return (
                  <tr key={item.id} className={`transition-colors ${isEditing ? "bg-zinc-800/60" : isBroken ? "bg-red-950/20" : "hover:bg-zinc-800/40"}`}>
                    <td className="px-4 py-3">
                      <span className={isBroken ? "text-zinc-500 line-through" : "text-white"}>{item.name}</span>
                      {isBroken && (
                        <span className="ml-2 rounded-full bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-400">고장</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">재고 {item.stock}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          disabled={isToggling || pending}
                          className={`rounded-lg border px-2.5 py-1 text-xs transition-colors disabled:opacity-40 ${
                            isBroken
                              ? "border-emerald-800 text-emerald-400 hover:bg-emerald-900/30"
                              : "border-orange-800 text-orange-400 hover:bg-orange-900/30"
                          }`}
                        >
                          {isToggling ? "..." : isBroken ? "복구" : "고장"}
                        </button>
                        <button
                          onClick={() => (isEditing ? cancelEdit() : startEdit(item))}
                          className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                        >
                          {isEditing ? "취소" : "수정"}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isDeleting || pending}
                          className="rounded-lg border border-red-800 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 disabled:opacity-40 transition-colors"
                        >
                          {isDeleting ? "삭제 중..." : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {equipment.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center text-zinc-500">
          등록된 장비가 없습니다.
        </div>
      )}
    </div>
  );
}
