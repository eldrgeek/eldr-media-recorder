import defer from "./defer";
function getMediaRecorder(stream) {
  // var mediaSource = new MediaSource();
  // mediaSource.addEventListener("sourceopen", handleSourceOpen, false);
  // function handleSourceOpen(event) {
  //   console.log("MediaSource opened");
  //   let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  //   console.log("Source buffer: ", sourceBuffer);
  // }

  // console.log(location.host);
  // // window.isSecureContext could be used for Chrome
  // var isSecureOrigin =
  //   location.protocol === "https:" || location.host.includes("localhost");
  // if (!isSecureOrigin) {
  //   alert(
  //     "getUserMedia() must be run from a secure origin: HTTPS or localhost." +
  //       "\n\nChanging protocol to HTTPS"
  //   );
  //   location.protocol = "HTTPS";
  // }
  console.log("trying to get a stream");
  var options = {
    mimeType: "video/webm;codecs=vp9,opus",
    bitsPerSecond: 100000
  };
  let mediaRecorder = null;
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e0) {
    console.log(
      "Unable to create MediaRecorder with options Object: ",
      options,
      e0
    );
    try {
      options = { mimeType: "video/webm;codecs=vp8", bitsPerSecond: 100000 };
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e1) {
      console.log(
        "Unable to create MediaRecorder with options Object: ",
        options,
        e1
      );
      try {
        options = "video/mp4";
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e2) {
        alert("MediaRecorder is not supported by this browser.");
        console.error("Exception while creating MediaRecorder:", e2);
        return;
      }
    }
  }
  console.log("Created MediaRecorder", mediaRecorder, "with options", options);
  return mediaRecorder;
}

var video3 = document.querySelector("#video3");
const mediaSource3 = new MediaSource();

const read3 = (stream) => {
  video3.src = window.URL.createObjectURL(mediaSource3);
  const recorder = getMediaRecorder(stream);
  mediaSource3.onsourceopen = async function () {
    console.log("Added source buffer", mediaSource3.sourceBuffers.length);
    let sourceBuffer3 = mediaSource3.addSourceBuffer(
      "video/webm; codecs=opus,vp9"
      // "video/webm;codecs='vp9,opus'"
    ); //
    let deferred = null;
    //called when the filereader has laoded
    //Called when the next chnuk is added to the source buffer
    recorder.onstop = async () => {
      mediaSource3.onsourceopen = () => {};
      await deferred.promise;
      console.log("recorder stop");
      mediaSource3.endOfStream();
    };
    recorder.ondataavailable = async (e) => {
      deferred = defer();
      let buffer = await e.data.arrayBuffer();
      sourceBuffer3.appendBuffer(new Uint8Array(buffer));
      await deferred.promise;
      // if(block <= N_BLOCKS) recorder.resume()
    };
    sourceBuffer3.onupdateend = () => {
      deferred.resolve();
    };
    // fillBuffer(sourceBuffer3, mediaSource3)
    if (stream.getTracks().length !== 0) {
      recorder.start(200);
    } else {
      stream.onaddtrack = () => {
        recorder.start(200);
        stream.onaddtrack = () => {};
      };
    }
  };
};
export default read3;
