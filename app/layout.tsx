import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "FocusTube",
    description: "Created by AdixSasuke",
    generator: "theadityakhandelwal.in",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
