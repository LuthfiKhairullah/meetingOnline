"use client";

type Field = {
  label: string;
  key: string;
  render?: (value: any, data: any) => React.ReactNode; // 🔥 custom render
};

type Props = {
  data: any;
  fields: Field[];
};

export default function DetailView({ data, fields }: Props) {
  return (
    <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const value = data?.[field.key];

        return (
          <div key={field.key}>
            <label className="text-sm text-gray-500">
              {field.label}
            </label>

            <p className="font-medium">
              {field.render
                ? field.render(value, data) // 🔥 kalau custom
                : value ?? "-"}
            </p>
          </div>
        );
      })}
    </div>
  );
}