"use client";

import { useState } from "react";

export default function TestEmailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await fetch("/api/test/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("Email sent successfully!");
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Test Email</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Recipient Email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="border p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Send Email
        </button>
      </form>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}
