export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2>User Management</h2>
      <hr />
      {children}
    </div>
  );
}