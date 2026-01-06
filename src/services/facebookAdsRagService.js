export const generateFacebookAds = async ({
  productId,
  productName,
  image,
}) => {
  const res = await fetch("http://localhost:8000/api/facebook-ads/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      product_name: productName,
      image,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Facebook Ads RAG API error");
  }

  const data = await res.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response structure");
  }

  return data;
};
