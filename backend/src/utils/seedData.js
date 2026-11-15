const users = [
  {
    name: 'Eleanor Admin',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98765 43210',
  },
  {
    name: 'Marcus Sales',
    email: 'sales@example.com',
    password: 'Sales@123',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98765 12345',
  },
  {
    name: 'Sarah Customer',
    email: 'user@example.com',
    password: 'User@123',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98765 67890',
  },
];

const sampleProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life with ultra-comfortable lightweight design.',
    price: 29990,
    category: 'Electronics',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.8, count: 42 },
    isFeatured: true,
  },
  {
    name: 'Apple MacBook Air M3 (16GB, 512GB)',
    description: 'Supercharged by the next-generation M3 chip, MacBook Air delivers incredible performance and up to 18 hours of battery life in an ultraportable design.',
    price: 114900,
    category: 'Electronics',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.9, count: 88 },
    isFeatured: true,
  },
  {
    name: 'Minimalist Italian Leather Chronograph Watch',
    description: 'Sleek brushed stainless steel case with sapphire crystal glass and genuine top-grain Italian leather strap. Water resistant up to 50 meters.',
    price: 14500,
    category: 'Fashion',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.7, count: 35 },
    isFeatured: true,
  },
  {
    name: 'Classic Vintage Denim Jacket',
    description: 'Authentic 100% organic cotton denim jacket with copper shank buttons, dual chest flap pockets, and tailored relaxed fit.',
    price: 3499,
    category: 'Fashion',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.6, count: 29 },
    isFeatured: false,
  },
  {
    name: 'Nordic Ceramic Pour-Over Coffee Set',
    description: 'Hand-crafted ceramic dripper with wooden stand, heat-resistant borosilicate glass carafe, and 100 unbleached paper filters included.',
    price: 2899,
    category: 'Home & Living',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.9, count: 54 },
    isFeatured: true,
  },
  {
    name: 'Ergonomic Breathable Mesh Desk Chair',
    description: 'Dynamic lumbar support, 3D adjustable armrests, and high-density memory foam cushion designed for 8+ hours of daily ergonomic comfort.',
    price: 12999,
    category: 'Home & Living',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.7, count: 67 },
    isFeatured: false,
  },
  {
    name: 'Atomic Habits by James Clear (Hardcover)',
    description: 'An easy and proven way to build good habits and break bad ones. The definitive guide on human behavior modification.',
    price: 699,
    category: 'Books',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.9, count: 320 },
    isFeatured: true,
  },
  {
    name: 'Organic Botanical Hydrating Face Serum',
    description: 'Powered by cold-pressed squalane, hyaluronic acid, and rosehip oil to deeply nourish, repair skin barrier, and restore natural glow.',
    price: 1850,
    category: 'Beauty',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.8, count: 72 },
    isFeatured: false,
  },
  {
    name: 'Pro Non-Slip Natural Rubber Yoga Mat',
    description: '6mm dual-textured cushioning for joint protection, laser-etched alignment guides, and eco-friendly biodegradable natural tree rubber.',
    price: 2499,
    category: 'Sports',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.6, count: 48 },
    isFeatured: false,
  },
  {
    name: 'PlayStation 5 DualSense Wireless Controller',
    description: 'Discover a deeper, highly immersive gaming experience that brings the action to life in the palms of your hands with haptic feedback.',
    price: 5490,
    category: 'Gaming',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1606318801954-d46846fe3ecd?auto=format&fit=crop&w=800&q=80'
    ],
    ratings: { average: 4.8, count: 110 },
    isFeatured: true,
  }
];

module.exports = {
  users,
  sampleProducts,
};

