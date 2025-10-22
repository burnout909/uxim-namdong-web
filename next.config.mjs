import svgr from "next-svgr";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  svgr: {
    exportType: "default",
  },
};

export default svgr(nextConfig);
