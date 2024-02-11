import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });

    let prediction = await response.json();

    if (response.status !== 201) {
      setError(prediction.detail);
      setLoading(false);
      return;
    }

    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();

      if (response.status !== 200) {
        setError(prediction.detail);
        setLoading(false);
        return;
      }

      setPrediction(prediction);
    }

    setLoading(false);
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <Head>
        <title>Teda.ai</title>
      </Head>

      <h1 className="py-6 text- font-bold text-2xl">Teda.ai</h1>
      <link rel="icon" href="logo (1).png" type="image/x-icon"></link>
      
      <form className="w-full flex" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow border border-gray-300 rounded-md px-4 py-2 mr-2 focus:outline-none focus:border-blue-500"
          name="prompt"
          placeholder="Enter a prompt to display an image"
        />
        <button
          className="button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Go!"}
        </button>
      </form>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {prediction && (
        <>
          {prediction.output && (
            <div className="image-wrapper mt-5">
              <Image
                fill
                src={prediction.output[prediction.output.length - 1]}
                alt="output"
                sizes="100vw"
              />
            </div>
          )}
          <p className="py-3 text-sm opacity-50">Status: {prediction.status}</p>
          {prediction.status === "succeeded" && (
            <p className="text-green-500">Prediction successful!</p>
          )}
        </>
      )}
    </div>
  );
}
