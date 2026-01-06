export const generateMarketingPlanByRAG = async (productName) => {
  const res = await fetch("http://localhost:4000/generate-marketing-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_name: productName,
      top_k: 4,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`RAG API error: ${errorData.message || "Unknown error"}`);
  }

  const responseData = await res.json();
  if (!responseData || typeof responseData !== "object") {
    throw new Error("Invalid response structure");
  }

  return responseData;
};
