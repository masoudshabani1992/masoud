// Combine the three stand dinosaurs into one real-scale (meters) GLB
// for Google Scene Viewer / AR-Quick-Look-style placement in the user's room.
import { NodeIO, Document } from '@gltf-transform/core';
import { mergeDocuments } from '@gltf-transform/functions';

const SCALE = 0.164; // native units -> meters (T-Rex ends up ~2.5m tall, ~5m long)

// name, x position (meters), native bbox minY
const LAYOUT = [
  { file: '../models/Triceratops.glb', x: -2.7, minY: -0.09346 },
  { file: '../models/Trex.glb',        x: 0.0,  minY: -0.00381 },
  { file: '../models/Stegosaurus.glb', x: 2.7,  minY: -0.10623 },
];

const io = new NodeIO();
const target = new Document();
const room = target.createScene('DinoRoom');

for (const item of LAYOUT) {
  const src = await io.read(new URL(item.file, import.meta.url).pathname);
  const scenesBefore = target.getRoot().listScenes().length;
  mergeDocuments(target, src);
  const scenesAfter = target.getRoot().listScenes();
  const merged = scenesAfter.slice(scenesBefore);
  if (merged.length !== 1 || merged[0].listChildren().length !== 1) {
    throw new Error(`unexpected merge result for ${item.file}`);
  }
  const node = merged[0].listChildren()[0];
  merged[0].removeChild(node);
  merged[0].dispose();
  room.addChild(node);
  node.setTranslation([item.x, -item.minY * SCALE, 0]);
  node.setScale([SCALE, SCALE, SCALE]);
}

// Keep one clean Walk clip per dinosaur (Scene Viewer plays the asset's
// animations; dropping Attack/Death/etc. avoids blending glitches).
for (const anim of target.getRoot().listAnimations()) {
  if (!/_Walk$/.test(anim.getName())) anim.dispose();
}

// GLB allows a single buffer: reassign every accessor to one merged buffer
// and drop the leftover per-source buffers.
const buffer = target.createBuffer();
target.getRoot().listAccessors().forEach((a) => a.setBuffer(buffer));
for (const b of target.getRoot().listBuffers()) {
  if (b !== buffer) b.dispose();
}

await io.write(new URL('../models/dinos-combined.glb', import.meta.url).pathname, target);
console.log('written: models/dinos-combined.glb');
