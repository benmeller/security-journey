import Fuse, { type FuseResult } from 'fuse.js';
import React, { useState, useEffect, useRef } from 'react';
import styles from './search.module.css'
import SearchResult from './SearchResult';

// TODO: Show matched portions of content instead of page description
// TODO: Add type safety
// TODO: Separate search page (for share-ability)

const options = {
	keys: ['title', 'description', 'content'],
	ignoreLocation: true,
	includeMatches: true,
	includeScore: true,
	minMatchCharLength: 2,
	shouldSort: true,
	threshold: 0.2,
	// useExtendedSearch: true, // This disrupts any queries with whitespace since whitespace acts as an AND operator
};

export default function Search({ searchList }: { searchList?: any}) {
	const [query, setQuery] = useState('');
	// TODO: Add type safety to SearchResults
	const [results, setResults] = useState<FuseResult<any>[]>([]);
	const [fuse, setFuse] = useState<Fuse<any> | null>(null);
	const searchRef = useRef<HTMLDialogElement | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	function handleOnSearch(event: React.ChangeEvent<HTMLInputElement>) {
		const { value } = event.target;
		setQuery(value);
		if (fuse) {
			const searchResults = fuse.search(value);
			setResults(searchResults);
		}
	}

	const handleCloseModal = () => {
		setIsOpen(false);
		document.body.classList.remove('modal-open');
	};

	const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		if (event.key === "Escape") {
		  	handleCloseModal();
		}
	};

	const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
		if (event.type === "click" && event.target === searchRef.current) {
			handleCloseModal();
		}
	}
	
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.metaKey && event.key.toLowerCase() === 'k') {
			setIsOpen(oldIsOpen => !oldIsOpen);
	  }
	}

	useEffect(() => {
		fetch('api/posts.json')
			.then(res => res.json())
			.then(data => { 
				setFuse(new Fuse(data, options)); 
			})
	}, []);

	// Open/close search dialog
	useEffect(() => {
		const searchDialog = searchRef.current;
		if (!searchDialog) {
			return;
		}
		if (isOpen) {
			searchDialog.showModal();
			document.body.classList.add('modal-open');
		} else {
			searchDialog.close();
		}
	}, [isOpen]);

	// Listen for keyboard event to open/close search
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.addEventListener('keydown', handleKeyDown);
		}
	}, [])

	// TODO: add close button to modal

    return (
		<>
			<button onClick={() => setIsOpen(true)} style={{ border: 0, background: "none" }}>
				<svg 
					xmlns="http://www.w3.org/2000/svg" 
					width="32"
					style={{ fill: "var(--primary-text)" }}
					viewBox="0 0 256 256"
				>
					<path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
				</svg>
			</button>
			<dialog ref={searchRef} onKeyDown={handleDialogKeyDown} onClick={handleDialogClick} >
				<div className={`${styles.dialogContent}`}>
					{/* <label>Search</label> */}
					{/* TODO: Add search icon to left of search field */}
					{/* TODO: Add X to clear search query */}
					<div className={`${styles.searchInputContainer}`}>
						<input 
							type="text" 
							value={query} 
							onChange={handleOnSearch} 
							placeholder="Search posts" 
							className={`${styles.searchInput}`}
							aria-label='Search input'
						/>
					</div>
					{query.length >= 1 && (
						<p className={`${styles.searchResultsCount}`}>
							Found {results.length} {results.length === 1 ? 'result' : 'results'} for '{query}'
						</p>
					)}
					{results.length >= 1 && (
						<div className={`${styles.searchResultsContainer}`}>
							<ul className={`${styles.searchResultsList}`}>
								{results &&
									results.map((result) => (
										<SearchResult query={query} item={result.item} matches={result.matches} />
									))}
							</ul>
						</div>
					)}
				</div>
			</dialog>
		</>
	);
}
