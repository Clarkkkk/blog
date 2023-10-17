import type { Site, SocialObjects } from './types'

export const SITE: Site = {
    website: 'https://aaroon.me/blog/', // replace this with your deployed domain
    author: 'Aaron Zhou',
    desc: "Aaron's blog about frontend developer",
    title: "Aaron's Blog",
    ogImage: 'astropaper-og.jpg',
    lightAndDarkMode: true,
    postPerPage: 8
}

export const LOCALE = ['en-EN'] // set to [] to use the environment default

export const LOGO_IMAGE = {
    enable: true,
    svg: true,
    width: 216,
    height: 46
}

export const SOCIALS: SocialObjects = [
    {
        name: 'Github',
        href: 'https://github.com/Clarkkkk/blog',
        linkTitle: ` ${SITE.title} on Github`,
        active: true
    },
    {
        name: 'Mail',
        href: 'mailto:clark1729@outlook.com',
        linkTitle: `Send an email to ${SITE.title}`,
        active: true
    }
]
