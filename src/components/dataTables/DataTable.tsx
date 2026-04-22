'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import Link from 'next/link'

type DataType = {
  id: number | string
  [key: string]: any
}

type Props<T extends DataType> = {
  columns: ColumnDef<T, any>[]
  endpoint: string
  limit?: number
  canDetail?: boolean
  canEdit?: boolean
  canDelete?: boolean
  detailUrl?: string
  editUrl?: string
}

export default function DataTable<T extends DataType>({
  columns,
  endpoint,
  limit = 5,
  canDetail = false,
  canEdit = false,
  canDelete = false,
  detailUrl,
  editUrl,
}: Props<T>) {
  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // ✅ ambil token sekali
  useEffect(() => {
    const t = localStorage.getItem('token')
    setToken(t)
  }, [])

  // ✅ debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // ✅ fetch data
  const fetchData = async () => {
    if (!token) return // ⛔ tunggu token

    try {
      setLoading(true)

      const res = await fetch(
        `${endpoint}?page=${page}&limit=${limit}&search=${debouncedSearch}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-client-type': 'web',
            'authorization': `Bearer ${token}`,
          },
        }
      )

      const json = await res.json()

      setData(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ dependency lengkap
  useEffect(() => {
    fetchData()
  }, [page, debouncedSearch, token])

  // ✅ DELETE
  const handleDelete = async (row: T) => {
    if (!confirm('Yakin mau hapus?')) return
    const t = localStorage.getItem('token')

    await fetch(`${endpoint}/${row.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-client-type': 'web',
        'authorization': `Bearer ${t}`,
      },
    })

    fetchData()
  }

  // ✅ Action column (conditional)
  const actionColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const rowData = row.original

      return (
        <div className="flex gap-2">
          {canDetail && detailUrl && (
            <Link
              href={`${detailUrl}/${rowData.id}`}
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              Detail
            </Link>
          )}
          
          {canEdit && editUrl && (
            <Link
              href={`${editUrl}/${rowData.id}`}
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              Edit
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => handleDelete(rowData)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
          )}
        </div>
      )
    },
  }

  // ✅ hanya inject action kalau perlu
  const finalColumns = useMemo(() => {
    if (!canEdit && !canDelete) return columns
    return [...columns, actionColumn]
  }, [columns, canEdit, canDelete])

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Search */}
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <table className="border w-full">
        <thead>
          {table.getHeaderGroups().map((h) => (
            <tr key={h.id}>
              {h.headers.map((header) => (
                <th key={header.id} className="border p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={finalColumns.length} className="text-center">
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={finalColumns.length} className="text-center">
                No data
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border p-2">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
          Prev
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}