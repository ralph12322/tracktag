'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');

    // Trim inputs
    const trimmedTo = to.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedTo)) {
      setStatus('Invalid recipient email.');
      return;
    }

    if (!trimmedSubject || !trimmedMessage) {
      setStatus('Subject and message cannot be empty.');
      return;
    }

    try {
        console.log('Sending email to:', trimmedTo);
        console.log('Email subject:', trimmedSubject);
        console.log('Email message:', trimmedMessage);
      const res = await fetch('/api/test/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: trimmedTo,
          subject: trimmedSubject,
          text: trimmedMessage,
        }),
      });

      // Handle non-JSON responses safely
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (res.ok) {
        setStatus('Email sent successfully!');
        setTo('');
        setSubject('');
        setMessage('');
      } else {
        setStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setStatus(`Error: ${err.message || err}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-100">
      <form
        onSubmit={handleSend}
        className="bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">Test Gmail Sender</h2>

        <input
          type="email"
          placeholder="Recipient email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="bg-gray-700 border border-gray-600 p-2 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Send Email
        </button>

        {status && <p className="text-center mt-2 text-gray-300">{status}</p>}
      </form>
    </div>
  );
}
