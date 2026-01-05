import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Minus, Plus, Star, Heart, Share2,
    Truck, Shield, ArrowLeft, Package, AlertCircle,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import ReviewSection from '@/components/reviews/ReviewSection';
import ShareButton from '@/components/ShareButton';
import { productsAPI, wishlistAPI } from '@/lib/api';
import { useCart, useAuth, useNotification } from '@/context';
import { getImageUrl } from '@/lib/utils';

const ProductDetail = ({ type = 'medicine' }) => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [inWishlist, setInWishlist] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const { addToCart, loading: cartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const { notify } = useNotification();

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const images = product?.images?.length > 0 ? product.images : [{ url: '/placeholder-product.jpg' }];

    useEffect(() => {
        if (!product || images.length <= 1) return;

        const interval = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % images.length);
        }, 4000); // Cycle main image every 4 seconds

        return () => clearInterval(interval);
    }, [product, images.length]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getById(slug);
            setProduct(response.data.data);

            // Check wishlist status if authenticated
            if (isAuthenticated) {
                checkWishlistStatus(response.data.data._id);
            }

            // Fetch related products
            const relatedRes = await productsAPI.getRelated(response.data.data._id, 4);
            setRelatedProducts(relatedRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch product:', error);
            notify.error('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const checkWishlistStatus = async (id) => {
        try {
            const res = await wishlistAPI.get();
            const exists = res.data.data?.products?.some(item => item.product._id === id);
            setInWishlist(exists);
        } catch (error) {
            console.error('Failed to check wishlist:', error);
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            notify.auth('Please login to use wishlist');
            return;
        }

        setWishlistLoading(true);
        try {
            if (inWishlist) {
                await wishlistAPI.remove(product._id);
                setInWishlist(false);
                notify.success('Removed from wishlist');
            } else {
                await wishlistAPI.add(product._id);
                setInWishlist(true);
                notify.success('Added to wishlist');
            }
        } catch (error) {
            notify.error('Failed to update wishlist');
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            notify.auth('Please register or login to add items to your cart');
            return;
        }

        const result = await addToCart(product._id, quantity);
        if (result.success) {
            notify.success(`${product.name} added to cart`);
        } else {
            notify.error(result.error || 'Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
                <Link to={type === 'medicine' ? '/medicines' : '/general-items'}>
                    <Button variant="glow">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to {type === 'medicine' ? 'Medicines' : 'Products'}
                    </Button>
                </Link>
            </div>
        );
    }

    const hasDiscount = product.comparePrice && product.comparePrice > product.price;

    return (
        <div className="min-h-screen pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link to="/" className="hover:text-white">Home</Link>
                    <span>/</span>
                    <Link to={type === 'medicine' ? '/medicines' : '/general-items'} className="hover:text-white">
                        {type === 'medicine' ? 'Medicines' : 'General Items'}
                    </Link>
                    <span>/</span>
                    <span className="text-white">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <div className="relative aspect-square rounded-2xl overflow-hidden glass-card neon-border group/img">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    src={getImageUrl(images[selectedImage]?.url || images[selectedImage])}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedImage((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-neon-silver hover:text-black"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedImage((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-neon-silver hover:text-black"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}

                            {hasDiscount && (
                                <span className="absolute top-4 left-4 px-3 py-1 text-sm font-bold rounded-lg bg-red-500 text-white z-10">
                                    -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-3">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-neon-silver' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={getImageUrl(img.url || img)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div>
                            <p className="text-sm text-neon-silver uppercase tracking-wider mb-2">
                                {product.category?.name || (type === 'medicine' ? 'Medicine' : 'General')}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

                            {/* Rating */}
                            {product.ratings?.average > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= product.ratings.average
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground">
                                        ({product.ratings.count} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-bold chrome-text">
                                Rs. {product.price?.toLocaleString()}
                            </span>
                            {hasDiscount && (
                                <span className="text-xl text-muted-foreground line-through">
                                    Rs. {product.comparePrice?.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${product.stock > 0
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'
                                }`} />
                            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                        </div>

                        {/* Description */}
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Medicine Details */}
                        {type === 'medicine' && product.medicineDetails && (
                            <div className="glass-card rounded-xl p-4 space-y-3">
                                {product.medicineDetails.manufacturer && (
                                    <p><span className="text-muted-foreground">Manufacturer:</span> {product.medicineDetails.manufacturer}</p>
                                )}
                                {product.medicineDetails.composition && (
                                    <p><span className="text-muted-foreground">Composition:</span> {product.medicineDetails.composition}</p>
                                )}
                                {product.medicineDetails.dosage && (
                                    <p><span className="text-muted-foreground">Dosage:</span> {product.medicineDetails.dosage}</p>
                                )}
                                {product.medicineDetails.prescriptionRequired && (
                                    <p className="text-amber-400 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Prescription Required
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center glass-card rounded-lg neon-border">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-white/5 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-3 hover:bg-white/5 transition-colors"
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <Button
                                variant="glow"
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={cartLoading || product.stock === 0}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className={`h-12 w-12 ${inWishlist ? 'text-red-500 border-red-500/50 bg-red-500/10' : ''}`}
                                onClick={handleWishlistToggle}
                                disabled={wishlistLoading}
                            >
                                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                            </Button>

                            <ShareButton
                                title={product.name}
                                text={`Check out ${product.name} on Yasir Pharmacy!`}
                            />
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neon-silver/10 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-neon-silver" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Free Delivery</p>
                                    <p className="text-muted-foreground">On orders over Rs. 5000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neon-silver/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-neon-silver" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-medium">Genuine Product</p>
                                    <p className="text-muted-foreground">100% authentic</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Reviews Section */}
                <div className="mt-20">
                    <ReviewSection productId={product._id} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-20">
                        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct._id} product={relProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
