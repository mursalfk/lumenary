// src/components/studio/Studio.jsx
import { useMemo, useRef, useState } from 'react';
import { isLive } from '../../utils/format.js';
import { fitSize } from '../../engine/utils.js';
import { canExportVideo, videoOutSize } from '../../engine/videoExport.js';
import useStyleParams from '../../hooks/useStyleParams.js';
import useMediaInput from '../../hooks/useMediaInput.js';
import useRuntime from '../../hooks/useRuntime.js';
import usePointerBridge from '../../hooks/usePointerBridge.js';
import useDropZone from '../../hooks/useDropZone.js';
import usePasteFile from '../../hooks/usePasteFile.js';
import useExport from '../../hooks/useExport.js';
import StudioBar from './StudioBar.jsx';
import Stage from './Stage.jsx';
import StageMeta from './StageMeta.jsx';
import Transport from './Transport.jsx';
import Panel from './Panel.jsx';
import SourceSection from './SourceSection.jsx';
import TreatmentSection from './TreatmentSection.jsx';
import ExportSection from './ExportSection.jsx';
import SectionLinks from './SectionLinks.jsx';
import TheoryLink from './TheoryLink.jsx';

// One style's workspace: canvas on the left, controls on the right.
export default function Studio({ style }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState(2);
  const [side, setSide] = useState(720);
  const live = isLive(style);

  const { params, set, reset } = useStyleParams(style);
  const { src, take, error, loading, reset: useSample } = useMediaInput();
  const { rtRef, dim } = useRuntime(style, canvasRef, params, src);
  const pointer = usePointerBridge(canvasRef, rtRef);
  const { dragging, bind } = useDropZone(take);
  const { busy, note, progress, savePng, record, saveVideo, cancel } = useExport(rtRef, style, live, scale, params, src);
  usePasteFile(take);

  const isVideo = !!src.video;
  // The size of the PNG. A live frame is saved as shown; a still is rendered again, larger, from the full picture.
  const png = useMemo(() => {
    if (live) return { w: dim.W, h: dim.H };
    if (!isVideo) return { w: Math.min(4096, dim.W * scale), h: Math.min(4096, dim.H * scale) };
    const frame = fitSize(src.w, src.h, 3200);
    return fitSize(frame.w * scale, frame.h * scale, Math.min(4096, style.maxSide * scale));
  }, [live, isVideo, dim, scale, style, src]);

  const video = useMemo(() => {
    if (!isVideo) return null;
    const out = videoOutSize(style, src.w, src.h, side);
    return {
      side, onSide: setSide, onExport: () => saveVideo(side), onCancel: cancel, progress,
      width: out.w, height: out.h, seconds: src.limit, supported: canExportVideo(),
    };
  }, [isVideo, style, src, side, saveVideo, cancel, progress]);

  return (
    <div className="studio">
      <StudioBar style={style} />
      <div className="layout">
        <div className="stage-col">
          <Stage canvasRef={canvasRef} label={`${style.name} preview`} dragging={dragging} loading={loading} drop={bind} pointer={pointer} />
          {isVideo && <Transport src={src} disabled={busy === 'video'} />}
          <StageMeta name={src.name} width={dim.W} height={dim.H} live={live} video={isVideo} />
          <SectionLinks style={style} />
        </div>
        <Panel blurb={style.blurb}>
          <TheoryLink style={style} className="in-panel" />
          <SourceSection onFile={take} onReset={useSample} isSample={src.sample} trimmed={src.trimmed} loading={loading} error={error} />
          <TreatmentSection defs={style.params} values={params} onChange={set} onReset={reset} />
          <ExportSection
            live={live} video={video} scale={scale} onScale={setScale} onSave={savePng} onRecord={record}
            busy={busy} outW={png.w} outH={png.h} note={note}
          />
        </Panel>
      </div>
    </div>
  );
}
