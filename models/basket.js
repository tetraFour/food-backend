var mongoose = require("mongoose");

var basketSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  orderTime: {
    type: mongoose.Schema.Types.Date,
  },
});

var Basket = mongoose.model("Basket", basketSchema);

module.exports = Basket;
