# Comment Tree System

Designing a comment tree system for a post in MongoDB involves a trade-off between read and write performance, and between data duplication and complexity. Here's a potential schema and strategy that you could consider. It's based on the idea of using the materialized paths pattern

## Schema

path is a string that contains the materialized path, which represents the comment's position in the comment hierarchy. Each comment ID in the path is separated by a character not allowed in ObjectIds, such as #. The path for a top-level comment might look like #60af5d6f30d6b6433886b2f6#, and the path for a reply to that comment might look like #60af5d6f30d6b6433886b2f6#60af5d6f30d6b6433886b2f7#.

## Client

the Comment component recursively renders itself for each reply. This allows the comment tree to be displayed in a nested way. The App component fetches the comments when it mounts and stores them in its state.

## Server

When you need to fetch the comments for a post, you can perform a single query, sort by the path field, and then build the tree in your application code. This query is very efficient, even for large comment trees.

When you need to add a comment, you fetch the parent comment, append the new comment's ID to the parent's path, and store the result in the new comment's path field. This operation is also quite efficient, but it does require two queries rather than one.

With this approach, you're trading some write performance and data duplication (each comment stores the IDs of all its ancestors) for excellent read performance and simplicity in your application code (building the tree from a sorted list of comments is straightforward). As with any database design, the best approach depends on your specific use case, including your read-to-write ratio and your performance requirements.