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
        <li>
            <a href={`/${item.slug}`}>{item.title}</a>
            {item.description}
        </li>
    )
}