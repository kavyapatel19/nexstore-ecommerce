const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { users, sampleProducts } = require('./seedData');

const importData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kavya_ecommerce';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to database...');

    // Clear existing collections
    await Order.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('[Seeder] Cleared old collections...');

    // 1. Create Users
    // Notice: User.create triggers the pre('save') password hashing middleware
    const createdUsers = [];
    for (const u of users) {
      const createdUser = await User.create(u);
      createdUsers.push(createdUser);
    }
    console.log(`[Seeder] Created ${createdUsers.length} users (Admin, Sales Person, Customer)...`);

    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const salesUser = createdUsers.find((u) => u.role === 'sales');
    const customerUser = createdUsers.find((u) => u.role === 'user');

    // 2. Assign products: alternate between Admin and Sales Person to test ownership RBAC
    const productsToInsert = sampleProducts.map((prod, index) => {
      // First 5 to Sales Person, rest to Admin
      const assignedSeller = index < 6 ? salesUser._id : adminUser._id;
      return {
        ...prod,
        seller: assignedSeller,
      };
    });

    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seeder] Created ${createdProducts.length} sample products...`);

    // 3. Create a sample initial order for the customer
    const sampleItem1 = createdProducts[0]; // Belonging to Sales User
    const sampleItem2 = createdProducts[6]; // Belonging to Admin User

    await Order.create({
      user: customerUser._id,
      items: [
        {
          product: sampleItem1._id,
          name: sampleItem1.name,
          price: sampleItem1.price,
          quantity: 1,
          image: sampleItem1.images[0],
          seller: sampleItem1.seller,
        },
        {
          product: sampleItem2._id,
          name: sampleItem2.name,
          price: sampleItem2.price,
          quantity: 2,
          image: sampleItem2.images[0],
          seller: sampleItem2.seller,
        },
      ],
      shippingAddress: {
        fullName: 'Sarah Customer',
        address: '42 MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        phone: '+91 98765 67890',
      },
      paymentMethod: 'Razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: 'order_seed_demo_101',
      razorpayPaymentId: 'pay_seed_demo_202',
      razorpaySignature: 'sig_verified_mock_checksum',
      itemsPrice: sampleItem1.price + sampleItem2.price * 2,
      taxPrice: Math.round((sampleItem1.price + sampleItem2.price * 2) * 0.18),
      shippingPrice: 0,
      totalAmount: Math.round((sampleItem1.price + sampleItem2.price * 2) * 1.18),
      orderStatus: 'processing',
      paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    // 4. Create initial wishlist item for customer
    await Wishlist.create({
      user: customerUser._id,
      products: [createdProducts[1]._id, createdProducts[2]._id],
    });

    console.log('[Seeder] Database successfully seeded with demo users, products, and orders!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kavya_ecommerce';
    await mongoose.connect(mongoUri);

    await Order.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] All database data destroyed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder] Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

