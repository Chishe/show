// src/components/Head.tsx
import Head from 'next/head';

interface CustomHeadProps {
  title: string;
  description: string;
}

export default function CustomHead({ title, description }: CustomHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
