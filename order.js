const orderSchema = {
    type: "object",
    properties: {
      customerName: { type: "string" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            productId: { type: "number" },
            quantity: { type: "number" },
          },
          required: ["productId", "quantity"],
        },
      },
    },
    required: ["customerName", "items"],
  };
  
  const Ajv = require("ajv");
  const ajv = new Ajv();
  
  app.post("/orders", async (req, res) => {
    const validate = ajv.compile(orderSchema);
    const valid = validate(req.body);
  
    if (!valid) {
      res.status(400).json(validate.errors);
    } else {
      const newOrder = req.body;
      // Check if the 'orders' key exists
      const ordersExist = await redisClient.exists("orders");
      if (ordersExist.arrLen == null) {
        newOrder.id = 1;
      } else {
        // If it doesn't exist, set the id to 1
        newOrder.id = parseInt(await redisClient.json.arrLen("orders", "$")) + 1;
      }
      await redisClient.json.arrAppend("orders", "$", newOrder);
      res.json(newOrder);
    }
  });
  
  app.get("/orders", async (req, res) => {
    let orders = await redisClient.json.get("orders", { path: "$" });
    res.json(orders[0]);
  });

  const addOrder = async ({ redisClient, order }) => {
    try {
        // Validate that required fields are present
        if (!order.quantity) { // Could add this validation !order.orderId  !order.orderItem  !order.productId ||
            throw new Error('Invalid order data. Please provide orderId, orderItemId, productId, and quantity.');
        }

        // Create an order key using the orderId
        const orderKey = order:${order.orderId};

        // Check if the order already exists in the database
        const existingOrder = await redisClient.json.get(orderKey);

        if (existingOrder !== null) {
            throw new Error(`Order ${orderKey} already exists`);
        }

        // Create the order data in Redis
        await redisClient.json.set(orderKey, '$', order);

        // Return success message
        return { message: 'Order added successfully' };
    } catch (error) {
        // Handle errors
        throw error;
    }
};

module.exports = { addOrder };