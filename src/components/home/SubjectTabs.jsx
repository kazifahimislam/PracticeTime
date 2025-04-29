"use client";
import React from "react";

function SubjectTabs() {
  return (
    <section className="subject-section">
      <div className="tabs-container">
        <div className="subject-tab math-tab">
          <span>Math</span>
          <div className="live-badge">
            <svg
              width="67"
              height="31"
              viewBox="0 0 67 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="live-icon"
            >
              <rect
                x="2.41002"
                y="0.187487"
                width="64.3596"
                height="25.5"
                rx="12.75"
                transform="rotate(5 2.41002 0.187487)"
                fill="#FFDDDD"
              />
              <rect
                x="2.41002"
                y="0.187487"
                width="64.3596"
                height="25.5"
                rx="12.75"
                transform="rotate(5 2.41002 0.187487)"
                stroke="#FF5757"
                strokeWidth="1.5"
              />
              <circle
                cx="14.9275"
                cy="14.0813"
                r="2"
                transform="rotate(5 14.9275 14.0813)"
                fill="#FF5757"
              />
              <circle
                cx="14.9275"
                cy="14.0813"
                r="4"
                transform="rotate(5 14.9275 14.0813)"
                stroke="#FF5757"
                strokeOpacity="0.2"
                strokeWidth="4"
              />
              <text
                transform="translate(27.9258 3.17285) rotate(5)"
                fill="#FF5757"
                xmlSpace="preserve"
                style={{ whiteSpace: "pre" }}
                fontFamily="Geologica"
                fontSize="12"
                letterSpacing="0em"
              >
                <tspan x="0" y="16.2">
                  Live!
                </tspan>
              </text>
            </svg>
          </div>
        </div>
        <div className="subject-tab">English</div>
        <div className="subject-tab">Coding</div>
      </div>
      <button 
  className="practice-button" 
  onClick={() => window.appNavigate('start')}
>
  Let's Practice
</button>


      <style jsx>{`
        .subject-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 20px;
        }
        .tabs-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .tabs-container {
            display: block; /* Change from 'none' to 'block' to make tabs visible on mobile */
            width: 100%;
            text-align: center;
          }
          .subject-tab {
            margin-bottom: 10px; /* Space between tabs on small screens */
          }
        }
        .subject-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 152px;
          height: 52px;
          padding: 12px 24px;
          border-radius: 52px;
          border: 1.5px solid #000;
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 24px;
          color: #000;
          position: relative;
          background-color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .subject-tab:hover {
          background-color:rgb(149, 233, 184); /* Hover color */
        }
        .subject-tab:active {
          background-color: #e0e0e0; /* Active click color */
        }
        .math-tab {
          position: relative;
        }
        .live-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          transform: rotate(5deg);
        }
        .live-icon {
          width: 67px;
          height: 31px;
        }
        .practice-button {
          width: 207px;
          height: 52px;
          padding: 0 52px;
          border-radius: 12px;
          border: 2px solid #000;
          box-shadow:
            0px 8px 4px rgba(0, 0, 0, 0.04) inset,
            4px 4px 0px #000;
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          color: #000;
          margin-top: 20px;
          background-color: #febd59;
          cursor: pointer;
        }
        @media (max-width: 640px) {
          .practice-button {
            width: 100%;
            margin-top: 10px;
          }
        }
      `}</style>
    </section>
  );
}

export default SubjectTabs;
