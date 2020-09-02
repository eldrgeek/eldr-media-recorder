const getCameraStream = async (constraints) => {
  // if (!constraints)
  constraints = {
    audio: true,
    video: true
    // video: {
    //   width: 160,
    //   height: 120,
    //   frameRate: 10
    // }
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  stream.getTracks().forEach((track) => {
    // const settings = track.getSettings();
    // console.log(settings);
    // const { height, width, frameRate } = settings;
    // if (height) console.log({ height, width, frameRate });
  });

  return stream;
};

export default getCameraStream;
