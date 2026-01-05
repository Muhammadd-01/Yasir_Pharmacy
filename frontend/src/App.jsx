import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, CartProvider, NotificationProvider } from './context';
import { Layout } from './components/layout';
import {
    Home,
    Login,
    Register,
    Products,
    ProductDetail,
    Cart,
    About,
    Contact,
    HealthTips,
    Services,
    Orders,
    Profile,
    Notifications,
    Checkout,
    Wishlist,
    FAQs,
    ReturnPolicy
} from './pages';

import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <NotificationProvider>
                            <ScrollToTop />
                            <Routes>
                                {/* Auth Routes (no layout) */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                {/* Main Routes (with layout) */}
                                <Route element={<Layout />}>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/medicines" element={<Products type="medicine" />} />
                                    <Route path="/medicines/:slug" element={<ProductDetail type="medicine" />} />
                                    <Route path="/general-items" element={<Products type="general" />} />
                                    <Route path="/general-items/:slug" element={<ProductDetail type="general" />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/orders" element={<Orders />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/wishlist" element={<Wishlist />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/health-tips" element={<HealthTips />} />
                                    <Route path="/services" element={<Services />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/faqs" element={<FAQs />} />
                                    <Route path="/return-policy" element={<ReturnPolicy />} />
                                </Route>
                            </Routes>
                            <BackToTop />
                        </NotificationProvider>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
