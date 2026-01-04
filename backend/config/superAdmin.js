import User from '../models/User.js';
import bcrypt from 'bcryptjs';

/**
 * Creates a super admin account on server startup if one doesn't exist
 * Credentials are read from environment variables
 */
const createSuperAdmin = async () => {
    try {
        const adminEmail = process.env.SUPER_ADMIN_EMAIL;
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
        const adminName = process.env.SUPER_ADMIN_NAME;

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail, role: 'superadmin' });

        if (existingAdmin) {
            console.log('✅ Super Admin already exists');
            return existingAdmin;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create super admin
        const superAdmin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: 'superadmin',
            isActive: true,
            isEmailVerified: true
        });

        console.log('🎉 Super Admin created successfully!');
        console.log(`   Email: ${adminEmail}`);

        return superAdmin;
    } catch (error) {
        console.error('❌ Error creating Super Admin:', error.message);
        throw error;
    }
};

export default createSuperAdmin;
