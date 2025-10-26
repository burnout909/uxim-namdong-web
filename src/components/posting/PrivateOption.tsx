'use client';
import { useState } from "react";

export default function PrivateOption({
  isPrivate,
  setIsPrivate,
  password,
  setPassword,
}: any) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleBlur = () => {
    if (password && password.length < 4) {
      setErrorMessage("비밀번호는 4자리 이상이어야 합니다.");
    } else {
      setErrorMessage("");
    }
  };

  return (
    <div className="flex gap-5 mb-4">
      <div className="flex items-center gap-8 h-[48px]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 accent-blue-500"
          />
          <span className="text-gray-800 text-body-medium">나만보기</span>
        </label>
      </div>

      {isPrivate && (
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-body-medium font-semibold">비밀번호</h3>
            <p className="text-body-small text-gray-600">
              게시글 조회 시 필요
            </p>
          </div>
          <div className="flex gap-3 items-end">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handleBlur}
              autoComplete="new-password"
              className={`border rounded px-3 py-2 text-body-medium ${
                errorMessage ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errorMessage && (
              <p className="text-red-500 text-body-small">{errorMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
