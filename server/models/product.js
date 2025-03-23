const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  imageUrl: String,
  category: String,
  description: String,
  highestBid: { type: Number, default: 0 },
  bids: [
    {
      bidderName: String,
      bidAmount: Number,
      time: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Product", ProductSchema);
