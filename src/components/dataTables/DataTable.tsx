'use client'

import { useEffect, useState } from 'react'
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
  canEdit?: boolean
  canDelete?: boolean
  editUrl?: string
}

export default function DataTable<T extends DataType>({
  columns,
  endpoint,
  limit = 5,
  canEdit = false,
  canDelete = false,
  editUrl,
}: Props<T>) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [selectedRow, setSelectedRow] = useState<T | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `${endpoint}?page=${page}&limit=${limit}&search=${debouncedSearch}`
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

  useEffect(() => {
    fetchData()
  }, [page, debouncedSearch])

  // ✅ DELETE
  const handleDelete = async (row: T) => {
    const confirmDelete = confirm('Yakin mau hapus?')
    if (!confirmDelete) return

    await fetch(`${endpoint}/${row.id}`, {
      method: 'DELETE',
    })

    fetchData()
  }

  // ✅ Action column
  const actionColumn: ColumnDef<T> = {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const rowData = row.original

      return (
        <div className="flex gap-2">
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

  const table = useReactTable({
    data,
    columns: [...columns, actionColumn],
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
              <td colSpan={columns.length + 1} className="text-center">
                Loading...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center">
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
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * limit >= total}
        >
          Next
        </button>
      </div>
    </div>
  )
}