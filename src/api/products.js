import client from "./client";

export const fetchProducts = async (shopId) => {
  const res = await client.get("/products", {
    params: { shop_id: shopId },
  });

  return res.data;
};
