import { Outlet } from "react-router-dom";

export default function DashboardLayout() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div className="flex">

      <aside className="w-64 min-h-screen bg-slate-900 text-white">

        <div className="p-5 border-b">
          <h2 className="font-bold">
            Barangay System
          </h2>
        </div>

        <div className="p-4">
          {user.username}
        </div>

      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}