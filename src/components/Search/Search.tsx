import Fuse from 'fuse.js';
import { useState, useEffect, useRef } from 'react';
import Styles from './search.module.css'

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

	const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.type === "click" && event.target === searchRef.current) {
			handleCloseModal();
		}
	}

	// TODO: add close button to modal
	// TODO: add styling
	// TODO: Darken background

    return (
		<>
			<button onClick={() => setIsOpen(true)} style={{ border: 0, background: "none" }}>
				<svg 
					xmlns="http://www.w3.org/2000/svg" 
					width="32"
					style={{ fill: "rgb(var(--black))" }}
					viewBox="0 0 256 256"
				>
					<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
				</svg>
			</button>
			<dialog ref={searchRef} onKeyDown={handleKeyDown} onClick={handleDialogClick}
			>
				<div>
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
				</div>
			</dialog>
		</>
	);
}
