import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {SHOTS, ShotDef, mouthAt} from './shots';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (s: number) => s * s * s * (s * (s * 6 - 15) + 10);

/** Moves the camera along the active shot: smootherstep glide between two keys, a slow creep, a roll. */
const CameraRig: React.FC<{shot: ShotDef; t: number; dur: number}> = ({shot, t, dur}) => {
  const {camera} = useThree();
  const k = smooth(clamp01(t / dur));
  const mix = (a: number[], b: number[]) => a.map((v, i) => v + (b[i] - v) * k);
  let p = mix(shot.cam0.p, shot.cam1.p);
  const l = mix(shot.cam0.l, shot.cam1.l);
  const f = shot.cam0.f + (shot.cam1.f - shot.cam0.f) * k;
  const r = (shot.cam0.r ?? 0) + ((shot.cam1.r ?? 0) - (shot.cam0.r ?? 0)) * k;
  const d = [l[0] - p[0], l[1] - p[1], l[2] - p[2]];
  const len = Math.hypot(d[0], d[1], d[2]) || 1;
  const creep = (shot.creep ?? 0) * t;
  p = [p[0] + (d[0] / len) * creep, p[1] + (d[1] / len) * creep, p[2] + (d[2] / len) * creep];
  camera.position.set(p[0], p[1], p[2]);
  camera.up.set(Math.sin(r), Math.cos(r), 0);
  camera.lookAt(l[0], l[1], l[2]);
  if (Math.abs((camera as THREE.PerspectiveCamera).fov - f) > 1e-3) {
    (camera as THREE.PerspectiveCamera).fov = f;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }
  return null;
};

/** The whole short inside one three.js canvas: lights, the active shot's camera and its content. */
export const PilotScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const g = frame / fps;
  const shot = SHOTS.find((s) => g >= s.a && g < s.b) ?? SHOTS[SHOTS.length - 1];
  const t = Math.max(0, g - shot.a);
  const dur = shot.b - shot.a;
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 4]} intensity={1.0} />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} color="#ffe2b8" />
      <CameraRig shot={shot} t={t} dur={dur} />
      <React.Fragment key={shot.id}>{shot.view({g, t, dur, mouth: mouthAt(g), frame})}</React.Fragment>
    </>
  );
};
