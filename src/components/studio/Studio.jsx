// src/components/studio/Studio.jsx
import { useRef, useState } from 'react';
import { isLive } from '../../utils/format.js';
import useStyleParams from '../../hooks/useStyleParams.js';
import useImageInput from '../../hooks/useImageInput.js';
import useRuntime from '../../hooks/useRuntime.js';
import usePointerBridge from '../../hooks/usePointerBridge.js';
import useDropZone from '../../hooks/useDropZone.js';
import usePasteImage from '../../hooks/usePasteImage.js';
import useExport from '../../hooks/useExport.js';
import StudioBar from './StudioBar.jsx';
import Stage from './Stage.jsx';
import StageMeta from './StageMeta.jsx';
import Panel from './Panel.jsx';
import ImageSection from './ImageSection.jsx';
import TreatmentSection from './TreatmentSection.jsx';
import ExportSection from './ExportSection.jsx';
import SectionLinks from './SectionLinks.jsx';
import TheoryLink from './TheoryLink.jsx';

// One style's workspace: canvas on the left, controls on the right.
export default function Studio({ style }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(2);
  const live = isLive(style);

  const { params, set, reset } = useStyleParams(style);
  const { src, take, error, reset: useSample } = useImageInput();
  const { rtRef, dim } = useRuntime(style, canvasRef, params, src);
  const pointer = usePointerBridge(canvasRef, rtRef);
  const { dragging, bind } = useDropZone(take);
  const { busy, note, savePng, record } = useExport(rtRef, style, live, scale);
  usePasteImage(take);

  const outW = live ? dim.W : Math.min(4096, dim.W * scale);
  const outH = live ? dim.H : Math.min(4096, dim.H * scale);

  return (
    <div className="studio">
      <StudioBar style={style} />
      <div className="layout">
        <div className="stage-col">
          <Stage canvasRef={canvasRef} label={`${style.name} preview`} dragging={dragging} drop={bind} pointer={pointer} />
          <StageMeta name={src.name} width={dim.W} height={dim.H} live={live} />
          <SectionLinks style={style} />
        </div>
        <Panel blurb={style.blurb}>
          <TheoryLink style={style} className="in-panel" />
          <ImageSection onFile={take} onReset={useSample} isSample={src.sample} error={error} />
          <TreatmentSection defs={style.params} values={params} onChange={set} onReset={reset} />
          <ExportSection
            live={live} scale={scale} onScale={setScale} onSave={savePng} onRecord={record}
            busy={busy} outW={outW} outH={outH} note={note}
          />
        </Panel>
      </div>
    </div>
  );
}
