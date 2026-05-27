import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { product, quantity, type, isCartCheckout, products, totalAmount } = location.state || {};

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    pincode: '',
    phone: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [stockError, setStockError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- NEW: RAZORPAY DUMMY STATES ---
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [rzpProcessing, setRzpProcessing] = useState(false);
  const [rzpSuccess, setRzpSuccess] = useState(false);

  useEffect(() => {
    if (!product && (!products || products.length === 0)) { 
      navigate('/'); 
      return; 
    }
    
    const storedEmail = localStorage.getItem('verdant_email');
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
      setIsLoggedIn(true);
    }
  }, [product, products, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const finalPrice = isCartCheckout ? totalAmount : (product ? product.current_price * quantity : 0);

  // --- ORDER LOGIC REMAINS 100% UNCHANGED ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStockError(false);
    setErrorMessage('');
    setIsProcessing(true);
    
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.firstName) || !nameRegex.test(formData.lastName)) {
      setErrorMessage("Names can only contain alphabets.");
      setStockError(true);
      setIsProcessing(false);
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      setStockError(true);
      setIsProcessing(false);
      return;
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
      setStockError(true);
      setIsProcessing(false);
      return;
    }

    try {
      const pinResponse = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
      const pinData = await pinResponse.json();
      
      if (pinData[0].Status === "Error" || pinData[0].Status === "404") {
        setErrorMessage(`The PIN code ${formData.pincode} does not exist. Please check and try again.`);
        setStockError(true);
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn("Postal API is down, skipping strict real-world check.", err);
    }

    const tableMap = { plant: 'plants', seed: 'seeds', tool: 'tools' };

    try {
      if (isCartCheckout) {
        for (const item of products) {
          const itemType = item.tool_type || item.material ? 'tool' : (item.sowing_period ? 'seed' : 'plant');
          const res = await fetch(`https://verdant-backend-usze.onrender.com//api/${tableMap[itemType]}/${item.id}`);
          const fresh = await res.json();
          
          if (Number(fresh.stock) < item.quantity) {
            setErrorMessage(`Sorry, "${item.name}" is out of stock.`);
            setStockError(true);
            setIsProcessing(false);
            return;
          }
        }
      } else {
        const res = await fetch(`https://verdant-backend-usze.onrender.com//api/${tableMap[type]}/${product.id}`);
        const fresh = await res.json();
        if (Number(fresh.stock) < quantity) {
          setErrorMessage(`Sorry, "${product.name}" is out of stock.`);
          setStockError(true);
          setIsProcessing(false);
          return;
        }
      }
      
      const itemsToSave = isCartCheckout ? products.map(item => ({
        id: item.id,
        name: item.name,
        type: item.tool_type || item.material ? 'tool' : (item.sowing_period ? 'seed' : 'plant'),
        quantity: item.quantity,
        current_price: item.current_price
      })) : [{
        id: product.id,
        name: product.name,
        type: type,
        quantity: quantity,
        current_price: product.current_price
      }];

      const generatedOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;

      await fetch('https://verdant-backend-usze.onrender.com//api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: formData,
          paymentInfo: {
            razorpay_order_id: generatedOrderId,       
            razorpay_payment_id: "RAZORPAY_DUMMY_SIMULATION"    
          },
          items: itemsToSave,
          totalAmount: finalPrice
        })
      });

      if (isCartCheckout) {
        for (const item of itemsToSave) {
          await fetch('https://verdant-backend-usze.onrender.com//api/update-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: item.type, id: item.id, quantity: item.quantity })
          });
        }
      } else {
        await fetch('https://verdant-backend-usze.onrender.com//api/update-stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, id: product.id, quantity })
        });
      }

      setOrderDetails({
        id: generatedOrderId,
        productName: isCartCheckout ? `${products[0].name} & more` : product.name,
        quantity: isCartCheckout ? products.reduce((tot, i) => tot + i.quantity, 0) : quantity,
        total: finalPrice,
        image: isCartCheckout ? products[0].image_url : product.image_url
      });
      
      setIsOrderPlaced(true);
      setIsProcessing(false);

    } catch (err) {
      console.error("Checkout execution failure:", err);
      setErrorMessage("Something went wrong while placing your order. Please try again.");
      setStockError(true);
      setIsProcessing(false);
    }
  };

  // --- NEW: DUMMY RAZORPAY SUBMIT HANDLER ---
  const handleDummyRazorpayPay = () => {
    setRzpProcessing(true);
    
    // Simulate network request to Razorpay
    setTimeout(() => {
      setRzpProcessing(false);
      setRzpSuccess(true);
      
      // Redirect to profile after success animation
      setTimeout(() => {
        navigate('/auth'); 
      }, 2000);
    }, 1800);
  };

  return (
    <div className="checkout-container">
      <div className="checkout-main">
        <form onSubmit={handleFormSubmit}>
          <div className="checkout-section">
            <div className="section-header">
              <h2>Contact</h2>
              {!isLoggedIn && <Link to="/auth" className="login-link">Sign in</Link>}
            </div>
            <input
              type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleInputChange}
              readOnly={isLoggedIn} className={isLoggedIn ? 'readonly-input' : ''} required
            />
          </div>

          <div className="checkout-section">
            <h2>Delivery</h2>
            <select className="full-width-input" disabled><option>India</option></select>
            
            <div className="input-row">
              <input type="text" name="firstName" placeholder="First name" onChange={handleInputChange} required />
              <input type="text" name="lastName" placeholder="Last name" onChange={handleInputChange} required />
            </div>
            
            <input type="text" name="address" placeholder="Address" className="full-width-input" onChange={handleInputChange} required />
            
            <div className="input-row">
              <input type="text" name="city" placeholder="City" onChange={handleInputChange} required />
              <input type="text" name="pincode" placeholder="PIN code (e.g. 641001)" onChange={handleInputChange} required />
            </div>
            
            <input type="tel" name="phone" placeholder="Phone (10 digits)" className="full-width-input" onChange={handleInputChange} required />
          </div>

          {stockError && (
            <div style={{
              background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '12px', color: '#cc0000',
              fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <button type="submit" className="pay-now-btn" disabled={isProcessing}>
            {isProcessing ? 'Verifying Details...' : 'Continue to Payment'}
          </button>
        </form>
      </div>

      {/* MODIFIED: Initial Success Modal with Razorpay Button */}
      {isOrderPlaced && orderDetails && !showRazorpayModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Order Reserved!</h2>
            <p className="success-subtitle">Your items are locked in. Please complete payment to finalize.</p>
            <div className="order-summary-card">
              <img src={`https://verdant-backend-usze.onrender.com/${orderDetails.image}`} alt={orderDetails.productName} />
              <div className="order-summary-details">
                <h3>{orderDetails.productName}</h3>
                <p>Qty: {orderDetails.quantity}</p>
                <p className="order-total">Total: ₹{orderDetails.total}</p>
              </div>
            </div>
            <div className="order-id">
              <span>Order ID:</span>
              <strong>{orderDetails.id}</strong>
            </div>
            
            {/* THIS BUTTON NOW OPENS THE DUMMY RAZORPAY MODAL */}
            <button 
              className="continue-shopping-btn" 
              onClick={() => setShowRazorpayModal(true)}
              style={{ backgroundColor: '#338af9', color: 'white', border: 'none', marginTop: '15px' }}
            >
              Pay via Razorpay
            </button>
          </div>
        </div>
      )}

      {/* NEW: DUMMY RAZORPAY CHECKOUT MODAL */}
      {showRazorpayModal && (
        <div className="modal-overlay" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div style={{ 
            background: 'white', 
            width: '100%', 
            maxWidth: '380px', 
            borderRadius: '6px', 
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            
            {/* Razorpay Header */}
            <div style={{ background: '#02042b', padding: '25px 20px 20px', color: 'white', position: 'relative' }}>
               <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: '#F56E6E', color: 'white', fontSize: '10px', textAlign: 'center', padding: '3px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                 TEST MODE
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                 <div style={{ width: '45px', height: '45px', background: '#2c7a4b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>V</div>
                 <div>
                   <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>Verdant Store</div>
                   <div style={{ opacity: 0.8, fontSize: '0.85rem', marginTop: '2px' }}>Order #{orderDetails?.id}</div>
                 </div>
               </div>
               <div style={{ marginTop: '25px', fontSize: '1.6rem', fontWeight: '600' }}>
                 ₹ {Number(orderDetails?.total).toLocaleString('en-IN')}.00
               </div>
               <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>{formData.phone} | {formData.email}</div>
            </div>

            {rzpSuccess ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ width: '60px', height: '60px', background: '#30B12B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '2rem' }}>✓</div>
                <h2 style={{ margin: 0, color: '#1A1F36', fontSize: '1.3rem' }}>Payment Successful</h2>
                <p style={{ color: '#8792A2', marginTop: '10px', fontSize: '0.9rem' }}>Redirecting to merchant...</p>
              </div>
            ) : rzpProcessing ? (
               <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                 <div style={{ 
                   width: '40px', height: '40px', 
                   border: '4px solid #f3f3f3', borderTop: '4px solid #338af9', 
                   borderRadius: '50%', margin: '0 auto 15px',
                   animation: 'spin 1s linear infinite' 
                 }}></div>
                 <h3 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>Processing Payment...</h3>
                 <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '5px' }}>Please do not refresh the page</p>
                 <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
               </div>
            ) : (
              <div style={{ padding: '20px' }}>
                 <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '15px', fontWeight: '600', letterSpacing: '0.5px' }}>PREFERRED PAYMENT METHODS</div>
                 
                 {/* Dummy UPI Option */}
                 <div onClick={handleDummyRazorpayPay} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '4px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ color: '#ff6b6b', fontSize: '1.2rem' }}>❖</div>
                     <span style={{ fontWeight: '500', color: '#333', fontSize: '0.95rem' }}>UPI - Google Pay, PhonePe</span>
                   </div>
                   <span style={{ color: '#ccc', fontWeight: 'bold' }}>&gt;</span>
                 </div>

                 {/* Dummy Card Option */}
                 <div onClick={handleDummyRazorpayPay} style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ color: '#4facfe', fontSize: '1.2rem' }}>💳</div>
                     <span style={{ fontWeight: '500', color: '#333', fontSize: '0.95rem' }}>Card - Visa, MasterCard</span>
                   </div>
                   <span style={{ color: '#ccc', fontWeight: 'bold' }}>&gt;</span>
                 </div>
              </div>
            )}

            {/* Razorpay Footer */}
            <div style={{ background: '#f9f9f9', padding: '12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', color: '#888' }}>
              🔒 Secured by <strong style={{ color: '#338af9', marginLeft: '4px', fontSize: '0.85rem' }}>Razorpay</strong>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;