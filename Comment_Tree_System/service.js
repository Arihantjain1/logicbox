/**
 * @Author Arihant Jain | Software developer
 * @Description Designing a comment tree system for a post in MongoDB involves a trade-off between read and write performance, and between data duplication and complexity. Here's a potential schema and strategy that you could consider. It's based on the idea of using the materialized paths pattern
 */

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const uri = "mongodb+srv://<username>:<password>@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);

app.post('/comments', async (req, res) => {
    try {
        await client.connect();
        const comments = client.db('blog').collection('comments');
        const { text, userId, postId, parentId } = req.body;
        let path = '';

        if (parentId) {
            const parentComment = await comments.findOne({ _id: ObjectId(parentId) });
            path = parentComment.path ? `${parentComment.path}${parentId}#` : `#${parentId}#`;
        }

        const newComment = {
            text,
            userId: ObjectId(userId),
            postId: ObjectId(postId),
            path,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await comments.insertOne(newComment);
        res.status(201).send(result.ops[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get('/comments/:postId', async (req, res) => {
    try {
        await client.connect();
        const comments = client.db('blog').collection('comments');
        const postId = req.params.postId;
        const postComments = await comments.find({ postId: ObjectId(postId) }).sort({ path: 1 }).toArray();

        // sort comments by the path length
        postComments.sort((a, b) => (a.path.length - b.path.length));

        const commentTree = [];
        const commentMap = {};

        for (const comment of postComments) {
            comment.replies = []; // Initialize the replies array
            const commentIdStr = comment._id.toString(); // Convert ObjectId to string

            commentMap[commentIdStr] = comment; // Add the comment to the map immediately after processing

            if (comment.path) {
                const parentCommentIdStr = comment.path.split('#').filter(Boolean).pop();
                if (commentMap[parentCommentIdStr]) {
                    commentMap[parentCommentIdStr].replies.push(comment);
                }
            } else {
                commentTree.push(comment);
            }
        }

        res.send(commentTree);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(3001, () => console.log('Server is running on port 3001'));
