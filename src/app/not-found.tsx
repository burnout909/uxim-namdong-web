'use client';

import { useSearchParams } from 'next/navigation';

export default function NotFound() {
    const searchParams = useSearchParams();
    const errorParam = searchParams.get('error');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">

            {errorParam ? <p className="mt-4 text-red-600">
                오류 코드: {errorParam}
            </p> :
                <>
                    <h1 className="text-2xl font-bold">404 – 페이지를 찾을 수 없습니다.</h1><p className="mt-2 text-gray-600">
                        요청하신 페이지가 존재하지 않거나 주소가 잘못되었습니다.
                    </p>
                </>
            }
        </div>
    );
}
