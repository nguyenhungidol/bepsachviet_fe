import React, { useState } from "react";
import { Carousel } from "react-bootstrap";
import "./Banner.css";

function Banner() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="banner-wrapper">
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        interval={4000}
        pause="hover"
      >
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/Banner-combo-vit-1400x526.jpg"
            alt="Slide 1"
          />
        </Carousel.Item>

        <Carousel.Item>
          <img className="d-block w-100" src="/3.png" alt="Slide 2" />
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="/123-456-7890-1-1400x526.png"
            alt="Slide 3"
          />
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default Banner;
