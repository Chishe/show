// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";
import Aside from "@/components/Aside";
import Article from "@/components/Article";

export const metadata = {
  title: "Command Desk",
  description: "Manage and monitor your machines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description} />
        <title>{metadata.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 h-full">
          <Aside />
          {/* <Article /> */}
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
