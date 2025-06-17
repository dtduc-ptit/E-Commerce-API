const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const db = require('./config/db');

const createAdmin = async () => {
    try {
        await db();

        const adminData = {
            email: 'admin@example.com',
            password: 'dinhduc',
            name: 'Super Admin',
            role: 'admin'
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        const admin = new User({
            ...adminData,
            password: hashedPassword
        });

        await admin.save();
        console.log('Admin created successfully');
    } catch (error) {
        console.error('Error creating admin:', error.message);
    } finally {
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};

createAdmin();
