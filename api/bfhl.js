const { processBFHL } = require("../backend/processor");

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      res.status(400).json({ error: "data must be an array" });
      return;
    }

    const result = processBFHL(data);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
