import type { FuseResultMatch } from 'fuse.js';
import styles from './searchResult.module.css';
import DOMPurify from 'dompurify';


interface Item {
    title: string,
    description: string,
    content: string,
    slug: string
}

interface SearchResult {
    query: string,
    item: Item,
    matches: readonly FuseResultMatch[] | undefined
}

const CONTEXTRADIUS = 30;
const MAXSNIPPETLENGTH = 500;
const MINIMUMMATCHTHRESHOLD = 0.7;

export default function SearchResult({ query, item, matches }: SearchResult) {
    function generateSnippet(query:string, item: Item, matches: readonly FuseResultMatch[] | undefined) {
        // If there are no content matches, return the full description
        if (matches === undefined || !matches.some(match => match.key === 'content')) {
            return item.description;
        }

        const minMatchLength = Math.floor(query.length * MINIMUMMATCHTHRESHOLD);
        console.log(minMatchLength);

        var content = item.content;
        var snippet = '';
        var contentMatches = matches.filter(match => match.key === 'content');

        contentMatches.forEach(match => {
            const { indices } = match;
            const filteredIndices = indices.filter(([start, end]) => (end - start + 1) >= minMatchLength)
                .slice(0, 3);

            console.log(filteredIndices);
            filteredIndices.forEach(([start, end]: [number, number]) => {
                const startContext = Math.max(start - CONTEXTRADIUS, 0);
                const endContext = Math.min(end + CONTEXTRADIUS, content.length);
                
                const beforeMatch = content.slice(startContext, start);
                const matchText = content.slice(start, end + 1);
                const afterMatch = content.slice(end + 1, endContext);

                snippet += `${beforeMatch.trimStart()}<mark>${matchText}</mark>${afterMatch.trimEnd()}... `;
            });
        });

        return snippet.slice(0, MAXSNIPPETLENGTH);
    }

    const sanitizedSnippet = DOMPurify.sanitize(generateSnippet(query, item, matches));

    return (
        <li className={`${styles.searchResultItem}`}>
            <a className={`${styles.searchResultLink}`} href={`${item.slug}`}>
                <div className={`${styles.resultContent}`}>
                    <span className={`${styles.resultTitle}`}>
                        {item.title}
                    </span>
                    <span className={`${styles.resultDetails}`}
                        dangerouslySetInnerHTML={{ __html: sanitizedSnippet }}
                    />
                </div>
            </a>
        </li>
    )
}