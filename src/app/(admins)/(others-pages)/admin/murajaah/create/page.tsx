'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import SearchSelect from "@/components/searchSelect/SearchSelect";

export default function CreateMurajaahPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const [form, setForm] = useState({
    courseTeacherId: "",
    categoryTaskId: "",
    title: "",
    description: "",  
    meetingUrl: "",
    location: "",
    startAt: "",
    endAt: "",
    timezone: "Asia/Jakarta",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!token) {
        alert("Token tidak ditemukan");
        return;
      }

      if (!form.title) {
        alert("Title tidak boleh kosong");
        return;
      }

      if (!form.startAt) {
        alert("Date wajib diisi");
        return;
      }

      const payload = {
        courseTeacherId: Number(form.courseTeacherId),
        categoryTaskId: Number(form.categoryTaskId),
        title: form.title,
        description: form.description,
        meetingUrl: form.meetingUrl,
        location: form.location,
        startAt: new Date(form.startAt),
        endAt: new Date(form.endAt),
        timezone: form.timezone,
      };

      const res = await fetch(`/api/murajaah`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal insert");
        return;
      }

      alert(result.message || "Berhasil insert!");
      router.push("/admin/murajaah");
    } catch (err) {
      console.error(err);
      alert("Gagal insert");
    } finally {
      setSaving(false);
    }
  };

  // hindari hydration mismatch
  if (!mounted) return null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Murajaah" />

      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Input
            label="Title"
            defaultValue={form.title}
            onChange={(e: any) => handleChange("title", e.target.value)}
          />

          <SearchSelect
            label="Course Teacher"
            endpoint="/api/course-teacher/show"
            onChange={(val) => handleChange("courseTeacherId", val)}
            getLabel={(item) =>
              `${item.fullname} - Class: ${item.className} - Course: ${item.courseName}`
            }
          />

          <Input
            label="Date"
            type="date"
            defaultValue={form.startAt}
            onChange={(e: any) =>
              handleChange("startAt", e.target.value)
            }
          />
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Create"}
          </button>

          <button
            onClick={() => router.push("/admin/murajaah")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}