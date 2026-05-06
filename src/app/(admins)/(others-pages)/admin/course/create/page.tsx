'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";

export default function CreateCoursePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const params = useParams()
  const router = useRouter()

  const initialForm = () => ({
    name: '',
  });

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false)

  // ✅ Handle change (generic)
  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  // ✅ Submit insert
  const handleSubmit = async () => {
    try {
      setSaving(true)

      const payload: any = {}
      if(!form.name) {
        alert("Name tidak boleh kosong")
        return
      }
      payload.name = form.name;

      const res = await fetch(`/api/course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "web",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()
      
      // ✅ cek status response
      if (res.status < 200 || res.status > 300) {
        // gagal
        alert(result.message || "Gagal insert")
        return
      }

      alert(result.message || "Berhasil insert!")
      router.push("/admin/course")
    } catch (err) {
      console.error(err)
      alert("Gagal insert")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Create Course`} />
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-purple-200 p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <Input label="Name"
              defaultValue={form.name || ""}
              onChange={(e: any) => handleChange("name", e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Submit Button */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Create"}
          </button>

          <button
            onClick={() => router.push("/admin/course")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}