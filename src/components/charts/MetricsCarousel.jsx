import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { theme } from "../../styles/theme.js";
import GaugeDisplay from "./GaugeDisplay.jsx";
import UniversalChart from "./UniversalChart.jsx";

const MetricsCarousel = ({
  metrics = [],
  itemsPerPage = 4,
  autoRotate = false,
  rotationInterval = 5000,
  showNavigation = true,
  showIndicators = true,
  layout = "grid", // "grid" or "carousel"
  colors = theme.colors,
  className = "",
  style = {},
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);

  // Calculate total pages
  const totalPages = Math.ceil(metrics.length / itemsPerPage);

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [isAutoRotating, totalPages, rotationInterval]);

  // Handle touch/swipe for mobile
  const handleTouchStart = (e) => {
    const touchStartX = e.touches[0].clientX;
    const touchStartY = e.touches[0].clientY;

    const handleTouchMove = (e) => {
      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentPage < totalPages - 1) {
          setCurrentPage(currentPage + 1);
        } else if (deltaX < 0 && currentPage > 0) {
          setCurrentPage(currentPage - 1);
        }
        document.removeEventListener("touchmove", handleTouchMove);
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    const cleanUp = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", cleanUp);
    };
    document.addEventListener("touchend", cleanUp, { once: true });
  };

  // Get current page metrics
  const getCurrentPageMetrics = () => {
    const startIndex = currentPage * itemsPerPage;
    return metrics.slice(startIndex, startIndex + itemsPerPage);
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // Render individual metric item
  const renderMetricItem = (metric, index) => {
    const { type = "gauge", title, value, data, chartType, ...props } = metric;

    if (type === "chart") {
      return (
        <div key={index} style={{ flex: 1, minWidth: "250px" }}>
          <UniversalChart
            type={chartType}
            data={data}
            title={title}
            colors={colors}
            {...props}
          />
        </div>
      );
    }

    return (
      <div key={index} style={{ flex: 1, minWidth: "200px" }}>
        <GaugeDisplay title={title} value={value} colors={colors} {...props} />
      </div>
    );
  };

  // Navigation controls
  const NavigationControls = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "15px",
        marginTop: "15px",
      }}
    >
      {/* Previous Button */}
      <button
        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        style={{
          padding: "8px 12px",
          backgroundColor:
            currentPage === 0 ? colors.secondary : colors.primary,
          color: currentPage === 0 ? colors.textLight : "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: currentPage === 0 ? "not-allowed" : "pointer",
          fontSize: "0.9rem",
          fontWeight: "500",
          transition: "all 0.3s ease",
        }}
      >
        ← Previous
      </button>

      {/* Auto-rotate toggle */}
      <button
        onClick={() => setIsAutoRotating(!isAutoRotating)}
        style={{
          padding: "8px 12px",
          backgroundColor: isAutoRotating
            ? colors.accentGreen
            : colors.secondary,
          color: isAutoRotating ? "#fff" : colors.textDark,
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: "500",
          transition: "all 0.3s ease",
        }}
      >
        {isAutoRotating ? "⏸️ Pause" : "▶️ Auto"}
      </button>

      {/* Next Button */}
      <button
        onClick={() =>
          setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
        }
        disabled={currentPage === totalPages - 1}
        style={{
          padding: "8px 12px",
          backgroundColor:
            currentPage === totalPages - 1 ? colors.secondary : colors.primary,
          color: currentPage === totalPages - 1 ? colors.textLight : "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer",
          fontSize: "0.9rem",
          fontWeight: "500",
          transition: "all 0.3s ease",
        }}
      >
        Next →
      </button>
    </div>
  );

  // Page indicators
  const PageIndicators = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        marginTop: "10px",
      }}
    >
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index)}
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background:
              index === currentPage ? colors.primary : colors.secondary,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: index === currentPage ? "scale(1.2)" : "scale(1)",
          }}
          aria-label={`Go to page ${index + 1}`}
        />
      ))}
    </div>
  );

  if (metrics.length === 0) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          color: colors.textLight,
          backgroundColor: colors.background,
          borderRadius: "12px",
          border: `1px solid ${colors.secondary}`,
        }}
      >
        No metrics to display
      </div>
    );
  }

  return (
    <div
      className={`metrics-carousel ${className}`}
      style={{
        width: "100%",
        backgroundColor: colors.background,
        borderRadius: "12px",
        border: `1px solid ${colors.secondary}`,
        padding: "15px",
        ...style,
      }}
      onTouchStart={handleTouchStart}
    >
      {/* Main Content */}
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              display: layout === "grid" ? "grid" : "flex",
              gridTemplateColumns: `repeat(${Math.min(itemsPerPage, 4)}, 1fr)`,
              gap: "15px",
              padding: "10px",
            }}
          >
            {getCurrentPageMetrics().map(renderMetricItem)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {showNavigation && totalPages > 1 && <NavigationControls />}

        {/* Indicators */}
        {showIndicators && totalPages > 1 && <PageIndicators />}
      </div>
    </div>
  );
};

export default MetricsCarousel;
