import React, { useRef, useState, useEffect, useCallback } from "react";

import { AudioListener, AudioLoader, AudioAnalyser, Audio } from "three";
import { Serie } from "@nivo/line";
import debounce from "lodash.debounce";

import "./index.css";

import NivoLineChart from "./NivoLineChart";

let frameId: number | null;

let audioLoader: AudioLoader;
let listener: AudioListener;
let sound: Audio;
let analyser: AudioAnalyser;

let audioMap: Map<number, number[]>;

const createLineData = (item: number[]) => item.map((d, i) => ({ x: i, y: d }));

const formatData = (id: string, data: { x: number; y: number }[]) => ({
  id,
  data
});

const App = () => {
  const audioStartRef = useRef(false);
  const audioEndedRef = useRef(false);
  const userAudioRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const [selectedFullData, setFullData] = useState<Serie[]>();
  const [selectedData, setData] = useState<Serie>();
  const [selectedDataIndex, setDataIndex] = useState<number>();
  const [userAudioPath, setUserAudioPath] = useState<string>();
  const [userAudioName, setUserAudioName] = useState<string>("Blue Boi.mp3");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof selectedDataIndex === "number") {
      selectedFullData && setData(selectedFullData[selectedDataIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataIndex]);

  const init = () => {
    audioMap = new Map();
    audioLoader = new AudioLoader();
    listener = new AudioListener();
    sound = new Audio(listener);
    analyser = new AudioAnalyser(sound, 1024);
    audioLoader.load(
      userAudioPath || `${process.env.PUBLIC_URL}/BlueBoi.mp3`,
      buffer => {
        if (sound) {
          sound.setBuffer(buffer);
          sound.play();
          sound.setVolume(1);
          audioStartRef.current = true;
          audioEndedRef.current = false;
        }
      },
      xhr => {
        const loadingStatus = (xhr.loaded / xhr.total) * 100;
        console.info(`Audio Loading: ${Math.floor(loadingStatus)}%`);
        if (loadingStatus === 100) {
          console.log("Loading Complete");
        }
      }
    );
  };

  const animate = () => {
    frameId = window.requestAnimationFrame(animate);

    const audioData = analyser && analyser.getFrequencyData();

    audioStartRef.current &&
      !audioEndedRef.current &&
      audioData.forEach((data, idx) => {
        const mapItem = audioMap.get(idx);
        if (mapItem === undefined) {
          audioMap.set(idx, [data]);
        } else {
          audioMap.set(idx, [...mapItem, data]);
        }
      });

    if (sound.buffer && !sound.isPlaying && !audioEndedRef.current) {
      console.log("Ended");
      audioEndedRef.current = true;
      audioStartRef.current = false;
      const fullData = Array.from(audioMap).map(([key, value]) =>
        formatData(key.toString(), createLineData(value))
      );
      setFullData(fullData);
      setData(fullData[0]);
      setDataIndex(0);
      sliderRef.current && sliderRef.current.focus();
      setLoading(false);

      frameId && cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  const start = () => {
    init();
    setData(undefined);
    if (!frameId) {
      frameId = requestAnimationFrame(animate);
    }
  };

  const onStartClicked = () => {
    !audioStartRef.current && start();
    setLoading(true);
  };

  const onEndClicked = () => {
    audioStartRef.current && sound.stop();
    setLoading(false);
  };

  const onChangeSetIndex = useCallback(
    debounce((value: number) => setDataIndex(value), 100),
    []
  );

  const onChange = () => {
    if (userAudioRef.current?.files) {
      setUserAudioName(userAudioRef.current.files[0].name);
      setUserAudioPath(URL.createObjectURL(userAudioRef.current.files[0]));
    }
  };

  return (
    <>
      <div className="configs">
        <div className="load-file">
          <input
            id="audio-file"
            type="file"
            ref={userAudioRef}
            accept="audio/*"
            onChange={onChange}
          />
          <label htmlFor="audio-file">Browse local file</label>
          <small>{userAudioName}</small>
        </div>
        <div className="start">
          <button onClick={onStartClicked} className="start-btn">
            Start
          </button>
          <button onClick={onEndClicked} className="stop-btn">
            Stop
          </button>
        </div>
      </div>

      {!selectedFullData && !audioStartRef.current && (
        <div className="instruction">
          <small>
            This is a helper site for visualizing ByteFrequencyData from
            <strong> THREE.AudioAnalyser.getFrequencyData()</strong>
          </small>
          {loading ? (
            <div className="lds-facebook">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <>
              <br />
              <small>
                1. <strong>Load</strong> audio file to visualize (sample music provided if you just
                want to try it out)
              </small>
              <small>
                2. Once selected, Click <strong>Start</strong> to play & analyse audio
              </small>
              <small>
                3. Wait for audio to finish or click <strong>Stop</strong> to display line chart and
                frequency data slider
              </small>
              <small>
                4. Use <strong>Slider</strong> to select No. of frequency data you want (Default is
                0)
              </small>
              <br />
              <small>
                Note: <strong>Pause</strong> or <strong>Duration control</strong> functionalities
                are not implemented
              </small>

              <small className="music-credit">
                Sample Music by LAKEY INSPIRED -{" "}
                <a
                  href="https://soundcloud.com/lakeyinspired/blue-boi"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Blue Boi
                </a>
              </small>
            </>
          )}
        </div>
      )}

      <div className="control">
        {selectedFullData && (
          <>
            <input
              id="fft-slider"
              className="ranger"
              type="range"
              min="0"
              max={selectedFullData.length - 1}
              step="1"
              onChange={e => onChangeSetIndex(parseInt(e.target.value))}
              defaultValue={0}
              ref={sliderRef}
            />
            <label htmlFor="fft-slider">
              <small>
                No.{selectedDataIndex} of {selectedFullData.length - 1} Frequency Data
              </small>
            </label>
          </>
        )}
      </div>

      <div className="chart">{selectedData && <NivoLineChart data={[selectedData]} />}</div>

      <footer>
        <div>
          &copy; {new Date().getFullYear()}{" "}
          <a href="https://haoranzhang.me/" rel="noopener noreferrer" target="_blank">
            Haoran Zhang
          </a>
        </div>
      </footer>
    </>
  );
};

export default App;
