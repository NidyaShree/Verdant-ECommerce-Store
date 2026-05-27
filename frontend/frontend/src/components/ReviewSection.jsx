import React, { useState, useEffect } from 'react';
import './ReviewSection.css';

const ReviewSection = ({ productId, productType }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    
    // Fetch reviews whenever the product changes
    useEffect(() => {
        fetch(`https://verdant-backend-usze.onrender.com//api/reviews/${productType}/${productId}`)
            .then(res => res.json())
            .then(data => {
                setReviews(data);
                setLoading(false);
            })
            .catch(err => console.error("Error fetching reviews:", err));
    }, [productId, productType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("verdant_token");
        
        if (!token) {
            alert("Please login to write a review!");
            window.location.href = "/auth";
            return;
        }

        const res = await fetch("https://verdant-backend-usze.onrender.com//api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                token, 
                product_id: productId, 
                product_type: productType, 
                rating, 
                comment 
            })
        });

        if (res.ok) {
            const newReview = await res.json();
            setReviews([newReview, ...reviews]); // Add to UI instantly
            setComment("");
        } else {
            alert("Failed to post review. Please try again.");
        }
    };

    return (
        <div className="reviews-section">
            <h3>Customer Reviews</h3>
            
            <div className="reviews-list">
                {reviews.map(r => (
                    <div key={r.id} className="review-card">
                        <div className="review-header">
                            <span className="stars">{"★".repeat(r.rating)}</span>
                            <span className="user-info">
                                <strong>{r.username}</strong> 
                                <span className="verified-badge"> Verified</span>
                            </span>
                        </div>
                        <p className="review-date">{new Date(r.created_at).toLocaleDateString()}</p>
                        <p className="review-text">{r.comment}</p>
                    </div>
                ))}
            </div>

            <form className="add-review-form" onSubmit={handleSubmit}>
                <h4>Leave a Review</h4>
                <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
                <textarea 
                    placeholder="Tell us what you think..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                />
                <button type="submit">Submit Review</button>
            </form>
        </div>
    );
};

export default ReviewSection;