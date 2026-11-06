import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export default function CameraView({ onLandmarks }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const callbackRef = useRef(onLandmarks);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [message, setMessage] = useState("Loading hand model...");
  const [handFound, setHandFound] = useState(false);

  useEffect(() => { callbackRef.current = onLandmarks; }, [onLandmarks]);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let stream = null;
    let landmarker = null;
    let lastFound = false;

    async function start() {
      try {
        const vision = await FilesetResolver.forVisionTasks("/wasm");
        const options = (delegate) => ({
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate },
          runningMode: "VIDEO",
          numHands: 1,
        });
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, options("GPU"));
        } catch {
          landmarker = await HandLandmarker.createFromOptions(vision, options("CPU"));
        }
        if (stopped) { landmarker.close(); return; }

        setMessage("Starting camera...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setStatus("ready");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const drawing = new DrawingUtils(ctx);
        let lastTime = -1;

        const loop = () => {
          if (stopped) return;
          if (video.readyState >= 2 && video.currentTime !== lastTime) {
            lastTime = video.currentTime;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const result = landmarker.detectForVideo(video, performance.now());
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const found = result.landmarks.length > 0;
            if (found) {
              const lm = result.landmarks[0];
              drawing.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: "#00e0a4", lineWidth: 4 });
              drawing.drawLandmarks(lm, { color: "#ff5d7a", radius: 4 });
              callbackRef.current?.(lm);
            } else {
              callbackRef.current?.(null);
            }
            if (found !== lastFound) { lastFound = found; setHandFound(found); }
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(
          err?.name === "NotAllowedError"
            ? "Camera access was blocked. Please allow the camera in your browser settings and reload."
            : err?.name === "NotFoundError"
            ? "No camera was found on this device."
            : "Something went wrong starting the camera or hand model."
        );
      }
    }

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, []);

  return (
    <div className="camera-wrap">
      <video ref={videoRef} playsInline muted className="camera-video" />
      <canvas ref={canvasRef} className="camera-canvas" />
      {status !== "ready" && (
        <div className={`camera-overlay ${status}`} role="status" aria-live="polite">
          {message}
        </div>
      )}
      {status === "ready" && (
        <div className={`camera-badge ${handFound ? "on" : ""}`} role="status" aria-live="polite">
          {handFound ? "✋ Hand detected" : "Show your hand"}
        </div>
      )}
    </div>
  );
}