import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/customer/Home';
import Restaurants from './pages/customer/Restaurants';
import RestaurantDetails from './pages/customer/RestaurantDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Addresses from './pages/customer/Addresses';
import Orders from './pages/customer/Orders';
import OrderDetails from './pages/customer/OrderDetails';
import PaymentSuccess from './pages/customer/PaymentSuccess';
import PaymentFailure from './pages/customer/PaymentFailure';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RestaurantProfile from './pages/restaurant/Profile';
import RestaurantMenu from './pages/restaurant/Menu';
import AddMenuItem from './pages/restaurant/AddMenuItem';
import EditMenuItem from './pages/restaurant/EditMenuItem';
import RestaurantOrders from './pages/restaurant/Orders';
import AdminRestaurants from './pages/admin/Restaurants';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminCategories from './pages/admin/Categories';
import AdminCoupons from './pages/admin/Coupons';

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

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
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/esewa/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/esewa/failure"
          element={
            <ProtectedRoute>
              <PaymentFailure />
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
        <Route path="orders" element={<RestaurantOrders />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Loading label="Loading dashboard" />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons" element={<AdminCoupons />} />
      </Route>
    </Routes>
  );
}

export default App;
