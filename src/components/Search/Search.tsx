import Fuse from 'fuse.js';
import { useState, useEffect, useRef } from 'react';

// TODO: Show matched portions of content instead of page description
// TODO: Add type safety
// TODO: Separate search page (for share-ability)

const options = {
	keys: ['title', 'description', 'content'],
	ignoreLocation: true,
	includeMatches: true,
	includeScore: true,
	minMatchCharLength: 2,
	threshold: 0.2,
};

export default function Search({ searchList }: { searchList?: any}) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [fuse, setFuse] = useState(null);
	const searchRef = useRef<HTMLDialogElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Fetch the JSON data
		fetch('/api/posts.json')
			.then(res => res.json())
			.then(data => { 
				setFuse(new Fuse(data, options)); 
				console.log('all data');
				console.log(data);
			})
	}, []);

	useEffect(() => {
		// Open/close search dialog
		const searchDialog = searchRef.current;
		if (!searchDialog) {
			return;
		}

		if (isOpen) {
			searchDialog.showModal();
		} else {
			searchDialog.close();
		}
	}, [isOpen]);

	function handleOnSearch({ target = {} }) {
		const { value } = target;
		setQuery(value);
		if (fuse) {
			const searchResults = fuse.search(value);
			setResults(searchResults.map(result => result.item));
			console.log('results');
			console.log(searchResults);
		}
	}

	const handleCloseModal = () => {
		if (onclose) {
		  	onclose();
		}
		setIsOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		if (event.key === "Escape") {
		  	handleCloseModal();
		}
	};

	// TODO: handle outside click
	// TODO: add close button to modal
	// TODO: add styling
	// TODO: Darken background

    return (
		<>
			<div>
				<button onClick={() => setIsOpen(true)}>Click me for search</button>
			</div>
			<dialog ref={searchRef} onKeyDown={handleKeyDown}>
				<label>Search</label>
				<input 
					type="text" 
					value={query} 
					onChange={handleOnSearch} 
					placeholder="Search posts" 
				/>
				{query.length > 1 && (
					<p>
						Found {results.length} {results.length === 1 ? 'result' : 'results'} for '{query}'
					</p>
				)}
				<ul>
					{results &&
						results.map((item) => (
							<li>
								<a href={`/${item.slug}`}>{item.title}</a>
								{item.description}
							</li>
						))}
				</ul>
			</dialog>
		</>
	);
}
