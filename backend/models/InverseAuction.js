const mongoose = require("mongoose");

const inverseAuctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  desiredPrice: {
    type: Number,
    required: true,
  },
  images: [String], // URLs de las imágenes de referencia
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "expired"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  currentLowestBid: {
    type: Number,
  },
  bids: [
    {
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      sellerName: String,
      bidAmount: Number,
      productOffered: {
        name: String,
        description: String,
        images: [String],
      },
      bidTime: {
        type: Date,
        default: Date.now,
      },
      isAccepted: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("InverseAuction", inverseAuctionSchema);