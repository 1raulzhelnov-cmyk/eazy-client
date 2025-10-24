import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingSupportButton from "@/components/FloatingSupportButton";
import SupportChat from "@/components/SupportChat";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Restaurants from "./pages/Restaurants";
import Restaurant from "./pages/Restaurant";
import Flowers from "./pages/Flowers";
import Balloons from "./pages/Balloons";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Favorites from "./pages/Favorites";
import Support from "./pages/Support";
import Promotions from "./pages/Promotions";
import DriverApp from "./pages/DriverApp";
// Restaurant Management App
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantRegistration from "./pages/RestaurantRegistration";
import RestaurantProfile from "./pages/RestaurantProfile";
import MenuManagement from "./pages/MenuManagement";
import RestaurantAnalytics from "./pages/RestaurantAnalytics";
import RestaurantReviews from "./pages/RestaurantReviews";
import RestaurantSupport from "./pages/RestaurantSupport";
import RestaurantFinances from "./pages/RestaurantFinances";
import RestaurantPromotions from "./pages/RestaurantPromotions";
import RestaurantPersonnel from "./pages/RestaurantPersonnel";
import AdminDashboard from "./pages/AdminDashboard";
import FinanceManagement from "./pages/admin/FinanceManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import RestaurantsManagement from "./pages/admin/RestaurantsManagement";
import DriversManagement from "./pages/admin/DriversManagement";
import DisputesManagement from "./pages/admin/DisputesManagement";
import CampaignsManagement from "./pages/admin/CampaignsManagement";
import ReportsAnalytics from "./pages/admin/ReportsAnalytics";
import SystemConfiguration from "./pages/admin/SystemConfiguration";
import CommunicationsCenter from "./pages/admin/CommunicationsCenter";
import SupportCenter from "./pages/admin/SupportCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const isNativePlatform = Capacitor.isNativePlatform();
const Router = isNativePlatform ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant/:id" element={<Restaurant />} />
              <Route path="/flowers" element={<Flowers />} />
              <Route path="/balloons" element={<Balloons />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/addresses" element={<Addresses />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/support" element={<Support />} />
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/driver" element={<DriverApp />} />
              {/* Restaurant Management App Routes */}
              <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
              <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
              <Route path="/restaurant-profile" element={<RestaurantProfile />} />
              <Route path="/menu-management" element={<MenuManagement />} />
              <Route path="/restaurant-analytics" element={<RestaurantAnalytics />} />
              <Route path="/restaurant-reviews" element={<RestaurantReviews />} />
              <Route path="/restaurant-support" element={<RestaurantSupport />} />
              <Route path="/restaurant-finances" element={<RestaurantFinances />} />
              <Route path="/restaurant-promotions" element={<RestaurantPromotions />} />
              <Route path="/restaurant-personnel" element={<RestaurantPersonnel />} />
              
              {/* Admin Panel */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/finances" element={<FinanceManagement />} />
        <Route path="/admin/content" element={<ContentManagement />} />
        <Route path="/admin/users" element={<UsersManagement />} />
        <Route path="/admin/restaurants" element={<RestaurantsManagement />} />
        <Route path="/admin/drivers" element={<DriversManagement />} />
        <Route path="/admin/disputes" element={<DisputesManagement />} />
        <Route path="/admin/campaigns" element={<CampaignsManagement />} />
        <Route path="/admin/reports" element={<ReportsAnalytics />} />
        <Route path="/admin/settings" element={<SystemConfiguration />} />
        <Route path="/admin/communications" element={<CommunicationsCenter />} />
        <Route path="/admin/support" element={<SupportCenter />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingSupportButton />
            <SupportChat />
            </Router>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
