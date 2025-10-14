import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartWishlistProvider } from "./pages/CartWishlistContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// User pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OAuthSuccess from "./pages/OAuthSuccess";
import UserDashboard from "./pages/UserDashboard";
import UserDesigners from "./pages/UserDesigners";
import DesignsPage from "./pages/DesignsPage.jsx";
import CardPage from "./pages/CardPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import Category from "./pages/Category";
import Customize from "./pages/Customize"; 
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders.jsx";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout.jsx"; // ✅ layout wrapper with AdminNavbar
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import ProductsPage from "./pages/admin/ProductsPage";
import UsersPage from "./pages/admin/UsersPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import CategoryPage from "./pages/admin/CategoryPage";
import Designers from "./pages/admin/Designers";
import Suppliers from "./pages/admin/Suppliers";

function App() {
  return (
    <CartWishlistProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/designs" element={<DesignsPage />} />
          <Route path="/designers" element={<UserDesigners />} />
          <Route path="/cart" element={<CardPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* Protected User Routes */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            {/* ✅ Admin Layout with navbar & outlet */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<UsersPage />} />
              <Route path="sales" element={<AdminOrdersPage />} />
              <Route path="categories" element={<CategoryPage />} />
              <Route path="designers" element={<Designers />} />
              <Route path="suppliers" element={<Suppliers />} />
            </Route>
          </Route>

        </Routes>
    </CartWishlistProvider>
  );
}

export default App;
