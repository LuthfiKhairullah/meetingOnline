'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";

export default function EditRolePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ✅ Fetch data by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/roles/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "web",
            "authorization": `Bearer ${token}`,
          },
        })
        const data = await res.json()
        if(!data.data) {
          alert("Data tidak ditemukan")
          router.push("/admin/role")
          return
        }
        setForm(data.data)
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

      const payload: any = {}
      payload.name = form.name;

      const res = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-client-type": "web",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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
      router.push("/admin/role")
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
      <PageBreadcrumb pageTitle={`Edit Role ${form.name}`} />

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
          {saving ? "Saving..." : "Update"}
        </button>

        <button
          onClick={() => router.push("/roles")}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}