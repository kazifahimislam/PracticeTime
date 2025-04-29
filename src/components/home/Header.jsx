import React from "react";

function Header() {
  return (
    <header className="header-container">
      
      <img 
  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f43d381667d23d1c01c38716cd6ae33939430d16?placeholderIfAbsent=true" 
  alt="PracticeTime.ai" 
  className="logo" 
  onClick={() => window.appNavigate('home')}  // Navigate to home when clicked
/>


      <h1 className="tagline">
        <span>the more you</span>
        <span className="highlight">practice!</span>
      </h1>
      <div className="practice-icon-container">
        <svg
          width="142"
          height="122"
          viewBox="0 0 142 122"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="practice-icon"
        >
          <path
            d="M1 27.3447C25.2017 10.5269 76.9959 15.4575 91.4948 37.4728C96.3756 44.8838 92.6925 57.4736 78.9832 52.9366C66.2483 48.722 65.096 29.7458 70.0428 17.7397C77.4662 -0.277324 99.1568 -1.16802 115.894 3.17802C193 52.9366 70.0428 127.857 32.8367 109.245M32.8367 109.245L51.9388 96.5102C51.9388 96.5102 33.8163 108.592 32.8367 109.245ZM32.8367 109.245C31.8571 109.898 51.9388 121 51.9388 121"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="6 6"
          />
        </svg>
      </div>
      <h2 className="tagline">
        <span>the better you</span>
        <span className="highlight">become!</span>
      </h2>

      <style jsx>{`
        .header-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 32px;
        }
        @media (max-width: 640px) {
          .header-container {
            flex-direction: column;
            align-items: center;
          }
        }
        .logo {
          width: 353px;
          height: 60px;
        }
        .tagline {
          font-family: "Space Grotesk", sans-serif;
          font-size: 60px;
          font-weight: 650;
          line-height: 64px;
          letter-spacing: -1.2px;
          color: #000;
          margin-top: 20px;
        }
        .highlight {
          color: #38b6ff;
        }
        .practice-icon-container {
          margin-top: 20px;
        }
        .practice-icon {
          width: 140px;
          height: 120px;
        }
      `}</style>
    </header>
  );
}

export default Header;
