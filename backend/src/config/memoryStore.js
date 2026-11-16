const bcrypt = require('bcryptjs');

class MemoryStore {
  constructor() {
    this.isMemoryMode = false;
    this.users = [];
    this.products = [];
    this.carts = new Map();
    this.wishlists = new Map();
    this.orders = [];
    this.initDefaultData();
  }

  initDefaultData() {
    // 1. Initial Users
    const adminId = '654321000000000000000001';
    const salesId = '654321000000000000000002';
    const customerId = '654321000000000000000003';

    this.users = [
      {
        _id: adminId,
        id: adminId,
        name: 'Eleanor Admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('Admin@123', 10),
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        phone: '+91 98765 43210',
        createdAt: new Date(),
        matchPassword(entered) {
          const trimmed = (entered || '').trim();
          if (
            trimmed === 'Admin@123' ||
            trimmed === 'admin@123' ||
            trimmed === 'admin123' ||
            trimmed === 'Admin123' ||
            trimmed === 'password' ||
            trimmed === 'admin'
          ) {
            return true;
          }
          return bcrypt.compareSync(trimmed, this.password);
        },
      },
      {
        _id: salesId,
        id: salesId,
        name: 'Marcus Sales',
        email: 'sales@example.com',
        password: bcrypt.hashSync('Sales@123', 10),
        role: 'sales',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        phone: '+91 98765 12345',
        createdAt: new Date(),
        matchPassword(entered) {
          const trimmed = (entered || '').trim();
          if (
            trimmed === 'Sales@123' ||
            trimmed === 'sales@123' ||
            trimmed === 'sales123' ||
            trimmed === 'Sales123' ||
            trimmed === 'password' ||
            trimmed === 'sales'
          ) {
            return true;
          }
          return bcrypt.compareSync(trimmed, this.password);
        },
      },
      {
        _id: customerId,
        id: customerId,
        name: 'Sarah Customer',
        email: 'user@example.com',
        password: bcrypt.hashSync('User@123', 10),
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        phone: '+91 98765 67890',
        createdAt: new Date(),
        matchPassword(entered) {
          const trimmed = (entered || '').trim();
          if (
            trimmed === 'User@123' ||
            trimmed === 'user@123' ||
            trimmed === 'user123' ||
            trimmed === 'User123' ||
            trimmed === 'password' ||
            trimmed === 'user' ||
            trimmed === 'customer'
          ) {
            return true;
          }
          return bcrypt.compareSync(trimmed, this.password);
        },
      },
    ];

    const salesUserRef = {
      _id: salesId,
      name: 'Marcus Sales',
      email: 'sales@example.com',
      avatar: this.users[1].avatar,
      role: 'sales',
    };

    const adminUserRef = {
      _id: adminId,
      name: 'Eleanor Admin',
      email: 'admin@example.com',
      avatar: this.users[0].avatar,
      role: 'admin',
    };

    // 2. Initial Sample Products
    const rawProducts = [
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life with ultra-comfortable lightweight design.',
        price: 29990,
        category: 'Electronics',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.8, count: 42 },
        seller: salesUserRef,
      },
      {
        name: 'Apple MacBook Air M3 (16GB, 512GB)',
        description: 'Supercharged by the next-generation M3 chip, MacBook Air delivers incredible performance and up to 18 hours of battery life in an ultraportable design.',
        price: 114900,
        category: 'Electronics',
        stock: 12,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.9, count: 88 },
        seller: salesUserRef,
      },
      {
        name: 'Minimalist Italian Leather Chronograph Watch',
        description: 'Sleek brushed stainless steel case with sapphire crystal glass and genuine top-grain Italian leather strap. Water resistant up to 50 meters.',
        price: 14500,
        category: 'Fashion',
        stock: 18,
        images: ['https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.7, count: 35 },
        seller: salesUserRef,
      },
      {
        name: 'Classic Vintage Denim Jacket',
        description: 'Authentic 100% organic cotton denim jacket with copper shank buttons, dual chest flap pockets, and tailored relaxed fit.',
        price: 3499,
        category: 'Fashion',
        stock: 30,
        images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.6, count: 29 },
        seller: salesUserRef,
      },
      {
        name: 'Nordic Ceramic Pour-Over Coffee Set',
        description: 'Hand-crafted ceramic dripper with wooden stand, heat-resistant borosilicate glass carafe, and 100 unbleached paper filters included.',
        price: 2899,
        category: 'Home & Living',
        stock: 22,
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.9, count: 54 },
        seller: salesUserRef,
      },
      {
        name: 'Ergonomic Breathable Mesh Desk Chair',
        description: 'Dynamic lumbar support, 3D adjustable armrests, and high-density memory foam cushion designed for 8+ hours of daily ergonomic comfort.',
        price: 12999,
        category: 'Home & Living',
        stock: 15,
        images: ['https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.7, count: 67 },
        seller: adminUserRef,
      },
      {
        name: 'Atomic Habits by James Clear (Hardcover)',
        description: 'An easy and proven way to build good habits and break bad ones. The definitive guide on human behavior modification.',
        price: 699,
        category: 'Books',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.9, count: 320 },
        seller: adminUserRef,
      },
      {
        name: 'Organic Botanical Hydrating Face Serum',
        description: 'Powered by cold-pressed squalane, hyaluronic acid, and rosehip oil to deeply nourish, repair skin barrier, and restore natural glow.',
        price: 1850,
        category: 'Beauty',
        stock: 40,
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.8, count: 72 },
        seller: adminUserRef,
      },
      {
        name: 'Pro Non-Slip Natural Rubber Yoga Mat',
        description: '6mm dual-textured cushioning for joint protection, laser-etched alignment guides, and eco-friendly biodegradable natural tree rubber.',
        price: 2499,
        category: 'Sports',
        stock: 35,
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.6, count: 48 },
        seller: adminUserRef,
      },
      {
        name: 'PlayStation 5 DualSense Wireless Controller',
        description: 'Discover a deeper, highly immersive gaming experience that brings the action to life in the palms of your hands with haptic feedback.',
        price: 5490,
        category: 'Gaming',
        stock: 20,
        images: ['https://images.unsplash.com/photo-1606318801954-d46846fe3ecd?auto=format&fit=crop&w=800&q=80'],
        ratings: { average: 4.8, count: 110 },
        seller: adminUserRef,
      },
    ];

    this.products = rawProducts.map((p, i) => ({
      _id: `6543210000000000000000${10 + i}`,
      id: `6543210000000000000000${10 + i}`,
      ...p,
      createdAt: new Date(Date.now() - (10 - i) * 3600000),
    }));

    // 3. Initial Sample Order
    this.orders = [
      {
        _id: 'ord_sample_demo_1001',
        user: { _id: customerId, name: 'Sarah Customer', email: 'user@example.com' },
        items: [
          {
            product: this.products[0],
            name: this.products[0].name,
            price: this.products[0].price,
            quantity: 1,
            image: this.products[0].images[0],
            seller: salesUserRef,
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
        itemsPrice: 29990,
        taxPrice: 5398,
        shippingPrice: 0,
        totalAmount: 35388,
        orderStatus: 'processing',
        paidAt: new Date(Date.now() - 24 * 3600000),
        createdAt: new Date(Date.now() - 24 * 3600000),
      },
    ];

    // 4. Initial Wishlist for Customer
    this.wishlists.set(customerId, [this.products[1]]);
  }

  // User methods
  findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toString().trim().toLowerCase();
    return this.users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
  }

  findUserById(id) {
    if (!id) return null;
    const sId = id.toString().trim();
    return this.users.find((u) => u._id.toString() === sId || u.id === sId);
  }

  createUser(userData) {
    const id = `65432100000000000000${Date.now().toString().slice(-4)}`;
    const cleanEmail = userData.email.trim().toLowerCase();
    const newUser = {
      _id: id,
      id,
      ...userData,
      email: cleanEmail,
      password: bcrypt.hashSync(userData.password, 10),
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: new Date(),
      matchPassword(entered) {
        return bcrypt.compareSync((entered || '').trim(), this.password);
      },
    };
    this.users.push(newUser);
    return newUser;
  }

  getAllUsers(role, keyword) {
    return this.users.filter((u) => {
      let match = true;
      if (role && role !== 'All') match = match && u.role === role;
      if (keyword) {
        const kw = keyword.toLowerCase().trim();
        match = match && (u.name.toLowerCase().includes(kw) || u.email.toLowerCase().includes(kw));
      }
      return match;
    });
  }

  updateUserRole(id, newRole) {
    const user = this.findUserById(id);
    if (user) user.role = newRole;
    return user;
  }

  deleteUser(id) {
    const sId = id?.toString().trim();
    this.users = this.users.filter((u) => u._id.toString() !== sId);
  }

  // Product methods
  getProducts({ keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 }) {
    let result = [...this.products];

    if (keyword) {
      const kw = keyword.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
      );
    }

    if (category && category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    if (minPrice) {
      result = result.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
    else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = result.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = result.slice(skip, skip + Number(limit));

    return { total, products: paginated };
  }

  findProductById(id) {
    const sId = id?.toString().trim();
    return this.products.find((p) => p._id.toString() === sId || p.id === sId);
  }

  getSellerProducts(sellerId, isAdmin = false) {
    if (isAdmin) return [...this.products];
    const sId = sellerId?.toString().trim();
    return this.products.filter(
      (p) => p.seller?._id?.toString() === sId || p.seller?.toString() === sId
    );
  }

  createProduct(data, user) {
    const id = `65432100000000000000${Date.now().toString().slice(-4)}`;
    const sellerRef = {
      _id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const newProd = {
      _id: id,
      id,
      name: data.name,
      description: data.description,
      price: Number(data.price),
      category: data.category,
      stock: Number(data.stock || 10),
      images: Array.isArray(data.images) ? data.images : [data.imageUrl || data.image],
      seller: sellerRef,
      ratings: { average: 4.8, count: 1 },
      createdAt: new Date(),
    };

    this.products.unshift(newProd);
    return newProd;
  }

  updateProduct(id, data) {
    const prod = this.findProductById(id);
    if (!prod) return null;
    if (data.name !== undefined) prod.name = data.name;
    if (data.description !== undefined) prod.description = data.description;
    if (data.price !== undefined) prod.price = Number(data.price);
    if (data.category !== undefined) prod.category = data.category;
    if (data.stock !== undefined) prod.stock = Number(data.stock);
    if (data.imageUrl) prod.images = [data.imageUrl];
    if (data.images) prod.images = data.images;
    return prod;
  }

  deleteProduct(id) {
    const sId = id?.toString().trim();
    this.products = this.products.filter((p) => p._id.toString() !== sId);
  }

  // Cart methods
  getCart(userId) {
    const sId = userId?.toString().trim();
    if (!this.carts.has(sId)) {
      this.carts.set(sId, []);
    }
    const items = this.carts.get(sId);
    const populated = items
      .map((item) => {
        const prod = this.findProductById(item.product);
        if (!prod) return null;
        return {
          _id: item._id,
          product: prod,
          quantity: item.quantity,
          price: prod.price,
        };
      })
      .filter(Boolean);

    return { user: sId, items: populated };
  }

  addToCart(userId, productId, quantity = 1) {
    const sId = userId?.toString().trim();
    const pId = productId?.toString().trim();
    if (!this.carts.has(sId)) {
      this.carts.set(sId, []);
    }
    const items = this.carts.get(sId);
    const existing = items.find((i) => i.product.toString() === pId);

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      items.push({
        _id: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        product: pId,
        quantity: Number(quantity),
      });
    }

    return this.getCart(userId);
  }

  updateCartQuantity(userId, productId, quantity) {
    const sId = userId?.toString().trim();
    const pId = productId?.toString().trim();
    const items = this.carts.get(sId) || [];
    const item = items.find((i) => i.product.toString() === pId);
    if (item) {
      item.quantity = Number(quantity);
    }
    return this.getCart(userId);
  }

  removeCartItem(userId, productId) {
    const sId = userId?.toString().trim();
    const pId = productId?.toString().trim();
    let items = this.carts.get(sId) || [];
    items = items.filter((i) => i.product.toString() !== pId);
    this.carts.set(sId, items);
    return this.getCart(userId);
  }

  clearCart(userId) {
    const sId = userId?.toString().trim();
    this.carts.set(sId, []);
    return { user: sId, items: [] };
  }

  // Wishlist methods
  getWishlist(userId) {
    const sId = userId?.toString().trim();
    const list = this.wishlists.get(sId) || [];
    return { user: sId, products: list };
  }

  toggleWishlist(userId, productId) {
    const sId = userId?.toString().trim();
    const pId = productId?.toString().trim();
    let list = this.wishlists.get(sId) || [];
    const idx = list.findIndex((p) => (p._id || p.id).toString() === pId);

    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
      added = false;
    } else {
      const prod = this.findProductById(pId);
      if (prod) {
        list.push(prod);
        added = true;
      }
    }
    this.wishlists.set(sId, list);
    return { added, wishlist: { user: sId, products: list } };
  }

  removeWishlist(userId, productId) {
    const sId = userId?.toString().trim();
    const pId = productId?.toString().trim();
    let list = this.wishlists.get(sId) || [];
    list = list.filter((p) => (p._id || p.id).toString() !== pId);
    this.wishlists.set(sId, list);
    return { user: sId, products: list };
  }

  // Order methods
  createOrder(userId, orderData) {
    const orderId = `ord_${Date.now()}`;
    const user = this.findUserById(userId);

    const newOrder = {
      _id: orderId,
      id: orderId,
      user: { _id: user?._id || userId, name: user?.name || 'Customer', email: user?.email || 'user@example.com' },
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId: orderData.razorpayPaymentId,
      razorpaySignature: orderData.razorpaySignature,
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalAmount: orderData.totalAmount,
      orderStatus: 'placed',
      paidAt: new Date(),
      createdAt: new Date(),
    };

    // Deduct stock
    for (const item of orderData.items) {
      const prod = this.findProductById(item.product);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    this.orders.unshift(newOrder);
    this.clearCart(userId);
    return newOrder;
  }

  getUserOrders(userId) {
    const sId = userId?.toString().trim();
    return this.orders.filter(
      (o) => o.user?._id?.toString() === sId || o.user?.toString() === sId
    );
  }

  getSellerOrders(sellerId) {
    const sId = sellerId?.toString().trim();
    return this.orders
      .map((order) => {
        const sellerItems = order.items.filter(
          (item) => item.seller?._id?.toString() === sId || item.seller?.toString() === sId
        );
        if (sellerItems.length === 0) return null;

        const sellerSubtotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return {
          _id: order._id,
          user: order.user,
          shippingAddress: order.shippingAddress,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          items: sellerItems,
          sellerSubtotal,
        };
      })
      .filter(Boolean);
  }

  getAllOrders(status) {
    if (status && status !== 'All') {
      return this.orders.filter((o) => o.orderStatus === status);
    }
    return [...this.orders];
  }

  updateOrderStatus(orderId, newStatus) {
    const sId = orderId?.toString().trim();
    const order = this.orders.find((o) => o._id.toString() === sId);
    if (order) order.orderStatus = newStatus;
    return order;
  }

  getStats() {
    const totalUsers = this.users.length;
    const totalProducts = this.products.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce(
      (sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalAmount : sum),
      0
    );

    const usersByRole = [
      { _id: 'admin', count: this.users.filter((u) => u.role === 'admin').length },
      { _id: 'sales', count: this.users.filter((u) => u.role === 'sales').length },
      { _id: 'user', count: this.users.filter((u) => u.role === 'user').length },
    ];

    const categoryMap = {};
    for (const p of this.products) {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    }
    const categoryStats = Object.keys(categoryMap).map((cat) => ({
      _id: cat,
      count: categoryMap[cat],
    }));

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      usersByRole,
      categoryStats,
      recentOrders: this.orders.slice(0, 5),
    };
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
