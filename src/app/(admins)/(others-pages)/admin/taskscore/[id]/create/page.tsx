'use client'
'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import SearchDropdown from "@/components/selectSearch/SelectDropdown";

export default function CreateTaskPage() {
  const router = useRouter()

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const initialForm = () => ({
    courseTeacherId: '',
    categoryTaskId: '',
    title: '',
    description: '',
    meetingUrl: '',
    location: '',
    startAt: '',
    endAt: '',
    timezone: 'Asia/Jakarta',
  });

  const [form, setForm] = useState(initialForm());
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (!token) {
        alert("Token tidak ditemukan");
        setSaving(false);
        return;
      }

      // ✅ Validasi basic
      if (!form.title) {
        alert("Title tidak boleh kosong");
        setSaving(false);
        return;
      }

      if (!form.courseTeacherId || !form.categoryTaskId) {
        alert("Course Teacher & Category wajib diisi");
        setSaving(false);
        return;
      }

      if (!form.startAt || !form.endAt) {
        alert("Start & End time wajib diisi");
        setSaving(false);
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

      const res = await fetch(`/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "web",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Gagal insert");
        return;
      }

      alert(result.message || "Berhasil insert!");
      router.push("/admin/task");

    } catch (err) {
      console.error(err);
      alert("Gagal insert");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Task" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        
        <Input
          label="Title"
          defaultValue={form.title}
          onChange={(e: any) => handleChange("title", e.target.value)}
        />

        <SearchDropdown
          label="Course Teacher"
          endpoint="/api/course-teacher/show"
          onChange={(val) => handleChange("courseTeacherId", val)}
          getLabel={(item) => `${item.fullname} - Class: ${item.className} - Course: ${item.courseName}`}
        />

        <SearchDropdown
          label="Category Task"
          endpoint="/api/category-task/show"
          onChange={(val) => handleChange("categoryTaskId", val)}
          getLabel={(item) => `${item.name}`}
        />

        <Input
          label="Meeting URL"
          defaultValue={form.meetingUrl}
          onChange={(e: any) => handleChange("meetingUrl", e.target.value)}
        />

        <Input
          label="Location"
          defaultValue={form.location}
          onChange={(e: any) => handleChange("location", e.target.value)}
        />

        <Input
          label="Start At"
          type="datetime-local"
          defaultValue={form.startAt}
          onChange={(e: any) => handleChange("startAt", e.target.value)}
        />

        <Input
          label="End At"
          type="datetime-local"
          defaultValue={form.endAt}
          onChange={(e: any) => handleChange("endAt", e.target.value)}
        />

        <Input
          label="Timezone"
          defaultValue={form.timezone}
          onChange={(e: any) => handleChange("timezone", e.target.value)}
        />

      </div>

      {/* Description */}
      <div className="mt-4">
        <label className="block mb-1">Description</label>
        <textarea
          className="w-full border rounded p-2"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Saving..." : "Insert"}
        </button>

        <button
          onClick={() => router.push("/admin/task")}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}