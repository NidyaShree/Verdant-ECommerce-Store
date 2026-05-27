import express from "express";
import cors from "cors";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const JWT_SECRET = "verdant_secret_key_2026"; 

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors());
app.use(express.json());
app.use('/images', express.static('public/images'));

// --- AUTHENTICATION ROUTES ---

// 1. Register a new user
app.post("/api/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPw = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username",
            [username, email, hashedPw]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "User already exists or database error" });
    }
});

// 2. Login user
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });

        const validPw = await bcrypt.compare(password, user.rows[0].password);
        if (!validPw) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign(
            { id: user.rows[0].id, username: user.rows[0].username }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            username: user.rows[0].username, 
            email: user.rows[0].email
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// --- UNIFIED REVIEW ROUTES ---

// 3. Get reviews for ANY product type (plant/seed/tool)
app.get("/api/reviews/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    try {
        const reviews = await pool.query(
            `SELECT r.*, u.username 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_type = $1 AND r.product_id = $2 
             ORDER BY r.created_at DESC`,
            [type, id]
        );
        res.json(reviews.rows);
    } catch (err) {
        res.status(500).send("Error fetching reviews");
    }
});

// 4. Post a new review (Requires Auth Token)
app.post("/api/reviews", async (req, res) => {
    const { token, product_id, product_type, rating, comment } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const newReview = await pool.query(
            "INSERT INTO reviews (user_id, product_id, product_type, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [decoded.id, product_id, product_type, rating, comment]
        );
        
        // Return the review with the username so it shows up instantly on frontend
        const reviewWithUser = { ...newReview.rows[0], username: decoded.username };
        res.json(reviewWithUser);
    } catch (err) {
        res.status(401).json({ message: "Unauthorized: Please login again" });
    }
});

// --- EXISTING PRODUCT ROUTES ---

app.get("/api/plants", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM plants ORDER BY id ASC;");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: "ERROR", error: err.message });
    }
});

app.get("/api/seeds", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM seeds ORDER BY id ASC;");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: "ERROR", error: err.message });
    }
});

app.get("/api/tools", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tools ORDER BY id ASC;");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ status: "ERROR", message: "Could not fetch tools" });
    }
});

app.get("/api/plants/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM plants WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send("Server Error"); }
});

app.get("/api/seeds/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM seeds WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send("Server Error"); }
});

app.get("/api/tools/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM tools WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).send("Server Error"); }
});

// --- PAYMENT ROUTES (RAZORPAY) ---

app.post("/api/create-order", async (req, res) => {
    try {
        const { amount } = req.body; 
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7), 
        };
        const order = await razorpay.orders.create(options);
        res.json(order); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating Razorpay order" });
    }
});

app.post("/api/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        res.json({ message: "Payment verified successfully", success: true });
    } else {
        res.status(400).json({ message: "Invalid signature sent!", success: false });
    }
});

