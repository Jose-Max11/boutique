import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-content">
        <Outlet /> {/* ✅ This will render the AdminDashboard or any other admin page */}
      </div>
    </div>
  );
}
