const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  cost: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  createdAt: {type: Date,default: Date.now,},
});

const BookModel = mongoose.model("book", bookSchema);

module.exports = BookModel;
