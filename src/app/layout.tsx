import "./globals.css";
import Header from "@/components/Header";
import Aside from "@/components/Aside";
import { ShiftProvider } from "@/context/ShiftContext";

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
        <ShiftProvider>
          <Header />
          <div className="flex flex-1 h-full">
            <Aside />
            <div className="flex-1 overflow-auto p-2">{children}</div>
          </div>
        </ShiftProvider>
      </body>
    </html>
  );
}
