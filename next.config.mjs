import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // ডেভেলপমেন্ট মোডে PWA বন্ধ থাকবে
  // register: true,
  // skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);