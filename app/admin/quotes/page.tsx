"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import * as XLSX from "xlsx";

import { createClient } from "@/utils/supabase/client";

type QuoteItem = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type QuoteFormState = {
  id: string | null;
  text: string;
  author: string;
  source: string;
  is_active: boolean;
};

type QuoteImportRow = {
  text: string;
  author: string;
  source: string | null;
  is_active: boolean;
};

type StatusFilter = "all" | "active" | "inactive";

const defaultFormState: QuoteFormState = {
  id: null,
  text: "",
  author: "",
  source: "",
  is_active: true,
};

function normalizeIdentityValue(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function buildQuoteIdentityKey(text: string, author: string, source: string | null) {
  return [
    normalizeIdentityValue(text),
    normalizeIdentityValue(author),
    normalizeIdentityValue(source),
  ].join("::");
}

function isDuplicateQuoteError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  if (error.code === "23505") {
    return true;
  }

  return (
    error.message?.includes("idx_quotes_unique_normalized") === true ||
    error.message?.toLowerCase().includes("duplicate") === true
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function parseBooleanCell(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }

    if (value === 0) {
      return false;
    }
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();

    if (["true", "yes", "y", "1", "active"].includes(normalizedValue)) {
      return true;
    }

    if (["false", "no", "n", "0", "inactive"].includes(normalizedValue)) {
      return false;
    }
  }

  return null;
}

function parseImportRows(rows: Record<string, unknown>[]) {
  const parsedRows: QuoteImportRow[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const text = typeof row.text === "string" ? row.text.trim() : "";
    const author = typeof row.author === "string" ? row.author.trim() : "";
    const sourceValue = typeof row.source === "string" ? row.source.trim() : "";

    if (!text) {
      errors.push(`Dòng ${rowNumber}: thiếu nội dung trích dẫn.`);
      return;
    }

    if (text.length < 8) {
      errors.push(`Dòng ${rowNumber}: nội dung cần ít nhất 8 ký tự.`);
      return;
    }

    if (!author) {
      errors.push(`Dòng ${rowNumber}: thiếu tác giả.`);
      return;
    }

    const isActive = parseBooleanCell(row.is_active);

    if (isActive === null) {
      errors.push(`Dòng ${rowNumber}: is_active không hợp lệ.`);
      return;
    }

    parsedRows.push({
      text,
      author,
      source: sourceValue || null,
      is_active: isActive,
    });
  });

  return { parsedRows, errors };
}

