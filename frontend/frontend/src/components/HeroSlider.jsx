import { useState, useEffect } from "react";
import "./HeroSlider.css";

const slides = [
  {
    id: 1,
    tag: "New Arrivals",
    headline: "Bring Nature\nIndoors.",
    sub: "Handpicked indoor plants that purify your air and elevate your space.",
    cta: "Shop Plants",
    href: "/plants",
    accent: "#4a9eca",
    img: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=900&q=80",
    imgAlt: "Lush indoor plant in living room",
  },
  {
    id: 2,
    tag: "Best Sellers",
    headline: "Grow From\nSeed.",
    sub: "Premium quality seeds curated for Indian homes and gardens.",
    cta: "Explore Seeds",
    href: "/seeds",
    accent: "#c9a84c",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
    imgAlt: "Seeds and garden tools",
  },
  {
    id: 3,
    tag: "Essential Tools",
    headline: "Care For\nYour Green.",
    sub: "Everything your plants need — from soil to specialized care kits.",
    cta: "Shop Plant Care",
    href: "/tools",
    accent: "#6bbf8e",
    img: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
    imgAlt: "Plant care tools",
  },
];

// Override third slide image
slides[2].img = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80";

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <section className="hero-slider">
      <div className={`hero-slide ${animating ? "fade-out" : "fade-in"}`}>
        {/* Left Content */}
        <div className="hero-content">
          <span className="hero-tag" style={{ color: slide.accent, borderColor: slide.accent + "44" }}>
            {slide.tag}
          </span>
          <h1 className="hero-headline">
            {slide.headline.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p className="hero-sub">{slide.sub}</p>
          <a href={slide.href} className="hero-cta" style={{ background: slide.accent }}>
            {slide.cta}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          {/* Dots */}
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? "active" : ""}`}
                onClick={() => goTo(i)}
                style={i === current ? { background: slide.accent } : {}}
              />
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="hero-image-wrap">
          <div className="hero-image-frame">
            <img src={slide.img} alt={slide.imgAlt} className="hero-img" />
            <div className="hero-img-overlay" style={{ background: `${slide.accent}18` }} />
          </div>
          {/* Floating badge */}
          <div className="hero-badge">
            <span className="badge-icon">✦</span>
            <span>Free delivery over ₹999</span>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div className="slide-counter">
        <span className="current-num">0{current + 1}</span>
        <span className="divider" />
        <span className="total-num">0{slides.length}</span>
      </div>
    </section>
  );
};

export default HeroSlider;
