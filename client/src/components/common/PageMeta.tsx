import { Helmet, HelmetProvider } from 'react-helmet-async';


const PageMeta = ({
    title,
    description
}: { title: string, description: string }) => {
    return (
        <Helmet>
            <title>TMS | {title}</title>
            <meta name="description" content={description} />
        </Helmet>
    )
}

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
    return <HelmetProvider>{children}</HelmetProvider>
}

export default PageMeta
