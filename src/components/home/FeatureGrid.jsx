import React from "react";
import FeatureCard from "./FeatureCard";

function FeatureGrid() {
  const features = [
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/f362c9f9f06d526f7152a921fe06f65e66d2a9d9?placeholderIfAbsent=true",
      altText: "Daily Practice",
      title: "10 Mins of Daily Practice!",
      description: "Build skills quickly with short, daily practice sessions",
      backgroundColor: "rgba(250, 235, 120, 0.15)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/c7b884a0ca3a46bb1982fc7a90c66ee1bd63bc6b?placeholderIfAbsent=true",
      altText: "Level-Based Practice",
      title: "Personalized, Level-Based Practice Sheets",
      description:
        "Get customized sheets tailored to each learner's pace and ability",
      backgroundColor: "rgba(255, 87, 87, 0.15)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/4465c59e41ba1c3e9f3b35818f0cbe024b0d885f?placeholderIfAbsent=true",
      altText: "Learn by Doing",
      title: "No Classes - Learn by Doing",
      description:
        "Master concepts independently through focused, hands-on practice",
      backgroundColor: "rgba(126, 217, 86, 0.2)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/474222c49af0573ea0c069b5b2b42b6c334640b0?placeholderIfAbsent=true",
      altText: "Real-World Learning",
      title: "Math Integrated with Real-World Learning Bubbles",
      description:
        "Discover Math in everyday life, making learning meaningful and practical",
      backgroundColor: "rgba(92, 225, 230, 0.2)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/9eebeb646c473d111016f3b98988472f010dbf9c?placeholderIfAbsent=true",
      altText: "Practice Anytime",
      title: "Practice Anytime, Anywhere - Online or Offline",
      description:
        "Enjoy the flexibility to access Practice Sheets online or take printouts for offline practice",
      backgroundColor: "rgba(203, 107, 230, 0.2)",
    },
    {
      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/6e75cb7bbd4aa9c47c666438c4cb313ff3117218?placeholderIfAbsent=true",
      altText: "Smart Reporting",
      title: "Smart Reporting",
      description:
        "Track progress easily with intelligent reports that highlight growth and areas to improve",
      backgroundColor: "rgba(52, 152, 219, 0.15)",
    },
  ];

  return (
    <section className="features-section">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          image={feature.image}
          altText={feature.altText}
          title={feature.title}
          description={feature.description}
          backgroundColor={feature.backgroundColor}
        />
      ))}

      <style jsx>{`
        .features-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
        }
        @media (max-width: 991px) {
          .features-section {
            flex-direction: column;
            align-items: center;
          }
        }
        @media (max-width: 640px) {
          .features-section {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </section>
  );
}

export default FeatureGrid;
