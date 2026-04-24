import "./globals.css";

export const metadata = {
  title: "BFHL - Tree Processor",
  description: "SRM Full Stack Engineering Challenge",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