export default function AdminQuotesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<QuoteFormState>(defaultFormState);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const isEditing = Boolean(formState.id);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("id, text, author, source, is_active, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setMessage({ type: "error", text: `Không thể tải trích dẫn: ${error.message}` });
      setQuotes([]);
    } else {
      setQuotes((data as QuoteItem[]) || []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void fetchQuotes();
  }, [fetchQuotes]);

  const stats = useMemo(() => {
    const activeCount = quotes.filter((quote) => quote.is_active).length;

    return {
      total: quotes.length,
      active: activeCount,
      inactive: quotes.length - activeCount,
    };
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? quote.is_active
            : !quote.is_active;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [quote.text, quote.author, quote.source ?? ""].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [quotes, searchQuery, statusFilter]);

  const quoteIdentitySet = useMemo(() => {
    return new Set(
      quotes.map((quote) => buildQuoteIdentityKey(quote.text, quote.author, quote.source)),
    );
  }, [quotes]);

  const resetForm = () => {
    setFormState(defaultFormState);
  };

  const handleInputChange = <K extends keyof QuoteFormState>(field: K, value: QuoteFormState[K]) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const handleEdit = (quote: QuoteItem) => {
    setFormState({
      id: quote.id,
      text: quote.text,
      author: quote.author,
      source: quote.source ?? "",
      is_active: quote.is_active,
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = formState.text.trim();
    const author = formState.author.trim();
    const source = formState.source.trim();

    if (text.length < 8) {
      setMessage({ type: "error", text: "Trích dẫn cần ít nhất 8 ký tự." });
      return;
    }

    if (!author) {
      setMessage({ type: "error", text: "Vui lòng nhập tên tác giả." });
      return;
    }

    const identityKey = buildQuoteIdentityKey(text, author, source || null);
    const duplicateInState = quotes.some((quote) => {
      if (formState.id && quote.id === formState.id) {
        return false;
      }

      return buildQuoteIdentityKey(quote.text, quote.author, quote.source) === identityKey;
    });

    if (duplicateInState) {
      setMessage({ type: "error", text: "Trích dẫn này đã tồn tại trong hệ thống." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const payload = {
      text,
      author,
      source: source || null,
      is_active: formState.is_active,
    };

    const query = formState.id
      ? supabase
          .from("quotes")
          .update(payload)
          .eq("id", formState.id)
          .select("id, text, author, source, is_active, created_at, updated_at")
          .single()
      : supabase
          .from("quotes")
          .insert(payload)
          .select("id, text, author, source, is_active, created_at, updated_at")
          .single();

    const { data, error } = await query;

    if (error) {
      if (isDuplicateQuoteError(error)) {
        setMessage({ type: "error", text: "Trích dẫn này đã tồn tại trong hệ thống." });
        setSubmitting(false);
        return;
      }

      setMessage({ type: "error", text: `Không thể lưu trích dẫn: ${error.message}` });
      setSubmitting(false);
      return;
    }

    const nextQuote = data as QuoteItem;

    setQuotes((previous) => {
      if (formState.id) {
        return previous
          .map((quote) => (quote.id === nextQuote.id ? nextQuote : quote))
          .sort((left, right) => +new Date(right.updated_at) - +new Date(left.updated_at));
      }

      return [nextQuote, ...previous].sort(
        (left, right) => +new Date(right.updated_at) - +new Date(left.updated_at),
      );
    });

    setMessage({
      type: "success",
      text: formState.id ? "Đã cập nhật trích dẫn." : "Đã thêm trích dẫn mới.",
    });
    resetForm();
    setSubmitting(false);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setMessage({ type: "error", text: "File Excel không có sheet dữ liệu." });
        return;
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) {
        setMessage({ type: "error", text: "File Excel chưa có dữ liệu để import." });
        return;
      }

      const { parsedRows, errors } = parseImportRows(rows);

      if (errors.length > 0) {
        setMessage({
          type: "error",
          text: `Import thất bại. ${errors.slice(0, 3).join(" ")}${errors.length > 3 ? " ..." : ""}`,
        });
        return;
      }

      const seenKeys = new Set<string>();
      const duplicateRows: string[] = [];
      const existingRows: string[] = [];

      parsedRows.forEach((row, index) => {
        const rowNumber = index + 2;
        const identityKey = buildQuoteIdentityKey(row.text, row.author, row.source);

        if (seenKeys.has(identityKey)) {
          duplicateRows.push(`Dòng ${rowNumber}`);
          return;
        }

        seenKeys.add(identityKey);

        if (quoteIdentitySet.has(identityKey)) {
          existingRows.push(`Dòng ${rowNumber}`);
        }
      });

      if (duplicateRows.length > 0) {
        setMessage({
          type: "error",
          text: `Import thất bại. Trùng lặp trong file tại ${duplicateRows.slice(0, 5).join(", ")}${duplicateRows.length > 5 ? ", ..." : ""}.`,
        });
        return;
      }

      if (existingRows.length > 0) {
        setMessage({
          type: "error",
          text: `Import thất bại. Trích dẫn đã tồn tại trong hệ thống tại ${existingRows.slice(0, 5).join(", ")}${existingRows.length > 5 ? ", ..." : ""}.`,
        });
        return;
      }

      const { error } = await supabase.from("quotes").insert(parsedRows);

      if (error) {
        if (isDuplicateQuoteError(error)) {
          setMessage({ type: "error", text: "Import thất bại. Có trích dẫn trùng lặp với dữ liệu hiện tại." });
          return;
        }

        setMessage({ type: "error", text: `Không thể import trích dẫn: ${error.message}` });
        return;
      }

      await fetchQuotes();
      resetForm();
      setMessage({
        type: "success",
        text: `Đã import ${parsedRows.length} trích dẫn từ file Excel.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? `Không thể đọc file Excel: ${error.message}` : "Không thể đọc file Excel.",
      });
    } finally {
      event.target.value = "";
      setImporting(false);
    }
  };

  const handleToggleActive = async (quote: QuoteItem) => {
    setMessage(null);

    const { data, error } = await supabase
      .from("quotes")
      .update({ is_active: !quote.is_active })
      .eq("id", quote.id)
      .select("id, text, author, source, is_active, created_at, updated_at")
      .single();

    if (error) {
      setMessage({ type: "error", text: `Không thể cập nhật trạng thái: ${error.message}` });
      return;
    }

    const nextQuote = data as QuoteItem;
    setQuotes((previous) =>
      previous.map((item) => (item.id === nextQuote.id ? nextQuote : item)),
    );
  };

  const handleDelete = async (quote: QuoteItem) => {
    if (!confirm(`Xóa trích dẫn của ${quote.author}?`)) {
      return;
    }

    setRemovingId(quote.id);
    setMessage(null);

    const { error } = await supabase.from("quotes").delete().eq("id", quote.id);

    if (error) {
      setMessage({ type: "error", text: `Không thể xóa trích dẫn: ${error.message}` });
      setRemovingId(null);
      return;
    }

    setQuotes((previous) => previous.filter((item) => item.id !== quote.id));
    if (formState.id === quote.id) {
      resetForm();
    }
    setRemovingId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="p-2 hover:bg-slate-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Quản lý trích dẫn</h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Hệ thống footer quotes cho admin
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="bg-white rounded-[1.75rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Tổng số</p>
          <p className="mt-3 text-4xl font-black">{stats.total}</p>
        </div>
        <div className="bg-white rounded-[1.75rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đang hiển thị</p>
          <p className="mt-3 text-4xl font-black">{stats.active}</p>
        </div>
        <div className="bg-white rounded-[1.75rem] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Đang ẩn</p>
          <p className="mt-3 text-4xl font-black">{stats.inactive}</p>
        </div>
      </div>

      <section className="mb-10 bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {isEditing ? "Chỉnh sửa" : "Thêm mới"}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight italic">
                {isEditing ? "Cập nhật trích dẫn" : "Tạo trích dẫn"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest pl-1">Nội dung</label>
                <textarea
                  value={formState.text}
                  onChange={(event) => handleInputChange("text", event.target.value)}
                  rows={6}
                  placeholder="Nhập trích dẫn muốn hiển thị ở footer..."
                  className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium resize-none"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest pl-1">Tác giả</label>
                  <input
                    type="text"
                    value={formState.author}
                    onChange={(event) => handleInputChange("author", event.target.value)}
                    placeholder="Ví dụ: Vô danh"
                    className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest pl-1">Nguồn</label>
                  <input
                    type="text"
                    value={formState.source}
                    onChange={(event) => handleInputChange("source", event.target.value)}
                    placeholder="Tùy chọn: sách, bài viết, bài phát biểu..."
                    className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border-4 border-black px-4 py-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(event) => handleInputChange("is_active", event.target.checked)}
                  className="h-5 w-5 accent-black"
                />
                <span className="text-sm font-bold uppercase tracking-[0.12em]">Hiển thị trong footer</span>
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-40 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  {submitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm trích dẫn"}
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-4 bg-white text-black rounded-[1.5rem] border-4 border-black font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.98] text-sm"
                  >
                    Hủy chỉnh sửa
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-[1.75rem] border-4 border-dashed border-slate-300 bg-slate-50/70 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Import Excel</p>
            <h3 className="mt-2 text-xl font-black uppercase tracking-tight italic">Thêm nhiều trích dẫn</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Dùng file Excel với các cột: text, author, source, is_active. Nếu is_active để trống hệ thống sẽ tự bật hiển thị.
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center justify-center rounded-[1.5rem] border-4 border-black bg-white px-4 py-4 text-center text-sm font-black uppercase tracking-[0.12em] hover:bg-slate-50">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportFile}
                  disabled={importing}
                  className="sr-only"
                />
                {importing ? "Đang import..." : "Chọn file Excel"}
              </label>

              <Link
                href="/samples/quotes-import-sample.xlsx"
                target="_blank"
                className="block rounded-[1.25rem] border-2 border-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] hover:bg-black hover:text-white transition-colors"
              >
                Tải file mẫu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-10">
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6">Danh sách hiện tại</h2>

          {message ? (
            <div className={`mb-6 rounded-[1.25rem] border-4 p-4 font-bold ${message.type === "error" ? "border-red-500 bg-red-50 text-red-700" : "border-emerald-500 bg-emerald-50 text-emerald-700"}`}>
              {message.text}
            </div>
          ) : null}

          <div className="mb-6 grid gap-4 rounded-[1.5rem] border-4 border-black bg-white p-5 md:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="space-y-2">
              <label htmlFor="quote-search" className="text-xs font-black uppercase tracking-widest pl-1">
                Tìm kiếm
              </label>
              <input
                id="quote-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tìm theo nội dung, tác giả hoặc nguồn"
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quote-status-filter" className="text-xs font-black uppercase tracking-widest pl-1">
                Trạng thái
              </label>
              <select
                id="quote-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="w-full px-5 py-4 rounded-2xl border-4 border-black focus:outline-none focus:bg-slate-50 text-base font-medium bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hiển thị</option>
                <option value="inactive">Đang ẩn</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="w-full py-12 flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[2rem]">
              <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 font-bold text-slate-400 italic">Đang tải trích dẫn...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="w-full py-12 text-center border-4 border-dashed border-slate-200 rounded-[2rem]">
              <p className="font-bold text-slate-400 italic">
                {quotes.length === 0
                  ? "Chưa có trích dẫn nào trong hệ thống."
                  : "Không có trích dẫn nào khớp với bộ lọc hiện tại."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              <AnimatePresence mode="popLayout">
                {filteredQuotes.map((quote) => (
                  <m.article
                    key={quote.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="bg-white rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.14em] ${quote.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {quote.is_active ? "Đang hiển thị" : "Đang ẩn"}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Cập nhật {formatDateTime(quote.updated_at)}
                          </span>
                        </div>

                        <blockquote className="max-w-2xl text-lg font-medium italic leading-relaxed text-slate-900">
                          “{quote.text}”
                        </blockquote>

                        <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                          {quote.author}
                        </p>

                        {quote.source ? (
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                            Nguồn: {quote.source}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-3 lg:max-w-[12rem] lg:justify-end">
                        <button
                          type="button"
                          onClick={() => handleEdit(quote)}
                          className="px-4 py-2 rounded-xl border-2 border-black font-black uppercase tracking-[0.12em] text-xs hover:bg-black hover:text-white transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(quote)}
                          className="px-4 py-2 rounded-xl border-2 border-black font-black uppercase tracking-[0.12em] text-xs hover:bg-black hover:text-white transition-colors"
                        >
                          {quote.is_active ? "Ẩn khỏi footer" : "Hiển thị ở footer"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(quote)}
                          disabled={removingId === quote.id}
                          className="px-4 py-2 rounded-xl border-2 border-red-500 text-red-600 font-black uppercase tracking-[0.12em] text-xs hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
                        >
                          {removingId === quote.id ? "Đang xóa" : "Xóa"}
                        </button>
                      </div>
                    </div>
                  </m.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}