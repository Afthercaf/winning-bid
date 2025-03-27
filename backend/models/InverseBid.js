// models/InverseBid.js
const mongoose = require('mongoose');

const inverseBidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InverseAuction',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  productOffered: {
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [String]
  },
  bidAmount: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: Number, // días para entrega
    required: true
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

inverseBidSchema.index({ auctionId: 1, bidAmount: 1 });

module.exports = mongoose.model('InverseBid', inverseBidSchema);