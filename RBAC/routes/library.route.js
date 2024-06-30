const express = require("express");
const BookModel = require("../models/library.model");
const isAuth = require("../middlewares/auth.middleware");
const bookRouter = express.Router();

bookRouter.post("/create", isAuth, async (req, res) => {
  const { title, cost, totalPages, userName, userId, role } = req.body;
  if (role.includes("CREATOR")) {
    const newBook = new BookModel({
      title,
      cost,
      totalPages,
      userId,
      userName,
    });
    await newBook.save();
    res.send("New Book created successfully.");
  } else {
    res.send("Your are not authorized to create a book.");
  }
});

bookRouter.get("/", async (req, res) => {
  try {
    const books = await BookModel.find();
    res.send(books);
  } catch (error) {
    console.log(error);
    res.send("You are not authorized.");
  }
});

bookRouter.get("/mybooks", isAuth, async (req, res) => {
  const { userId, role } = req.body;
  if (role.includes("VIEWER")) {
    try {
      const books = await BookModel.find({ userId });
      if (books.length > 0) return res.send(books);
      res.send("No books created by you yet.");
    } catch (error) {
      console.log(error);
      res.send("You are not authorized.");
    }
  } else {
    res.send("You are not authorized to view this content.");
  }
});

bookRouter.patch("/update/:bookId", isAuth, async (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body;
  const updatedBook = req.body;
  try {
    const book = await BookModel.findOne({ _id: bookId });
    if (book && book.userId == userId) {
      await BookModel.findByIdAndUpdate(
        { _id: bookId },
        { $set: { ...updatedBook } }
      );
      res.status(200).send("Book updation successfull.");
    } else if (!book) {
      res.status(404).send("Book not found.");
    } else {
      res.status(401).send("You are not authorized to update this book.");
    }
  } catch (error) {
    console.log(error);
    res.send("Book updation unsuccessful.");
  }
});

bookRouter.delete("/delete/:bookId", isAuth, async (req, res) => {
  const { bookId } = req.params;
  const { userId } = req.body;
  try {
    const book = await BookModel.findOne({ _id: bookId });
    if (book && book.userId == userId) {
      await BookModel.findByIdAndDelete({ _id: bookId });
      res.status(200).send("Book deletion successfull.");
    } else if (!book) {
      res.status(404).send("Book not found.");
    } else {
      res.status(401).send("You are not authorized to delete this book.");
    }
  } catch (error) {
    console.log(error);
    res.send("Book deletion unsuccessful.");
  }
});

bookRouter.get("/old", async (req, res) => {
  try {
    const tenMinutes = new Date(Date.now() - 10 * 60 * 1000);
    const books = await BookModel.find({ createdAt: { $lt: tenMinutes } });
    if (books.length > 0) return res.status(200).send(books);
    res.send("No books created before 10min.");
  } catch (error) {
    console.log(error);
    res.send("You are not authorized.");
  }
});

bookRouter.get("/new", async (req, res) => {
  try {
    const tenMinutes = new Date(Date.now() - 10 * 60 * 1000);
    const books = await BookModel.find({ createdAt: { $gt: tenMinutes } });
    if (books.length > 0) return res.status(200).send(books);
    res.send("No books created after 10min.");
  } catch (error) {
    console.log(error);
    res.send("You are not authorized.");
  }
});

module.exports = bookRouter;
