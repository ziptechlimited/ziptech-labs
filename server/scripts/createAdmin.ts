#!/usr/bin/env ts-node

/**
 * Admin Account Creation Script
 * 
 * Usage:
 *   npm run create-admin
 * 
 * Or directly:
 *   npx ts-node scripts/createAdmin.ts
 */

import mongoose from 'mongoose';
import readline from 'readline';
import User from '../src/models/User';
import { config } from '../src/config/env';
import { UserRole } from '../src/types/shared';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin details
        const name = await question('Admin Name: ');
        const email = await question('Admin Email: ');
        const password = await question('Admin Password: ');

        if (!name || !email || !password) {
            console.error('❌ All fields are required');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('❌ User with this email already exists');
            process.exit(1);
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password,
            role: UserRole.ADMIN
        });

        console.log('\n✅ Admin account created successfully!');
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin._id}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
    }
};

createAdmin();