// --- INVENTORY MANAGEMENT ---
app.post("/api/update-stock", async (req, res) => {
    const { type, id, quantity } = req.body;
    
    const tableMap = { plant: 'plants', seed: 'seeds', tool: 'tools' };
    const table = tableMap[type];

    if (!table) return res.status(400).json({ message: "Invalid product type" });

    try {
        await pool.query(
            `UPDATE ${table} SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
            [quantity, id]
        );
        res.json({ success: true, message: "Stock updated successfully" });
    } catch (err) {
        console.error("Error updating stock:", err.message);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// --- UNIFIED SEARCH ROUTE ---
app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        return res.json([]);
    }

    try {
        const searchQuery = `%${q}%`;
        const result = await pool.query(
            `
            SELECT id, name, image_url, 'plant'::text AS type, current_price FROM plants WHERE name ILIKE $1
            UNION ALL
            SELECT id, name, image_url, 'seed'::text AS type, current_price FROM seeds WHERE name ILIKE $1
            UNION ALL
            SELECT id, name, image_url, 'tool'::text AS type, current_price FROM tools WHERE name ILIKE $1
            LIMIT 8;
            `,
            [searchQuery]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error("Search error:", err.message);
        res.status(500).json({ status: "ERROR", message: "Search failed" });
    }
});

// --- PINCODE DELIVERY CHECK ROUTE ---
app.get("/api/check-pincode/:pincode", (req, res) => {
    const { pincode } = req.params;

    if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({ success: false, message: "Invalid pincode format" });
    }

    let daysToAdd = 4; 
    if (pincode.startsWith('6')) {
        daysToAdd = 2; 
    } else if (pincode.startsWith('1') || pincode.startsWith('4') || pincode.startsWith('8')) {
        daysToAdd = 5; 
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const formattedDate = deliveryDate.toLocaleDateString('en-IN', options);

    res.json({
        success: true,
        estimatedDate: formattedDate,
        message: "Delivery available."
    });
});

// =========================================
// ADMIN AUTHENTICATION ROUTE
// =========================================
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "verdant2026") {
        res.json({ 
            success: true, 
            token: "verdant_admin_auth_token_987654321" 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: "Invalid admin credentials. Access denied." 
        });
    }
});

// =========================================
// SAVE FINAL ORDER ROUTE
// =========================================
app.post("/api/save-order", async (req, res) => {
  const { customerInfo, paymentInfo, items, totalAmount } = req.body;
  try {
    const orderResult = await pool.query(
      `INSERT INTO orders 
      (razorpay_order_id, razorpay_payment_id, first_name, last_name, email, phone, address, city, state, pincode, total_amount) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        paymentInfo.razorpay_order_id, 
        paymentInfo.razorpay_payment_id,
        customerInfo.firstName, 
        customerInfo.lastName, 
        customerInfo.email,
        customerInfo.phone, 
        customerInfo.address, 
        customerInfo.city,
        customerInfo.state || 'N/A', // <-- FIXED: This is the magic fallback stopping the crash!
        customerInfo.pincode, 
        totalAmount
      ]
    );

    const newOrderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_type, product_id, product_name, quantity, price) 
        VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          newOrderId, 
          item.type, 
          item.id, 
          item.name, 
          item.quantity, 
          item.current_price
        ]
      );
    }

    res.json({ success: true, orderId: newOrderId });
  } catch (err) {
    console.error("Failed to save order to database:", err);
    res.status(500).json({ success: false, message: "Database error saving order" });
  }
});

