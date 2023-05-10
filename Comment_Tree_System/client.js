/**
 * @Author Arihant Jain | Software developer
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Comment({ comment }) {
    return (
        <div style={{ marginLeft: '20px' }}>
            <div>{comment.text}</div>
            <div>
                {comment.replies.map(reply => <Comment key={reply._id} comment={reply} />)}
            </div>
        </div>
    );
}

function App() {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            const res = await axios.get('http://localhost:3001/comments/:postId');
            setComments(res.data);
        };

        fetchComments();
    }, []);

    return (
        <div className="App">
            {comments.map(comment => <Comment key={comment._id} comment={comment} />)}
        </div>
    );
}

export default App;

