import { slugifyStr } from '@utils/slugify'
import type { CollectionEntry } from 'astro:content'
import { useEffect, useState } from 'react'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import Datetime from './Datetime'

export interface Props {
    href?: string
    frontmatter: CollectionEntry<'blog'>['data']
    body: CollectionEntry<'blog'>['body']
    secHeading?: boolean
}

export default function Card({ href, frontmatter, secHeading = true, body }: Props) {
    const [bodyText, setBodyText] = useState('')
    const { title, pubDatetime } = frontmatter

    const headerProps = {
        style: { viewTransitionName: slugifyStr(title) },
        className: 'text-lg font-medium decoration-dashed hover:underline'
    }

    useEffect(() => {
        unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeStringify)
            .process(body.slice(0, 120) + '...')
            .then((file) => {
                setBodyText(String(file))
            })
    }, [])

    return (
        <li className="mb-12">
            <a
                href={href}
                className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
            >
                {secHeading ? <h2 {...headerProps}>{title}</h2> : <h3 {...headerProps}>{title}</h3>}
            </a>
            <Datetime datetime={pubDatetime} />
            <p
                className="mt-2 max-w-3xl text-sm"
                dangerouslySetInnerHTML={{ __html: bodyText }}
            />
        </li>
    )
}
