import type { FuseResultMatch } from 'fuse.js';
import styles from './searchResult.module.css';

interface Item {
    title: string,
    description: string,
    content: string,
    slug: string
}

interface SearchResult {
    item: Item,
    matches: readonly FuseResultMatch[] | undefined
}

export default function SearchResult({ item, matches }: SearchResult) {
    return (
        <li className={`${styles.searchResultItem}`}>
            <a className={`${styles.searchResultLink}`} href={`${item.slug}`}>
                <div className={`${styles.resultContent}`}>
                    <span className={`${styles.resultTitle}`}>
                        {item.title}
                    </span>
                    <span className={`${styles.resultDetails}`}>
                        {item.description}
                    </span>
                </div>
            </a>
        </li>
    )
}