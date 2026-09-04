import { Routes, Route } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetails from './pages/customer/RestaurantDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/checkout';
import Addresses from './pages/customer/addresses';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantProfile from './pages/restaurant/Profile';
import RestaurantMenu from './pages/restaurant/Menu';
import AddMenuItem from './pages/restaurant/AddMenuItem';
import EditMenuItem from './pages/restaurant/EditMenuItem';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
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
      </Route>
    </Routes>
  );
}

export default App;