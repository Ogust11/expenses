// api/expenses.js

// ⚠️ WARNING: DATA IS NOT PERSISTENT. This array is reset when the serverless function spins down (cold start).
let expenses = [
  { id: 1, amount: 50.00, description: "Groceries", category: "Food", date: "2023-10-26" },
  { id: 2, amount: 15.50, description: "Movie ticket", category: "Entertainment", date: "2023-10-25" },
];

let nextId = 3;

// Helper function to validate POST request body
const validateExpense = (body) => {
  const { amount, description, category, date } = body;

  // 1. Check for missing fields
  if (amount === undefined || amount === null) return "Missing required field: amount";
  if (!description) return "Missing required field: description";
  if (!category) return "Missing required field: category";
  if (!date) return "Missing required field: date";

  // 2. Check amount type and value
  const numericAmount = parseFloat(amount);
  if (typeof numericAmount !== 'number' || isNaN(numericAmount) || numericAmount <= 0) {
    return "Amount must be a positive number";
  }

  // 3. Basic date format check (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date must be in YYYY-MM-DD format";
  }

  return null; // Validation passes
};

/**
 * Main handler function for the Vercel serverless endpoint.
 */
module.exports = async (request, response) => {
  try {
    // Vercel's Node.js runtime typically provides the parsed body in request.body
    const body = request.body || {};

    switch (request.method) {
      case 'GET':
        // 💰 GET: Give all the expenses in a single memory array
        response.status(200).json(expenses);
        break;

      case 'POST':
        // ➕ POST: Add a new expense
        const validationError = validateExpense(body);

        if (validationError) {
          // Handle Validation Errors
          response.status(400).json({ error: validationError });
          return;
        }

        // Add ID and push to the array
        const expenseToSave = {
          id: nextId++,
          amount: parseFloat(body.amount), // Final numerical conversion
          description: body.description,
          category: body.category,
          date: body.date,
        };

        expenses.push(expenseToSave);

        // Respond with the newly created expense (Status 201 Created)
        response.status(201).json(expenseToSave);
        break;

      default:
        // Handle other HTTP methods
        response.setHeader('Allow', ['GET', 'POST']);
        response.status(405).json({ error: `Method ${request.method} Not Allowed` });
        break;
    }
  } catch (error) {
    // Catch any unexpected server errors
    console.error("Serverless function error:", error);
    response.status(500).json({ error: "Internal Server Error" });
  }
};
