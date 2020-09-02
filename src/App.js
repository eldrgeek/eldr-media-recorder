import React from "react";
import "./styles.css";
import StreamRecorder from "./StreamRecorder.";
import getCameraStream from "./getCameraStream";

import Inout from "./Inout";
export default function App() {
  const gumVideo = React.useRef(null);
  const [cameraStream, setCameraStream] = React.useState(null);
  const [error, setError] = React.useState("");
  const [source, setSource] = React.useState("none");
  React.useEffect(() => {
    if (gumVideo && gumVideo.current && cameraStream) {
      // console.log("getUserMedia() got stream:", cameraStream);
      gumVideo.current.srcObject = cameraStream;
    }
    // if (cameraStream) Inout(cameraStream);
  }, [gumVideo, cameraStream]);

  const startCamera = async () => {
    if (cameraStream) {
      console.log("clear Stream");
      cameraStream.getTracks().forEach(function (track) {
        track.stop();
      });
      setCameraStream(null);
      gumVideo.current.srcObject = null;
      setSource("none");
      setError("");
      return;
    }

    try {
      let newStream = null;
      // newStream = await getCameraStream();
      newStream = await getCameraStream();
      //   {
      //   audio: true,
      //   // video: true

      // }
      setCameraStream(newStream);
      setSource("stream");
    } catch (e) {
      console.error("navigator.getUserMedia error:", e);
      setError(`navigator.getUserMedia error:${e.toString()}`);
    }
  };

  return (
    <div id="container">
      <h1>
        <a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">
          WebRTC samples
        </a>
        <span>MediaRecorder</span>
      </h1>

      <p>
        For more information see the MediaStream Recording API{" "}
        <a
          href="http://w3c.github.io/mediacapture-record/MediaRecorder.html"
          title="W3C MediaStream Recording API Editor's Draft"
        >
          Editor's&nbsp;Draft
        </a>
        .
      </p>

      <video
        className="w-1/3"
        height="100px"
        id="gum"
        ref={gumVideo}
        playsInline
        autoPlay
        muted
      ></video>
      <button
        className="bg-blue-400 m-4 p-2 border border-black border-size-2 border-rounded "
        id="start"
        onClick={startCamera}
      >
        Start camera
      </button>
      <button
        className="bg-blue-400 m-4 p-2 border border-black border-size-2 border-rounded "
        id="start"
        onClick={() => setSource("desktop")}
      >
        Record Desktop
      </button>
      <StreamRecorder autoStart={true} stream={cameraStream} source={source} />
      {error}
      <a
        href="https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record"
        title="View source for this page on GitHub"
        id="viewSource"
      >
        View source on GitHub
      </a>
    </div>
  );
}
