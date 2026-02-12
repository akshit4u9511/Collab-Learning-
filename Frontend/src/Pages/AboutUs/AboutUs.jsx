import React from "react";
import "./AboutUs.css"; // Make sure this is imported

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-content">
        <h2 className="about-us-title">About Us</h2>
        <p className="about-us-description">
          <i>
            As students, we have looked for upskilling everywhere. Mostly, we end up paying big amounts to gain
            certifications and learn relevant skills. We thought of SkillSwap to resolve that. Learning new skills and
            gaining more knowledge all while networking with talented people!
          </i>
        </p>
        <p className="about-us-description">
          <br />
          At SkillSwap, we believe in the power of learning and sharing knowledge. Our platform connects individuals
          from diverse backgrounds to exchange practical skills and expertise.
          <br />
          <br />
          Our mission is to empower individuals to unlock their full potential through skill sharing. By facilitating
          meaningful interactions and fostering a culture of lifelong learning, we aim to create a community where
          everyone has the opportunity to thrive.
        </p>
      </div>
      <img src={"/assets/images/about us.png"} alt="About Us" className="about-us-image" />
    </div>
  );
};

export default AboutUs;