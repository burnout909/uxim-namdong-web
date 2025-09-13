'use client'
export default function GlobalError({ error }: { error: Error }) {
    return (
        <html>
            <body>
                <h1>{error.message} </h1>
            </body>
        </html>
    );
}
