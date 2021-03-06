const diag = {
  log: true
};

class Restreamer {
  constructor(video) {
    this.stats = {
      constructed: null,
      sourceOpened: null,
      loadstart: null,
      started: null,
      firstBlob: null,
      canPlay: null,
      videoPlaying: null
    };
    if (diag.log) console.log("Constructed");
    this.getStat("constructed");
    this.blobs = [];
    // this.boundAddBlob = this.addBlob.bind(this);
    this.index = 0;
    this.enabled = false;
    this.playing = false;
    this.mediaSource = new MediaSource();
    this.video = video;
    this.videoCallbacks = {
      loadstart: this.loadStartCB.bind(this),
      canplay: this.canPlayCB.bind(this),
      playing: this.playingCB.bind(this),
      stalled: this.stalledCB.bind(this)
    };
    this.handleCallbacks("add");
    if (this.video.src) {
      if (diag.log) console.log("Source set ");
      this.video.pause();
      try {
        URL.revokeObjectURL(this.video.src);
      } catch (e) {
        if (diag.log) console.log("Error revoking URL ", e.toString());
      }
      this.video.src = null;
    }
    // this.video = document.createElement("video");
    this.stream = this.video.src = URL.createObjectURL(this.mediaSource);
    this.bufferBusy = false;
    this.mediaSource.addEventListener(
      "sourceopen",
      this.handleSourceOpen.bind(this)
    );
  }
  getStat(id) {
    if (!this.stats[id]) this.stats[id] = performance.now();
  }
  canPlayCB() {
    this.getStat("canPlay");
    this.video.play();
  }
  loadStartCB() {
    this.getStat("loadstart");
    this.video.play();
  }
  playingCB() {
    this.getStat("videoPlaying");
  }
  stalledCB() {
    this.getStat("stalled");
  }
  handleCallbacks(mode) {
    for (let key in this.videoCallbacks) {
      const cb = this.videoCallbacks[key];
      if (mode === "add") {
        this.video.addEventListener(key, cb);
      } else {
        this.video.removeEventListener(key, cb);
      }
    }
  }
  start() {
    this.getStat("started");
  }
  displayStats() {
    console.log("STATS");
    let base = this.stats.constructed;
    for (let key in this.stats) {
      if (key === "started") {
        if (this.stats.started) base = this.stats.started;
        console.log("======");
      } else {
        console.log(key, Math.round((this.stats[key] - base) * 10) / 10);
      }
    }
  }
  stop() {
    this.displayStats();
    if (this.mediaSource.readyState === "open") {
      try {
        this.mediaSource.endOfStream();
      } catch (e) {
        if (diag.log) console.log("Error setting end of stream", e.toString());
      }
    }
    try {
      this.video.pause();
      this.video.removeAttribute("src"); // empty source
      this.video.load();
    } catch (e) {
      if (diag.log) console.log("Error video operations ", e.toString());
    }
    this.handleCallbacks("remove");

    // this.mediaSource.getTracks().
    this.enabled = false;
  }
  async handleSourceOpen() {
    // console.log("Source open", this);
    this.getStat("sourceOpened");
    if (diag.log) console.log("source opened ");
    try {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(
        // "video/webm; codecs=opus,vp9"
        "video/webm; codecs=opus,vp9"
      );
    } catch (e) {
      console.log("error adding source buffer", e.toString());
    }

    this.sourceBuffer.onupdateend = this.onupdateend.bind(this);
    this.enabled = true;
  }
  async addToBuffer() {
    if (!this.enabled) return;
    try {
      const buffer = this.blobs[this.index];
      const arrayBuffer = await buffer.arrayBuffer();
      // const arrayBuffer =
      this.sourceBuffer.appendBuffer(new Uint8Array(arrayBuffer));
      this.index++;
      this.bufferBusy = true;
    } catch (error) {
      console.log("Problem adding", error.toString());
    }
  }
  async onupdateend() {
    this.bufferBusy = false;
    if (this.index < this.blobs.length) {
      this.addToBuffer();
    }
  }
  async addBlob(blob) {
    this.blobs.push(blob);
    this.getStat("firstBlob");

    // console.log("add blob", this.bufferBusy, this.index, this.blobs.length);
    if (this.bufferBusy) return;
    if (this.sourceBuffer && this.index < this.blobs.length) {
      if (!this.playing) {
        // console.log("START Playing");
        // this.video.play();
        this.playing = true;
      }
      this.addToBuffer();
    }
  }
}

export default Restreamer;
