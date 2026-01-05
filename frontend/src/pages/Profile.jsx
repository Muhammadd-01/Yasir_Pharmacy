import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Loader2, Camera, Upload } from 'lucide-react';
import { useAuth, useNotification } from '@/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usersAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { MapPinned } from 'lucide-react'; // Add icon

const Profile = () => {
    const { user, updateProfile } = useAuth(); // Use context update method
    const { notify } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'Pakistan'
    });
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

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
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const address = data.address;
                    const street = [
                        address.house_number,
                        address.road,
                        address.region,
                        address.state_district,
                        address.county,
                        address.neighbourhood,
                        address.suburb
                    ].filter(Boolean).join(', ');

                    setFormData(prev => ({
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
                notify.error('Failed to get location');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('phone', formData.phone);

            // Construct address object
            const addressObj = {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country
            };
            data.append('address', JSON.stringify(addressObj));

            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            // Use context method to update profile and local state
            await updateProfile(data);

            notify.success('Profile updated successfully');
            // Remove reload, state update is handled by context
        } catch (error) {
            console.error('Profile update failed:', error);
            notify.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="glass-card rounded-2xl p-8 neon-border">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    {imagePreview ? (
                                        <img src={getImageUrl(imagePreview)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <label
                                    htmlFor="profile-image"
                                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </label>
                                <input
                                    id="profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{user?.name}</h1>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase">
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="pl-9 bg-muted/50 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Delivery Address</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGetLocation}
                                        disabled={fetchingLocation}
                                        className="h-8 text-xs gap-2"
                                    >
                                        {fetchingLocation ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <MapPinned className="w-3 h-3" />
                                        )}
                                        Use my location
                                    </Button>
                                </div>

                                <div>
                                    <Label htmlFor="street" className="text-xs text-muted-foreground mb-1 block">Street Address</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        placeholder="House #, Street, Area"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city" className="text-xs text-muted-foreground mb-1 block">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state" className="text-xs text-muted-foreground mb-1 block">State/Province</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="zipCode" className="text-xs text-muted-foreground mb-1 block">ZIP Code</Label>
                                        <Input
                                            id="zipCode"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="country" className="text-xs text-muted-foreground mb-1 block">Country</Label>
                                        <Input
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" variant="glow" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
