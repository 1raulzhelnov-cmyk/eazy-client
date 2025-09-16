import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingSupportButton />
            <SupportChat />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
