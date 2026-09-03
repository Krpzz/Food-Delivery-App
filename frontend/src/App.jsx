import { Routes, Route } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantProfile from './pages/restaurant/profile';
import RestaurantMenu from './pages/restaurant/menu';
import AddMenuItem from './pages/restaurant/addMenuItem';
import EditMenuItem from './pages/restaurant/editMenuItem';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        {/* Restaurants, RestaurantDetails, Cart, Checkout, Orders, OrderDetails,
            Favorites, Profile, Addresses are added in Steps 5-10. */}
      </Route>

      <Route
        path="/restaurant"
        element={
          <ProtectedRoute allowedRoles={['RESTAURANT']}>
            <RestaurantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<RestaurantDashboard />} />
        <Route path="profile" element={<RestaurantProfile />} />
        <Route path="menu" element={<RestaurantMenu />} />
        <Route path="menu/add" element={<AddMenuItem />} />
        <Route path="menu/:id/edit" element={<EditMenuItem />} />
        {/* Orders is added in Step 8. */}
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        {/* Users, Restaurants, Orders, Categories, Coupons are added in Step 11. */}
      </Route>
    </Routes>
  );
}

export default App;