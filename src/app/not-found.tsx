import { Suspense } from "react";
import NotFoundClient from "./components/404/NotFoundClient";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <NotFoundClient />
        </Suspense>
    );
}
