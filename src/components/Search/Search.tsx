import Fuse from 'fuse.js';
import { useState } from 'react';

const options = {
	keys: [
        { 
            name: 'data.title', 
            weight: 1
        },
        { 
            name: 'data.description', 
            weight: 0.75
        },
        { 
            name: 'body', 
            weight: 0.5
        },
    ],
	includeMatches: true,
	minMatchCharLength: 2,
	threshold: 0.5,
    includeScore: true,
};

export default function Search({ searchList }: { searchList?: any}) {
    // TODO: useRef() modal popup (to embed search in header)
    // TODO: Add type safety
    // TODO: search.json endpoint and separate search page (for share-ability)
    const [query, setQuery] = useState("");
    const fuse = new Fuse(searchList, options)

    console.log(searchList);
    console.log(query);

    const searchResult = fuse
		.search(query)
    const posts = searchResult.map((result) => result.item)
		.slice(0, 5);

    console.log(searchResult);

	function handleOnSearch({ target = {} }) {
		const { value } = target;
		setQuery(value);
	}

    return (
		<>
			<label>Search</label>
			<input type="text" value={query} onChange={handleOnSearch} placeholder="Search posts" />
			{query.length > 1 && (
				<p>
					Found {posts.length} {posts.length === 1 ? 'result' : 'results'} for '{query}'
				</p>
			)}
			<ul>
				{posts &&
					posts.map((post) => (
						<li>
							<a href={`/${post.slug}`}>{post.data.title}</a>
							{post.data.description}
						</li>
					))}
			</ul>
		</>
	);
}
