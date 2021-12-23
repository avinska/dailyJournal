const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const _ = require("lodash")

main().catch(err => console.log(err))

async function main() {
    await mongoose.connect('mongodb://localhost:27017/journalDB')
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"))

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true }
})

const Blog = mongoose.model('Blog', blogSchema)

app.get("/", (req, res) => {
    res.render("intro")
})

app.get("/posts", async (req, res) => {
    const posts = await Blog.find({})
    if (posts.length === 0) {
        const post = new Blog({
            title: "Home",
            body: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing."
        })
        post.save()
            .then((data) => console.log('saved'))
            .catch(err => console.log(err.errors))
        res.redirect("/")
    } else {
        res.render("home", { posts })
    }
})

app.get("/compose", function(req, res) {
    res.render("compose");
})

app.post("/compose", async (req, res) => {
    const newPost = new Blog({
        title: req.body.postTitle,
        body: req.body.postBody,
    })
    newPost.save()
    res.redirect("/posts")
})

app.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params
    const foundPost = await Blog.findById(`${postId}`)
    console.log(foundPost)
    res.render("post", { foundPost })
})

app.get("/posts/:postId/edit", async (req, res) => {
    const { postId } = req.params
    const foundPost = await Blog.findById(`${postId}`)
    res.render("edit", { foundPost })
})

app.patch("/posts/:postId", async (req, res) => {
    const { postId } = req.params
    const editedPost = req.body.editBody
    const updatedPost = await Blog.findOneAndUpdate({ _id: postId }, { body: editedPost })
    console.log(updatedPost)
    res.redirect(`/posts/${updatedPost._id}`)
})

app.get("/:page", async (req, res) => {
    const requestedPage = _.capitalize(req.params.page)
    res.render(`${requestedPage}`, { requestedPage })
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});