'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";

export default function CreateUserPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    
    const initialForm = () => ({
        username: '',
        fullname: '',
        password: '',
        confirmPassword: '',
        email: '',
        alamat: '',
        noHp: '',
        nik: '',
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

  // ✅ Submit update
  const handleSubmit = async () => {
    try {
      setSaving(true)

      const payload: any = {}
      if(!form.username && !form.fullname) {
        alert("Username dan Fullname tidak boleh kosong")
        return
      }
      payload.username = form.username;
      payload.fullname = form.fullname;
      payload.password = form.password;
      payload.confirmPassword = form.confirmPassword;
      payload.email = form.email
      payload.noHp = form.noHp
      payload.alamat = form.alamat
      payload.nik = form.nik

      const res = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      router.push("/admin/users")
    } catch (err) {
      console.error(err)
      alert("Gagal update")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Create Class`} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Input label="Name"
            defaultValue={form.fullname || ""}
            onChange={(e: any) => handleChange("fullname", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Username"
            defaultValue={form.username || ""}
            onChange={(e: any) => handleChange("username", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Password" type="password"
            defaultValue={form.password || ""}
            onChange={(e: any) => handleChange("password", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Confirm Password" type="password"
            defaultValue={form.confirmPassword || ""}
            onChange={(e: any) => handleChange("confirmPassword", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Address"
            defaultValue={form.alamat || ""}
            onChange={(e: any) => handleChange("alamat", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Phone Number"
            defaultValue={form.noHp || ""}
            onChange={(e: any) => handleChange("noHp", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="Email"
            defaultValue={form.email || ""}
            onChange={(e: any) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-6">
          <Input label="NIK"
            defaultValue={form.nik || ""}
            onChange={(e: any) => handleChange("nik", e.target.value)}
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
          {saving ? "Saving..." : "Insert"}
        </button>

        <button
          onClick={() => router.push("/users")}
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}