// =========================================
// ADMIN: GET DASHBOARD STATS
// =========================================
app.get("/api/admin/dashboard-stats", async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(countResult.rows[0].count) || 0;

    const revenueResult = await pool.query('SELECT SUM(total_amount) FROM orders');
    const totalRevenue = parseFloat(revenueResult.rows[0].sum) || 0;

    const recentOrdersResult = await pool.query(`
      SELECT 
        o.razorpay_order_id as id, 
        o.first_name, 
        o.last_name, 
        o.created_at, 
        o.total_amount, 
        o.status,
        COALESCE(string_agg(oi.product_name, ', '), '') as products
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC 
      LIMIT 50
    `);

    res.json({
      success: true,
      totalOrders,
      totalRevenue,
      recentOrders: recentOrdersResult.rows
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
});

// =========================================
// ADMIN: UPDATE ORDER STATUS
// =========================================
app.post("/api/admin/update-order-status", async (req, res) => {
  const { orderId, newStatus } = req.body;
  try {
    await pool.query(
      'UPDATE orders SET status = $1 WHERE razorpay_order_id = $2',
      [newStatus, orderId]
    );
    res.json({ success: true, message: "Status updated successfully!" });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
});

// =========================================
// ADMIN: CRUD OPERATIONS FOR PLANTS
// =========================================
app.get("/api/admin/plants", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plants ORDER BY id ASC');
    res.json({ success: true, plants: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/admin/plants", async (req, res) => {
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO plants (name, current_price, stock, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, current_price, stock, image_url]
    );
    res.json({ success: true, plant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/admin/plants/:id", async (req, res) => {
  const { id } = req.params;
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE plants SET name = $1, current_price = $2, stock = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [name, current_price, stock, image_url, id]
    );
    res.json({ success: true, plant: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/admin/plants/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM plants WHERE id = $1', [id]);
    res.json({ success: true, message: "Plant deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================================
// ADMIN: CRUD OPERATIONS FOR SEEDS
// =========================================
app.get("/api/admin/seeds", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seeds ORDER BY id ASC');
    res.json({ success: true, seeds: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching seeds" });
  }
});

app.post("/api/admin/seeds", async (req, res) => {
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO seeds (name, current_price, stock, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, current_price, stock, image_url]
    );
    res.json({ success: true, seed: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error adding seed" });
  }
});

app.put("/api/admin/seeds/:id", async (req, res) => {
  const { id } = req.params;
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE seeds SET name = $1, current_price = $2, stock = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [name, current_price, stock, image_url, id]
    );
    res.json({ success: true, seed: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error updating seed" });
  }
});

app.delete("/api/admin/seeds/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM seeds WHERE id = $1', [id]);
    res.json({ success: true, message: "Seed deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error deleting seed" });
  }
});

// =========================================
// ADMIN: CRUD OPERATIONS FOR TOOLS
// =========================================
app.get("/api/admin/tools", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tools ORDER BY id ASC');
    res.json({ success: true, tools: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching tools" });
  }
});

app.post("/api/admin/tools", async (req, res) => {
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tools (name, current_price, stock, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, current_price, stock, image_url]
    );
    res.json({ success: true, tool: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error adding tool" });
  }
});

app.put("/api/admin/tools/:id", async (req, res) => {
  const { id } = req.params;
  const { name, current_price, stock, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tools SET name = $1, current_price = $2, stock = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [name, current_price, stock, image_url, id]
    );
    res.json({ success: true, tool: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error updating tool" });
  }
});

app.delete("/api/admin/tools/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tools WHERE id = $1', [id]);
    res.json({ success: true, message: "Tool deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error deleting tool" });
  }
});

// =========================================
// ADMIN: GET ALL ORDERS (FULL HISTORY)
// =========================================
app.get("/api/admin/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.razorpay_order_id as id, 
        o.first_name, 
        o.last_name, 
        o.created_at, 
        o.total_amount, 
        o.status,
        COALESCE(string_agg(oi.product_name, ', '), '') as products
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching all orders" });
  }
});

// =========================================
// ADMIN: GET ALL CUSTOMERS (MINI-CRM)
// =========================================
app.get("/api/admin/customers", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        email,
        MAX(first_name) as first_name,
        MAX(last_name) as last_name,
        MAX(phone) as phone,
        COUNT(id) as total_orders,
        SUM(total_amount) as total_spent,
        MAX(created_at) as last_order_date
      FROM orders
      GROUP BY email
      ORDER BY last_order_date DESC
    `);
    res.json({ success: true, customers: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error fetching customers" });
  }
});

// =========================================
// PUBLIC: GET SMART FEATURED PRODUCTS
// =========================================
app.get("/api/featured-products", async (req, res) => {
  try {
    // FIXED: Correctly matching 'product_name' from order_items
    const result = await pool.query(`
      WITH ProductSales AS (
        SELECT product_name, SUM(quantity) as total_sold
        FROM order_items
        GROUP BY product_name
      )
      SELECT p.id, p.name, p.current_price, p.image_url, p.stock, 'plant' as category, COALESCE(ps.total_sold, 0) as total_sold
      FROM plants p LEFT JOIN ProductSales ps ON p.name = ps.product_name
      
      UNION ALL
      
      SELECT s.id, s.name, s.current_price, s.image_url, s.stock, 'seed' as category, COALESCE(ps.total_sold, 0) as total_sold
      FROM seeds s LEFT JOIN ProductSales ps ON s.name = ps.product_name
      
      UNION ALL
      
      SELECT t.id, t.name, t.current_price, t.image_url, t.stock, 'tool' as category, COALESCE(ps.total_sold, 0) as total_sold
      FROM tools t LEFT JOIN ProductSales ps ON t.name = ps.product_name
      
      ORDER BY total_sold DESC
      LIMIT 8;
    `);

    res.json({ success: true, products: result.rows });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
});


app.listen(5000, () => {
    console.log("Verdant Backend running on https://verdant-backend-usze.onrender.com/");
});