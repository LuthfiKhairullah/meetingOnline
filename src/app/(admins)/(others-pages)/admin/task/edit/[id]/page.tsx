'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import { Metadata } from "next";
import SearchDropdown from "@/components/selectSearch/SelectDropdown";
import SearchSelect from "@/components/searchSelect/SearchSelect";

export default function EditCoursePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<any>({})
  const [originalForm, setOriginalForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ✅ Fetch data by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/tasks/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        })
        const data = await res.json()
        console.log(data.data)
        setForm(data.data)
        setOriginalForm(data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchData()
  }, [id])

  // ✅ Handle change (generic)
  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  // ✅ Submit update
  const handleSubmit = async () => {
    try {
      setSaving(true)

      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "web",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const result = await res.json()
      console.log(result);

      // ✅ cek status response
      if (res.status < 200 || res.status > 300) {
        // gagal
        alert(result.message || "Gagal update")
        return
      }

      alert(result.message || "Berhasil update!")
      router.push("/admin/task")
    } catch (err) {
      console.error(err)
      alert("Gagal update")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Task" />
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
            value={form.courseTeacherId}
            onChange={(val) => handleChange("courseTeacherId", val)}
            getLabel={(item) =>
              `${item.fullname} - Class: ${item.className} - Course: ${item.courseName}`
            }
          />

          <SearchSelect
            label="Category Task"
            endpoint="/api/category-task/show"
            value={form.categoryTaskId}
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
          <label className="mb-1 block text-xl font-medium text-gray-700">
            Description
          </label>

          <textarea
            className="
              w-full rounded-lg border border-gray-300
              bg-white px-4 py-3 text-sm text-gray-800
              shadow-theme-xs placeholder:text-gray-400
              focus:border-brand-300 focus:outline-hidden
              focus:ring-3 focus:ring-brand-500/10
              dark:border-gray-700 dark:bg-white
              dark:text-gray-900 dark:placeholder:text-gray-400
            "
            rows={4}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Masukkan description"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Update"}
          </button>

          <button
            onClick={() => router.push("/admin/task")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}