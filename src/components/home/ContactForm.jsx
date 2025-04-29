"use client";
import React, { useState } from "react";

function ContactForm() {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Your child grade");

  const handleBoardChange = (event) => {
    setSelectedBoard(event.target.value);
  };

  const handleGradeSelectClick = () => {
    setShowGradeOptions((prev) => !prev);
  };

  const handleGradeOptionClick = (grade) => {
    setSelectedGrade(grade);
    setShowGradeOptions(false);
  };

  const [showGradeOptions, setShowGradeOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parent = document.getElementById("parent-name").value.trim();
    const child = document.getElementById("child-name").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const city = document.getElementById("city").value.trim();

    if (!parent || !child || !whatsapp || selectedBoard === "" || selectedGrade === "Your child grade" || !city) {
      alert("Please fill out the complete form.");
      return;
    }

    // Form submission logic here
  };

  return (
    <section className="contact-section">
      <h2 className="section-title">
        <span>when kids have</span>
        <span className="highlight">fun,</span>
        <span>they</span>
        <span className="highlight">learn more!</span>
      </h2>
      <p className="section-description">
        Complete the form and our team will get in touch to help your child
        grow!
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Parent Name</label>
          <input type="text" className="form-input" id="parent-name" placeholder="Your name" />
        </div>
        <div className="form-group">
          <label className="form-label">Child Name</label>
          <input
            type="text"
            className="form-input"
            id="child-name"
            placeholder="Your cutie pie name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">WhatsApp Number</label>
          <input
            type="tel"
            className="form-input"
            id="whatsapp"
            placeholder="Your WhatsApp number"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Grade <span className="required">*</span></label>
          <div
            className="grade-select-box"
            onClick={handleGradeSelectClick}
            style={{
              width: "100%", 
              height: "48px", 
              padding: "0 16px", 
              borderRadius: "12px", 
              border: "1px solid #ddd", 
              fontFamily: "Geologica, sans-serif", 
              fontSize: "14px", 
              fontWeight: "200", 
              lineHeight: "24px", 
              color: "#999", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <span>{selectedGrade}</span>
            <span style={{ marginLeft: "auto" }}>▼</span>
          </div>
          {showGradeOptions && (
            <ul className="options-list" style={{ 
              padding: "10px", 
              listStyle: "none", 
              marginTop: "5px", 
              border: "1px solid #ddd", 
              borderRadius: "8px", 
              position: "absolute", 
              backgroundColor: "#999", 
              zIndex: 10, 
              width: "70%"
            }}>
              {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((grade) => (
                <li
                  key={grade}
                  onClick={() => handleGradeOptionClick(grade)}
                  style={{ padding: "5px 10px", cursor: "pointer" }}
                >
                  {grade}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">School Board <span className="required">*</span></label>
          <div className="radio-group" id="board-group">
            <label className="radio-option">
              <input
                type="radio"
                name="board"
                value="CBSE"
                checked={selectedBoard === "CBSE"}
                onChange={handleBoardChange}
              />
              <div className="radio-button"></div>
              <span>CBSE</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="board"
                value="ICSE"
                checked={selectedBoard === "ICSE"}
                onChange={handleBoardChange}
              />
              <div className="radio-button"></div>
              <span>ICSE</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="board"
                value="IB"
                checked={selectedBoard === "IB"}
                onChange={handleBoardChange}
              />
              <div className="radio-button"></div>
              <span>IB</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="board"
                value="IGCSE"
                checked={selectedBoard === "IGCSE"}
                onChange={handleBoardChange}
              />
              <div className="radio-button"></div>
              <span>IGCSE</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="board"
                value="OTHERS"
                checked={selectedBoard === "OTHERS"}
                onChange={handleBoardChange}
              />
              <div className="radio-button"></div>
              <span>OTHERS</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-input"
            id="city"
            placeholder="Enter your City"
          />
        </div>
        <button type="submit" className="submit-button">
          Submit!
        </button>
      </form>

      <style jsx>{`
        .contact-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 40px 0;
          margin-top: 40px;
          background-color: #fafafa;
        }
        .section-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 56px;
          font-weight: 650;
          line-height: 64px;
          text-align: center;
          color: #000;
          margin: 0;
        }
        .highlight {
          color: #38b6ff;
        }
        .section-description {
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 200;
          line-height: 24px;
          text-align: center;
          color: rgba(0, 0, 0, 0.6);
          margin-top: 20px;
        }
        .contact-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 612px;
          padding: 40px;
          border-radius: 20px;
          border: 1px solid #eee;
          box-shadow: 0px 8px 40px rgba(0, 0, 0, 0.08);
          margin-top: 20px;
          background-color: #fff;
        }
        @media (max-width: 991px) {
          .contact-form {
            width: 90%;
          }
        }
        @media (max-width: 640px) {
          .contact-form {
            width: 90%;
          }
        }
        .form-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 20px;
        }
        .form-label {
          font-family: "Geologica", sans-serif;
          font-size: 14px;
          font-weight: 300;
          line-height: 24px;
          color: #000;
        }
        .required {
          color: red;
          margin-left: 2px;
        }
        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid #ddd;
          font-family: "Geologica", sans-serif;
          font-size: 14px;
          font-weight: 200;
          line-height: 24px;
          color: #999;
        }
        .radio-group {
          display: flex;
          align-items: center;
          gap: 32px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .radio-button {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #1c6fb2;
          display: inline-block;
        }
        .submit-button {
          padding: 12px 32px;
          border: none;
          background-color: #38b6ff;
          color: #fff;
          font-family: "Geologica", sans-serif;
          font-size: 16px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
        }
        .submit-button:hover {
          background-color: #1c6fb2;
        }
        .options-list {
          padding: 10px;
          list-style: none;
          margin-top: 5px;
          border: 1px solid #ddd;
          border-radius: 8px;
          position: absolute;
          background-color: #fff;
          z-index: 10;
          width: 70%;
        }
        .options-list li {
          padding: 5px 10px;
          cursor: pointer;
        }
        .options-list li:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </section>
  );
}

export default ContactForm;
