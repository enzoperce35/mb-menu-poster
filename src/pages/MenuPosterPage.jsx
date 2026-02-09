import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products";
import PosterTypeCarousel from "../components/PosterTypeCarousel";

export default function MenuPosterPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading products...</p>;

  return (
    <div>
      <h1>MB Menu Poster</h1>
      <PosterTypeCarousel groups={products} />
    </div>
  );
}
