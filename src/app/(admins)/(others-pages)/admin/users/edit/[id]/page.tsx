'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import SelectInputs from "@/components/form/form-elements/SelectInputs";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
import InputStates from "@/components/form/form-elements/InputStates";
import InputGroup from "@/components/form/form-elements/InputGroup";
import FileInputExample from "@/components/form/form-elements/FileInputExample";
import CheckboxComponents from "@/components/form/form-elements/CheckboxComponents";
import RadioButtons from "@/components/form/form-elements/RadioButtons";
import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
import DropzoneComponent from "@/components/form/form-elements/DropZone";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Link from "next/link";

export default function EditUserPage() {
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
    if (!token) return; 
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users/${id}`, {
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
  }, [id, token])

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
      payload.username = form.username;
      payload.fullname = form.fullname;

        if (form.email !== originalForm.email) {
            payload.email = form.email
        }

        if (form.noHp !== originalForm.noHp) {
            payload.noHp = form.noHp
        }

        if (form.alamat !== originalForm.alamat) {
            payload.alamat = form.alamat
        }
        if (form.nik !== originalForm.nik) {
            payload.nik = form.nik
        }

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
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

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <PageBreadcrumb pageTitle={`Edit User ${form.fullname}`} />
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-purple-200 p-6">
        <Link
            href={"/admin/user-role/create/" + form.id}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Update User Role
        </Link>

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
            {saving ? "Saving..." : "Update"}
          </button>

          <button
            onClick={() => router.push("/admin/users")}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}