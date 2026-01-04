import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
// import { NotificationProvider } from './context/NotificationContext'; 
import Sidebar from './components/Sidebar';

import {
    Dashboard,
    Login,
    Products,
    Categories,
    Orders,
    Users
} from './pages';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-2 border-neon-silver border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                {/* <NotificationProvider> */}
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <Sidebar />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<Products />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="users" element={<Users />} />
                    </Route>
                </Routes>
                {/* </NotificationProvider> */}
            </AuthProvider>
        </Router>
    );
}

export default App;
