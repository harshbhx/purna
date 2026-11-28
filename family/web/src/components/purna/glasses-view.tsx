// The glasses view on /play: a 3D dining table seen from the chair, with Purna's diyas drawn only inside the part of the
// view the Spectacles display covers (about 32° wide and 37° tall), like real augmented reality. The room and the table are
// always visible; the diyas appear only where the glasses can draw them, so you have to turn your head to find them all.
// Loaded lazily (three.js only downloads when this view opens). Units are centimetres, as in Assets/Scripts/Core.
import { useEffect, useRef } from "react";
import {
  AmbientLight, BoxGeometry, CanvasTexture, Color, ConeGeometry, DirectionalLight, DoubleSide, Group, HemisphereLight,
  LatheGeometry, Mesh, RingGeometry, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster,
  Scene, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, Vector2, WebGLRenderer,
} from "three";
import type { Item } from "../../../../../Assets/Scripts/Core/PurnaTypes";

export interface GlassesViewProps {
  items: Item[];
  lit: Set<number>;
  /** The diya picked with the keyboard, shown with a ring. */
  selected?: number | null;
  yawDeg: number;
  beam: number;
  cue: "none" | "hint1" | "hint2";
  neglect: boolean;
  sizeCm: number;
  onPinch: (it: Item) => void;
}

/** Field of view of the room camera, and of the glasses' display inside it (degrees). */
const ROOM_FOV = 58;
const AR_W = 32, AR_H = 37;
/** The head looks down at the table: its centre is 30 cm below the eyes and 65 cm ahead. */
const PITCH = Math.atan2(30, 65);
const BEAM_OPACITY = [0, 0.28, 0.5, 0.75];

/** The rectangle of the canvas that the glasses can draw on, centred, in CSS pixels. */
export function arRect(w: number, h: number) {
  const tv = Math.tan(((ROOM_FOV / 2) * Math.PI) / 180);
  const th = tv * (w / h);
  const rw = Math.min(w, (w * Math.tan(((AR_W / 2) * Math.PI) / 180)) / th);
  const rh = Math.min(h, (h * Math.tan(((AR_H / 2) * Math.PI) / 180)) / tv);
  return { x: (w - rw) / 2, y: (h - rh) / 2, w: rw, h: rh };
}

function glowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,190,80,0.95)");
  r.addColorStop(0.35, "rgba(255,160,60,0.45)");
  r.addColorStop(1, "rgba(255,140,40,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** A clay bowl as a lathe; `gap` (radians) leaves a wedge open on the left or the right, like a chipped diya. */
function bowl(radius: number, side: "L" | "R" | null): LatheGeometry {
  const s = radius / 3;
  const pts = [[0.01, 0], [1.6, 0.05], [2.5, 0.5], [2.95, 1.2], [3.05, 1.75], [2.85, 1.85], [2.55, 1.4], [1.8, 0.7], [0.01, 0.55]]
    .map(([x, y]) => new Vector2(x * s, y * s));
  if (!side) return new LatheGeometry(pts, 40);
  const gap = 1.25;
  const centre = side === "L" ? (3 * Math.PI) / 2 : Math.PI / 2; // sin(φ) = −1 points to −x (left)
  return new LatheGeometry(pts, 36, centre + gap / 2, 2 * Math.PI - gap);
}

export default function GlassesView(props: GlassesViewProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const el = host.current!;
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.autoClear = false;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    el.prepend(renderer.domElement);

    const camera = new PerspectiveCamera(ROOM_FOV, 16 / 9, 1, 3000);
    camera.rotation.order = "YXZ";

    // The room: a warm evening dining room with a wooden table. Always visible, like the real world through the glasses.
    const room = new Scene();
    room.background = new Color("#140f0b");
    room.add(new HemisphereLight("#ffe3c4", "#2a1c12", 0.9));
    const sun = new DirectionalLight("#ffd9ae", 1.6);
    sun.position.set(80, 160, 40);
    room.add(sun);
    room.add(new AmbientLight("#ffffff", 0.15));
    const wood = new MeshStandardMaterial({ color: "#6b4630", roughness: 0.65, metalness: 0.05 });
    const top = new Mesh(new BoxGeometry(130, 3, 90), wood);
    top.position.set(0, -31.5, -70);
    room.add(top);
    for (const [x, z] of [[-60, -30], [60, -30], [-60, -110], [60, -110]]) {
      const leg = new Mesh(new BoxGeometry(5, 72, 5), wood);
      leg.position.set(x, -69, z);
      room.add(leg);
    }
    const cloth = new Mesh(new PlaneGeometry(70, 45), new MeshStandardMaterial({ color: "#d9cbb6", roughness: 0.95 }));
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.set(0, -29.9, -65);
    room.add(cloth);
    const floor = new Mesh(new PlaneGeometry(800, 800), new MeshStandardMaterial({ color: "#2b1f17", roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -105;
    room.add(floor);
    const wall = new Mesh(new PlaneGeometry(800, 400), new MeshStandardMaterial({ color: "#3a2a1f", roughness: 1 }));
    wall.position.set(0, 50, -230);
    room.add(wall);
    const sideWall = new Mesh(new PlaneGeometry(600, 400), new MeshStandardMaterial({ color: "#33251b", roughness: 1 }));
    sideWall.rotation.y = Math.PI / 2;
    sideWall.position.set(-220, 50, -80);
    room.add(sideWall);
    const sideWall2 = sideWall.clone();
    sideWall2.rotation.y = -Math.PI / 2;
    sideWall2.position.x = 220;
    room.add(sideWall2);

    // What the glasses draw: diyas, flames, the beam. Rendered only inside the display rectangle.
    const ar = new Scene();
    ar.add(new HemisphereLight("#fff1dd", "#3a2516", 1.1));
    const arSun = new DirectionalLight("#ffe2bd", 1.2);
    arSun.position.set(40, 120, 60);
    ar.add(arSun);
    const flameLight = new PointLight("#ffb347", 0, 60, 1.6);
    flameLight.position.set(0, -20, -65);
    ar.add(flameLight);
    const glow = glowTexture();
    const clay = new MeshStandardMaterial({ color: "#b8754a", roughness: 0.7, side: DoubleSide });
    const clayLit = new MeshStandardMaterial({ color: "#d9853f", roughness: 0.55, emissive: new Color("#7a3208"), emissiveIntensity: 0.55, side: DoubleSide });
    const chipMat = new MeshStandardMaterial({ color: "#e2b48a", roughness: 0.6, side: DoubleSide });
    const flameMat = new MeshBasicMaterial({ color: "#ffc04d" });
    const hitMat = new MeshBasicMaterial({ visible: false });
    const beamMat = new MeshBasicMaterial({ color: "#ffb347", transparent: true, opacity: 0, side: DoubleSide, depthWrite: false });
    const beam = new Mesh(new PlaneGeometry(45, 22), beamMat);
    beam.rotation.y = Math.PI / 2;
    beam.position.set(-35, -19, -65);
    ar.add(beam);

    const ring = new Mesh(new RingGeometry(1, 1.25, 40), new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9, side: DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    ar.add(ring);

    interface DiyaObj { group: Group; body: Mesh; flame: Group; hit: Mesh; id: number; phase: number }
    let diyas: DiyaObj[] = [];
    let builtFor: Item[] | null = null;
    const pickables: Mesh[] = [];

    function build(items: Item[], sizeCm: number) {
      for (const d of diyas) ar.remove(d.group);
      diyas = [];
      pickables.length = 0;
      for (const it of items) {
        const g = new Group();
        g.position.set(it.x, -30, -65 + it.u);
        const body = new Mesh(bowl(sizeCm / 2, it.kind === "chipped" ? it.chip : null), it.kind === "chipped" ? chipMat : clay);
        g.add(body);
        const flame = new Group();
        const cone = new Mesh(new ConeGeometry(0.75, 2.6, 16), flameMat);
        cone.position.y = 2.9;
        flame.add(cone);
        const sp = new Sprite(new SpriteMaterial({ map: glow, transparent: true, depthWrite: false, opacity: 0.9 }));
        sp.scale.set(9, 9, 1);
        sp.position.y = 2.8;
        flame.add(sp);
        flame.visible = false;
        g.add(flame);
        const hit = new Mesh(new SphereGeometry(sizeCm / 2 + 1.2, 10, 8), hitMat);
        hit.position.y = 1;
        hit.userData.id = it.id;
        g.add(hit);
        pickables.push(hit);
        ar.add(g);
        diyas.push({ group: g, body, flame, hit, id: it.id, phase: Math.random() * 6 });
      }
    }

    const ray = new Raycaster();
    function onDown(e: PointerEvent) {
      const r = renderer.domElement.getBoundingClientRect();
      const px = e.clientX - r.left, py = e.clientY - r.top;
      const a = arRect(r.width, r.height);
      if (px < a.x || px > a.x + a.w || py < a.y || py > a.y + a.h) return; // the glasses can't draw there
      ray.setFromCamera(new Vector2((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1), camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      if (!hit) return;
      const it = latest.current.items.find((i) => i.id === hit.object.userData.id);
      if (it) latest.current.onPinch(it);
    }
    renderer.domElement.addEventListener("pointerdown", onDown);

    let w = 0, h = 0;
    function resize() {
      const r = el.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      el.style.setProperty("--ar-x", `${arRect(w, h).x}px`);
      el.style.setProperty("--ar-y", `${arRect(w, h).y}px`);
      el.style.setProperty("--ar-w", `${arRect(w, h).w}px`);
      el.style.setProperty("--ar-h", `${arRect(w, h).h}px`);
    }
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro?.observe(el);
    resize();

    let yaw = 0;
    let raf = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function frame(t: number) {
      const p = latest.current;
      if (builtFor !== p.items) { build(p.items, p.sizeCm); builtFor = p.items; }
      // Ease the head toward the target, like a real head turn.
      const target = (p.yawDeg * Math.PI) / 180;
      yaw += (target - yaw) * (reduce ? 1 : 0.18);
      camera.rotation.set(-PITCH, yaw, 0);
      let litCount = 0;
      for (const d of diyas) {
        const on = p.lit.has(d.id);
        d.flame.visible = on;
        d.body.material = on ? clayLit : d.body.material === clayLit ? clay : d.body.material;
        if (on) {
          litCount++;
          // A slow sway, never a flicker of brightness (the Lens's flash rule).
          const s = reduce ? 1 : 1 + 0.06 * Math.sin(t / 380 + d.phase);
          d.flame.scale.set(1, s, 1);
        }
      }
      flameLight.intensity = Math.min(3, litCount * 0.35);
      const pickedObj = p.selected == null ? undefined : diyas.find((d) => d.id === p.selected);
      ring.visible = !!pickedObj;
      if (pickedObj) {
        const r = p.sizeCm / 2 + 1.4;
        ring.scale.set(r, r, 1);
        ring.position.set(pickedObj.group.position.x, -29.7, pickedObj.group.position.z);
      }
      const pulse = p.cue === "hint1" && !reduce ? 0.55 + 0.45 * Math.sin(t / 95) : 1;
      beamMat.opacity = p.cue !== "none" ? 0.85 * pulse : BEAM_OPACITY[p.beam] ?? 0;

      renderer.setScissorTest(false);
      renderer.clear();
      renderer.render(room, camera);
      const a = arRect(w, h);
      renderer.setScissorTest(true);
      renderer.setScissor(a.x, h - a.y - a.h, a.w, a.h);
      renderer.clearDepth();
      renderer.render(ar, camera);
      renderer.setScissorTest(false);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.dispose();
      glow.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={host} className="glasses-view relative h-full w-full">
      <div className="ar-frame pointer-events-none" aria-hidden="true">
        <span className="ar-label">What the glasses can draw</span>
        {props.neglect && <span className="ar-neglect" />}
      </div>
      <div className="ar-vignette pointer-events-none" aria-hidden="true" />
    </div>
  );
}
