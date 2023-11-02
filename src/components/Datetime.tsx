import { LOCALE } from '@config'

export interface Props {
    datetime: string | Date
    size?: 'sm' | 'lg'
    className?: string
}

const FormattedDatetime = ({ datetime }: { datetime: string | Date }) => {
    const myDatetime = new Date(datetime)

    const date = myDatetime.toLocaleDateString(LOCALE, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Shanghai'
    })

    const time = myDatetime.toLocaleTimeString(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Shanghai'
    })

    return (
        <>
            {date}
            <span
                className="mx-2 text-xs"
                aria-hidden="true"
            >
                |
            </span>
            <span className="sr-only">&nbsp;at&nbsp;</span>
            {time}
        </>
    )
}

export default function Datetime({ datetime, size = 'sm', className }: Props) {
    return (
        <div className={`my-1 flex items-center opacity-80 ${className}`}>
            <span className="sr-only">Posted on:</span>
            <span className={`flex items-center italic ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                <FormattedDatetime datetime={datetime} />
            </span>
        </div>
    )
}
