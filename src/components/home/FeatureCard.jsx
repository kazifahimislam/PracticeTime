import React from "react";

function FeatureCard({ image, altText, title, description, backgroundColor }) {
  return (
    <article className="feature-card">
      <div className="image-container" style={{ backgroundColor }}>
        <img src={image} alt={altText} className="feature-image" />
      </div>
      <div className="content-container">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>

      <style jsx>{`
        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 380px;
          height: 492px;
          padding-bottom: 32px;
          border-radius: 24px;
          border: 4px solid #000;
          background-color: #fff;
        }
        .image-container {
          width: 380px;
          height: 320px;
          border-radius: 24px 24px 0 0;
          position: relative;
        }
        .feature-image {
          width: 320px;
          height: 320px;
          position: absolute;
          left: 30px;
          top: 0;
        }
        .content-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 332px;
          gap: 8px;
          margin-top: 20px;
        }
        .feature-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 32px;
          color: #000;
          margin: 0;
        }
        .feature-description {
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 200;
          line-height: 24px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0;
        }
      `}</style>
    </article>
  );
}

export default FeatureCard;
