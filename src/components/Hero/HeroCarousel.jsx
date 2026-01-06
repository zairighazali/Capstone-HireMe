import { Carousel } from "react-bootstrap";

export default function HeroCarousel() {
  return (
    <Carousel controls={false} indicators interval={4000}>
      <Carousel.Item>
        <img
          className="d-block w-100 vh-100 object-fit-cover"
          src="https://picsum.photos/1200/800?1"
          alt="slide 1"
        />
      </Carousel.Item>
    </Carousel>
  );
}
