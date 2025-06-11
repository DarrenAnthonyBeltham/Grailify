import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('http://localhost:8080/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.text));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold">Welcome to My Awesome Website!</h1>
      <p className="mt-4 text-lg text-gray-400">
        {message}
      </p>
    </main>
  );
}