import React from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import getCameraStream from "./getCameraStream";
import Blobber from "./Blobber";
import Restreamer from "./Restreamer";
const StreamRecorder = ({ stream, autoStart, source, recordingComplete }) => {
  const [inputStream, setInputStream] = React.useState(null);
  const [playDisabled, setPlayDisabled] = React.useState(true);
  const [recordDisabled, setRecordDisabled] = React.useState(false);
  const [downloadDisabled, setDownloadDisabled] = React.useState(false);
  const recordedVideo = React.useRef(null);
  const [error, setError] = React.useState("");
  const [recordText, setRecordText] = React.useState("Start Recording");
  const [blobber, setBlobber] = React.useState(null);
  const [streamer, setStreamer] = React.useState(null);
  const [trial, setTrial] = React.useState(0);
  const [recordedBlobs, setRecordedBlobs] = React.useState([]);

  const createChain = () => {
    const configuration = {};
    configuration.audio = inputStream.getAudioTracks().length;
    configuration.video = inputStream.getVideoTracks().length;
    console.log(configuration);
    const blobber = new Blobber(inputStream);
    setBlobber(blobber);
    var video3 = document.querySelector("#video3");
    const streamer = new Restreamer(video3, configuration);
    blobber.onBlob((blob) => {
      // console.log("BLOB Callback",blob)
      streamer.addBlob(blob);
    });
    setStreamer(streamer);
    return blobber;
  };
  React.useEffect(() => {
    if (inputStream && autoStart) {
      console.log("Record is clicked", inputStream);
      clickRecord();
    }
    //eslint-disable-next-line
  }, [inputStream, autoStart]);
  React.useEffect(() => {
    if (source === "stream") {
      // console.log("Recording input", stream);
      setInputStream(stream);
      setRecordDisabled(false);
      // clickRecord();
    } else if (source === "camera") {
      // console.log("Getting camera");
      const getCamera = async () => {
        const constraints = {
          audio: true,
          //  {
          //   echoCancellation: {exact: hasEchoCancellation}
          // },video: {
          video: { width: { ideal: 4096 }, height: { ideal: 2160 } }
        };
        const stream = await getCameraStream(constraints);
        setInputStream(stream);
        setRecordDisabled(false);
      };
      getCamera();
    } else if (source === "desktop" && !recordDisabled) {
      const getDesktop = async () => {
        try {
          const constraints = { audio: true, video: true };
          const stream = await navigator.mediaDevices.getDisplayMedia(
            constraints
          );
          console.log("STream is ", stream);
          debugger;
          setInputStream(stream);
          setRecordDisabled(false);
        } catch (e) {
          console.error("navigator.getUserMedia error:", e);
          setError(`navigator.getUserMedia error:${e.toString()}`);
        }
      };
      console.log("Going to record the desktop");
      getDesktop();
    }
    //eslint-disable-next-line
  }, [source, stream, recordDisabled]);
  const clickRecord = (e) => {
    if (recordText === "Start Recording") {
      startRecording();
      setPlayDisabled(true);
      setDownloadDisabled(true);

      setRecordText("Stop Recording");
    } else {
      stopRecording();
      setRecordText("Start Recording");
      setPlayDisabled(false);
      setDownloadDisabled(false);
    }
  };

  const clickPlay = (e) => {
    const superBuffer = new Blob(recordedBlobs, { type: "video/webm" });
    recordedVideo.current.src = null;
    recordedVideo.current.srcObject = null;
    recordedVideo.current.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.current.controls = true;
    recordedVideo.current.play();
  };

  const clickDownload = (e) => {
    const blob = new Blob(recordedBlobs, { type: "video/webm" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "test.webm";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };
  function startRecording() {
    // console.log("Recording", inputStream);
    const INTERVAL = 60;
    console.clear();
    if (!inputStream) {
      alert("No input stream");
      return;
    }
    if (!blobber) {
      const blobber = createChain();
      blobber.start(INTERVAL);
    } else {
      streamer.start();
      blobber.start(INTERVAL);
    }

    setRecordText("Stop Recording");
    setPlayDisabled(true);
    setDownloadDisabled(true);
  }

  function stopRecording() {
    blobber.stop();
    streamer.stop();
    setRecordedBlobs(blobber.blobs);
    createChain();
    if (recordingComplete) recordingComplete();
    setRecordText("Record");
    setRecordDisabled(false);
  }
  return (
    <React.Fragment>
      <Grid
        className="border border-black p-6 m-12 bg-gray-100"
        // borderColor="gray.500"
        container
        direction="column"
        justify="center"
        spacing={2}
      >
        <Grid container justify="center">
          <video
            className="w-1/2"
            height="100px"
            id="recorded"
            ref={recordedVideo}
            playsInline
            controls
            // loop
          ></video>
        </Grid>
        <Grid container justify="center">
          <Button id="record" onClick={clickRecord} disabled={recordDisabled}>
            {recordText}
          </Button>
          <Button id="play" onClick={clickPlay} disabled={playDisabled}>
            Play
          </Button>
          <Button
            id="download"
            onClick={clickDownload}
            disabled={downloadDisabled}
          >
            Download
          </Button>
        </Grid>
        <Grid item>
          <span id="errorMsg">{error}</span>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
export default StreamRecorder;
