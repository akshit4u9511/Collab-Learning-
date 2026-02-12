import React, { useState, useEffect } from "react";
import "./LandingPage.css"; // --- Import the CSS file ---

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const imageStyle = {
    left: `${scrollPosition}px`,
  };

  const imageBelowStyle = {
    right: `${scrollPosition}px`,
  };

  return (
    <div className="lp-container">
      <div className="lp-hero-container">
        <img src={"/assets/images/1.png"} alt="Above" className="lp-hero-image" style={imageStyle} />
        <div className="lp-title-box">
          <h1 className="lp-title">SKILL SWAP</h1>
        </div>
        <img src={"/assets/images/2.png"} alt="Below" className="lp-hero-image" style={imageBelowStyle} />
      </div>

      <h2 id="why-skill-swap" className="lp-content-title">WHY SKILL SWAP?</h2>
      <div className="lp-text-container">
        <div className="lp-description">
          At Skill Swap, we believe in the power of mutual learning and collaboration. Here's why Skill Swap is the
          ultimate platform for skill acquisition and knowledge exchange:
          <br /><br /><br />
          <h4 className="lp-feature-title">➊ Learn From Experts:</h4> 
          Gain insights and practical knowledge directly from experienced mentors...
          <br /><br />
          <h4 className="lp-feature-title">➋ Share Your Expertise:</h4> 
          Have a skill or passion you're eager to share? Skill Swap provides a platform...
          <br /><br />
          <h4 className="lp-feature-title">➌ Collaborative Environment:</h4> 
          Our community thrives on collaboration. Connect with like-minded individuals...
          <br /><br />
          <h4 className="lp-feature-title">➍ Diverse Learning Opportunities:</h4> 
          With Skill Swap, the possibilities are endless and <b>free of cost</b>...
          <br /><br />
          <h4 className="lp-feature-title">➎ Continuous Growth:</h4> 
          Learning is a lifelong journey, and Skill Swap is here to support you...
        </div>
      </div>
    </div>
  );
};

export default LandingPage;