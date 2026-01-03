import './globals.css';

// ১. মেটাডাটা (Metadata) - শুধু টাইটেল, ডেসক্রিপশন, আইকন এখানে থাকবে
export const metadata = {
  title: "ICT Reunion | Kit Manager",
  description: "Efficiently manage and track the distribution of reunion kits, gifts, and food items for ICT Dept students.",
  manifest: "/manifest.json",
};

// ২. ভিউপোর্ট (Viewport) - কালার এবং স্কেলিং আলাদা ভেরিয়েবলে থাকবে
export const viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}




