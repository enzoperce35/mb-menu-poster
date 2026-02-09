import axios from "axios";

const API_BASE = "http://localhost:3000/api/v1"; // your Rails dev URL

export const fetchProducts = async (shopId) => {
  const res = await axios.get(`${API_BASE}/products`, {
    params: { shop_id: shopId }
  });
  return res.data;
};
