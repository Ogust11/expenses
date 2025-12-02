// api/expenses.js

// In-memory data store. In a real app, this would be a database connection.
// An ID is added for better tracking, even in this simple example.
let expenses = [
  { id: 1, amount: 50.00, description: "Groceries", category: "Food", date: "2023-10-26" },
  { id: 2, amount: 15.50, description: "Movie ticket", category: "Entertainment", date: "2023-10-25" },
];

let nextId = 3;

// Helper function to validate POST request body
const validateExpense = (body) => {
  const { amount, description, category, date } = body;

  if (!amount) return "Missing required field: amount";
  if (!description) return "Missing required field: description";
  if (!category) return "Missing required field: category";
  if (!date) return "Missing required field: date";

  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return "Amount must be a positive number";
  }
  
  // Basic date format check (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Date must be in YYYY-MM-DD format";
  }

  return null; // Return null if validation passes
};

/**
 * Main handler function for the Vercel serverless endpoint.
 * @param {object} request - The incoming HTTP request object.
 * @param {object} response - The outgoing HTTP response object.
 */
module.exports = async (request, response) => {
  try {
    switch (request.method) {
      case 'GET':
        // 💰 GET: Give all the expenses in a single memory array
        response.status(200).json(expenses);
        break;

      case 'POST':
        // ➕ POST: Add a new expense
        const newExpense = request.body;
        const validationError = validateExpense(newExpense);

        if (validationError) {
          // Handle Missing Fields Error
          response.status(400).json({ error: validationError });
          return;
        }

        // Add ID and push to the array
        const expenseToSave = {
          id: nextId++,
          amount: parseFloat(newExpense.amount), // Ensure amount is treated as a number
          description: newExpense.description,
          category: newExpense.category,
          date: newExpense.date,
        };

        expenses.push(expenseToSave);

        // Respond with the newly created expense
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
