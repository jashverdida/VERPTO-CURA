// Decodes the cura_yolo11s.tflite model's output tensor (1, 300, 6) into the
// same {class, confidence, x, y, width, height} shape the FastAPI backend
// returns, so CameraScreen's existing scaleBox() works unmodified.
//
// Row format verified in Stage 0 against the live FastAPI backend on the same
// test image: [x1, y1, x2, y2, confidence, classId], x/y normalized 0-1
// relative to the model's 640x640 input. NMS is already baked into the
// exported model (nms=True), so no decode/NMS math is needed here, just
// reading the fixed output array and converting box format.

const NAMES = ['CAR', 'CAR-ACCIDENT', 'FIRE', 'SMOKE'];
const MODEL_SIZE = 640;

export function decodeDetections(output, threshold) {
  'worklet';
  const detections = [];
  for (let i = 0; i < output.length; i += 6) {
    const confidence = output[i + 4];
    if (confidence <= threshold) continue;
    const classId = Math.round(output[i + 5]);
    if (classId < 0 || classId >= NAMES.length) continue;

    const x1 = output[i] * MODEL_SIZE;
    const y1 = output[i + 1] * MODEL_SIZE;
    const x2 = output[i + 2] * MODEL_SIZE;
    const y2 = output[i + 3] * MODEL_SIZE;

    detections.push({
      class: NAMES[classId],
      confidence,
      x: (x1 + x2) / 2,
      y: (y1 + y2) / 2,
      width: x2 - x1,
      height: y2 - y1,
    });
  }
  return detections;
}
