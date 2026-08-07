import client from "./client";

export const createFeedbackCard = async (payload) => {
  const { data } = await client.post("/feedback_cards", payload);
  return data;
};
