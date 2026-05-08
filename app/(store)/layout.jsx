import { CartProvider } from "@/components/store/CartProvider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/store/Header";

export default function StoreLayout({ children }) {
  return (
    <CartProvider>
      <Toaster position="bottom-right" />
      <Header />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </CartProvider>
  );
}
