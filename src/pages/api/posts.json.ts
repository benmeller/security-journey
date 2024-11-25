import { getCollection } from 'astro:content';
import removeMarkdown from 'remove-markdown';

export async function GET() {
    // Fetch all Markdown content
    const posts = (await getCollection('blog')).filter(
        (post) => (post.data.draft?.valueOf() !== true)
    );

    // Map the content to a searchable format
    const searchablePosts = posts.map(post => ({
        title: post.data.title,
        description: post.data.description,
        content: removeMarkdown(post.body).replaceAll('\n', '  '),
        slug: `blog/${post.slug}`
    }));

    return new Response (
        JSON.stringify(searchablePosts),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}