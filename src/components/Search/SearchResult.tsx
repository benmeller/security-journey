import styles from './searchResult.module.css';

interface Item {
    title: string,
    description: string,
    content: string,
    slug: string
}

interface SearchResult {
    item: Item,
    matches: []
}


export default function SearchResult({ result }: SearchResult) {
    const { item, matches } = result
    console.log(result);
    return (
        <li className={`${styles.searchResultItem}`}>
            <a className={`${styles.searchResultLink}`} href={`/${item.slug}`}>
                <div className={`${styles.resultContent}`}>
                    <span className='resultTitle'>
                        {item.title}
                    </span>
                    <span className='resultDetails'>
                        {item.description}
                    </span>
                </div>
            </a>
        </li>
    )
}