import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, CreditCard, Package, CheckCircle,
    ArrowRight, ArrowLeft, Loader2, MapPinned
} from 'lucide-react';
import { useAuth, useCart } from '@/context';
import { ordersAPI } from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const { notify } = useNotification();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const [shippingData, setShippingData] = useState({
        fullName: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Pakistan'
    });

    const [paymentMethod, setPaymentMethod] = useState('cod');

    const paymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', icon: Package, description: 'Pay when you receive' },
        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, etc.' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: CreditCard, description: 'Direct bank transfer' },
        { id: 'easypaisa', name: 'EasyPaisa', icon: CreditCard, description: 'Mobile wallet' },
        { id: 'jazzcash', name: 'JazzCash', icon: CreditCard, description: 'Mobile wallet' }
    ];

    useEffect(() => {
        if (!cart || cart.totalItems === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    // Prefill user data
    useEffect(() => {
        if (user) {
            setShippingData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zipCode: user.address?.zipCode || '',
                country: user.address?.country || 'Pakistan'
            }));
        }
    }, [user]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            notify.error('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Using OpenStreetMap Nominatim for reverse geocoding (free)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    // Improve address mapping
                    const address = data.address;
                    const street = [
                        address.house_number,
                        address.road,
                        address.suburb,
                        address.neighbourhood
                    ].filter(Boolean).join(', ');

                    setShippingData(prev => ({
                        ...prev,
                        street: street || prev.street,
                        city: address.city || address.town || address.village || address.city_district || prev.city,
                        state: address.state || address.province || address.territory || address.region || prev.state,
                        zipCode: address.postcode || prev.zipCode,
                        country: address.country || 'Pakistan'
                    }));

                    notify.success('Location fetched successfully!');
                } catch (error) {
                    console.error('Geocoding error:', error);
                    notify.error('Failed to fetch address details');
                } finally {
                    setFetchingLocation(false);
                }
            },
            (error) => {
                setFetchingLocation(false);
                notify.error('Failed to get location. Please enable location access.');
                console.error('Geolocation error:', error);
            }
        );
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setCurrentStep(2);
    };

    const handlePlaceOrder = async () => {
        setLoading(true);

        try {
            const orderData = {
                shippingAddress: shippingData,
                paymentMethod
            };

            await ordersAPI.create(orderData);
            await clearCart();
            setCurrentStep(4);

            setTimeout(() => {
                navigate('/orders');
            }, 3000);
        } catch (error) {
            console.error('Order creation failed:', error);
            notify.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { number: 1, title: 'Shipping', icon: MapPin },
        { number: 2, title: 'Payment', icon: CreditCard },
        { number: 3, title: 'Review', icon: Package },
        { number: 4, title: 'Complete', icon: CheckCircle }
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.number
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-border text-muted-foreground'
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.number ? 'bg-primary' : 'bg-border'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Shipping Information */}
                    {currentStep === 1 && (
                        <motion.div
                            key="shipping"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                            <form onSubmit={handleShippingSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={shippingData.fullName}
                                            onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            value={shippingData.phone}
                                            onChange={e => setShippingData({ ...shippingData, phone: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        required
                                        type="email"
                                        value={shippingData.email}
                                        onChange={e => setShippingData({ ...shippingData, email: e.target.value })}
                                        className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">Street Address</label>
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            disabled={fetchingLocation}
                                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                        >
                                            {fetchingLocation ? (
                                                <><Loader2 className="w-3 h-3 animate-spin" /> Fetching...</>
                                            ) : (
                                                <><MapPinned className="w-3 h-3" /> Use my location</>
                                            )}
                                        </button>
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        value={shippingData.street}
                                        onChange={e => setShippingData({ ...shippingData, street: e.target.value })}
                                        className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City</label>
                                        <input
                                            required
                                            type="text"
                                            value={shippingData.city}
                                            onChange={e => setShippingData({ ...shippingData, city: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">State/Province</label>
                                        <input
                                            type="text"
                                            value={shippingData.state}
                                            onChange={e => setShippingData({ ...shippingData, state: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">ZIP Code</label>
                                        <input
                                            type="text"
                                            value={shippingData.zipCode}
                                            onChange={e => setShippingData({ ...shippingData, zipCode: e.target.value })}
                                            className="w-full h-11 px-4 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        Continue to Payment <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 2: Payment Method */}
                    {currentStep === 2 && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 p-8"
                        >
                            <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                            <div className="space-y-3 mb-6">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === method.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-5 h-5"
                                        />
                                        <method.icon className="w-6 h-6 text-primary" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{method.name}</p>
                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Review Order <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Review Order */}
                    {currentStep === 3 && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 p-8">
                                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-6">
                                    {cart?.items?.map((item) => (
                                        <div key={item._id} className="flex items-center gap-4 pb-4 border-b border-border">
                                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                                                {item.product?.images?.[0] && (
                                                    <img
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.product?.name}</h4>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Address */}
                                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                                    <p className="text-sm">{shippingData.fullName}</p>
                                    <p className="text-sm">{shippingData.street}</p>
                                    <p className="text-sm">{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                                    <p className="text-sm">{shippingData.phone}</p>
                                </div>

                                {/* Payment Method */}
                                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                                    <h3 className="font-semibold mb-2">Payment Method</h3>
                                    <p className="text-sm">{paymentMethods.find(m => m.id === paymentMethod)?.name}</p>
                                </div>

                                {/* Total */}
                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>Rs. {cart?.totalAmount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    ) : (
                                        <>Place Order</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Success */}
                    {currentStep === 4 && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-surface/50 backdrop-blur-md rounded-2xl border border-border/50 p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
                            <p className="text-muted-foreground mb-6">
                                Thank you for your order. You will receive a confirmation email shortly.
                            </p>
                            <p className="text-sm text-muted-foreground">Redirecting to orders page...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Checkout;
