import { Suspense } from "react";
import { LoginClient } from "./Login-client";

export default function Page() {
    return (
        <Suspense fallback={null}>
            <LoginClient />
        </Suspense>
    );
}
