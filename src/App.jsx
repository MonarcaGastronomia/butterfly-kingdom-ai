import { useRef, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import "./App.css";

export default function App() {
  const videoRef = useRef(null);

  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  // PEGA AQUÍ TU URL DE TEACHABLE MACHINE
  const URL = "https://teachablemachine.withgoogle.com/models/QHJ2G9dFV/";

  let model;

  // Cargar modelo
  const loadModel = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
  };

  // Abrir cámara
  const startCamera = async () => {
    try {
      setLoading(true);

      await loadModel();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      setLoading(false);

      predictLoop();
    } catch (error) {
      console.error(error);
      alert(
        "No se pudo abrir la cámara. Revisa permisos del navegador."
      );
    }
  };

  // Predicción continua
  const predictLoop = async () => {
    if (!model || !videoRef.current) return;

    const predictionData = await model.predict(videoRef.current);

    let highestPrediction = predictionData[0];

    predictionData.forEach((p) => {
      if (p.probability > highestPrediction.probability) {
        highestPrediction = p;
      }
    });

    setPrediction(
      `${highestPrediction.className} (${(
        highestPrediction.probability * 100
      ).toFixed(1)}%)`
    );

    requestAnimationFrame(predictLoop);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🦋 Butterfly Kingdom AI</h1>

        <p className="subtitle">
          Detector inteligente con Teachable Machine
        </p>

        <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  width="400"
  height="300"
  style={{
    borderRadius: "16px",
    border: "3px solid white",
    marginBottom: "20px",
    background: "black",
  }}
/>

        <button onClick={startCamera} className="btn">
          {loading ? "Cargando..." : "Abrir Cámara"}
        </button>

        <div className="prediction">
          <h2>Predicción:</h2>
          <p>{prediction || "Esperando detección..."}</p>
        </div>
      </div>
    </div>
  );
}