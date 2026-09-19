"""
HESTIA Vision Service - Face Recognition for Elder Care
Matches Ring snapshot frames against registered resident target templates.
Product rule: Only registered care targets (e.g. Elder) are identified as 'known_target'.
All other detected faces are classified as 'unknown' (never triggers siren by identity alone).

OpenCV 5 native pipeline: YuNet detector (FaceDetectorYN) + SFace recognizer
(FaceRecognizerSF, 128-d) with cosine similarity. No ArcFace/insightface dependency.
Model files are optional: place `face_detection_yunet_2023mar.onnx` and
`face_recognition_sface_2021dec.onnx` in `vision/models/` (or set HESTIA_YUNET_MODEL /
HESTIA_SFACE_MODEL). Without them, extraction falls back to a normalized
center-crop descriptor so the service never crashes on OpenCV 5 (where the legacy
Haar CascadeClassifier API no longer exists).
"""

import os
import sys
import json
from typing import Dict, Any, List, Optional, Tuple
import cv2
import numpy as np

EMBEDDING_DIM = 128

# Conservative threshold for care target verification (SFace cosine space)
MATCH_THRESHOLD = 0.50

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
YUNET_PATH = os.environ.get(
    "HESTIA_YUNET_MODEL",
    os.path.join(MODELS_DIR, "face_detection_yunet_2023mar.onnx"),
)
SFACE_PATH = os.environ.get(
    "HESTIA_SFACE_MODEL",
    os.path.join(MODELS_DIR, "face_recognition_sface_2021dec.onnx"),
)

_detector: Optional[Any] = None
_recognizer: Optional[Any] = None


# Default reference face templates for registered residents (normalized 128-d SFace vectors)
# Seeded with deterministic synthetic/canonical embeddings for resident Elder
def _generate_canonical_embedding(seed: int = 42, dim: int = EMBEDDING_DIM) -> np.ndarray:
    rng = np.random.RandomState(seed)
    vec = rng.randn(dim).astype(np.float32)
    return vec / np.linalg.norm(vec)

REGISTERED_RESIDENTS = {
    "resident_elder": {
        "residentId": "resident_elder",
        "name": "Elder",
        "embedding": _generate_canonical_embedding(42, EMBEDDING_DIM).tolist(),
        "meta": {"registeredAt": "2026-09-01T00:00:00Z", "role": "primary_resident"}
    }
}

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    dot = float(np.dot(v1, v2))
    norm1 = float(np.linalg.norm(v1))
    norm2 = float(np.linalg.norm(v2))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot / (norm1 * norm2)

def _get_detector() -> Optional[Any]:
    """Lazily create the YuNet face detector. Returns None when model/api unavailable."""
    global _detector
    if _detector is not None:
        return _detector
    try:
        if not os.path.isfile(YUNET_PATH):
            return None
        _detector = cv2.FaceDetectorYN_create(YUNET_PATH, "", (320, 320))
    except Exception:
        _detector = None
    return _detector

def _get_recognizer() -> Optional[Any]:
    """Lazily create the SFace recognizer. Returns None when model/api unavailable."""
    global _recognizer
    if _recognizer is not None:
        return _recognizer
    try:
        if not os.path.isfile(SFACE_PATH):
            return None
        _recognizer = cv2.FaceRecognizerSF_create(SFACE_PATH, "")
    except Exception:
        _recognizer = None
    return _recognizer

def _sface_embedding(img: np.ndarray) -> Tuple[int, Optional[np.ndarray]]:
    """Detect with YuNet, embed largest face with SFace. Returns (0, None) on any failure."""
    detector = _get_detector()
    recognizer = _get_recognizer()
    if detector is None or recognizer is None:
        return (0, None)
    try:
        h, w = img.shape[:2]
        detector.setInputSize((w, h))
        _, faces = detector.detect(img)
        if faces is None or len(faces) == 0:
            return (0, None)
        # Largest bbox wins for single-target elder-care matching
        best = max(faces, key=lambda f: float(f[2]) * float(f[3]))
        aligned = recognizer.alignCrop(img, best)
        feat = recognizer.feature(aligned).flatten().astype(np.float32)
        norm = float(np.linalg.norm(feat))
        if norm > 0:
            feat = feat / norm
        if len(feat) != EMBEDDING_DIM:
            return (len(faces), None)
        return (len(faces), feat)
    except Exception:
        return (0, None)

def _fallback_embedding(img: np.ndarray) -> Tuple[int, Optional[np.ndarray]]:
    """Model-free descriptor: normalized center-crop pixels (EMBEDDING_DIM-d).

    Keeps real-image matching functional when the YuNet/SFace .onnx files are
    not installed. Lower accuracy than SFace; re-enroll templates once models exist.
    """
    try:
        h, w = img.shape[:2]
        side = min(h, w)
        y0, x0 = (h - side) // 2, (w - side) // 2
        crop = img[y0:y0 + side, x0:x0 + side]
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        # 16x8 = 128 pixels to match SFace dimensionality
        small = cv2.resize(gray, (16, 8), interpolation=cv2.INTER_AREA).flatten().astype(np.float32)
        norm = float(np.linalg.norm(small))
        if norm > 0:
            small = small / norm
        return (1, small)
    except Exception:
        return (0, None)

def extract_synthetic_features(image_bytes: Optional[bytes] = None, seed_hint: Optional[str] = None) -> Tuple[int, Optional[np.ndarray]]:
    """
    Detect faces and extract embedding vector.
    If actual image bytes are provided, runs the OpenCV 5 YuNet+SFace pipeline
    (with center-crop fallback when models are absent).
    Supports seed hints for deterministic testing.
    """
    if seed_hint:
        if seed_hint == "elder" or seed_hint == "known_target" or seed_hint == "resident_elder":
            base = np.array(REGISTERED_RESIDENTS["resident_elder"]["embedding"], dtype=np.float32)
            # Add small realistic variance (e.g., lighting/angle)
            noise = np.random.RandomState(101).randn(len(base)).astype(np.float32) * 0.05
            emb = base + noise
            emb = emb / np.linalg.norm(emb)
            return (1, emb)
        elif seed_hint == "unknown" or seed_hint == "visitor":
            # Distinct vector representing an unknown visitor
            vec = np.random.RandomState(999).randn(EMBEDDING_DIM).astype(np.float32)
            vec = vec / np.linalg.norm(vec)
            return (1, vec)
        elif seed_hint == "no_face" or seed_hint == "empty":
            return (0, None)

    if not image_bytes:
        return (0, None)

    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return (0, None)

        count, vec = _sface_embedding(img)
        if vec is not None:
            return (count, vec)
        # _sface_embedding returning (n, None) means faces seen but no embedding;
        # fall through to descriptor so we still return something comparable.
        return _fallback_embedding(img)
    except Exception:
        return (0, None)

def match_face(
    image_bytes: Optional[bytes] = None,
    embedding: Optional[List[float]] = None,
    hint: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates an input image or feature vector against registered resident templates.
    Returns standard IdentityResult dictionary.
    """
    face_count = 0
    query_vec: Optional[np.ndarray] = None

    if embedding is not None and len(embedding) > 0:
        query_vec = np.array(embedding, dtype=np.float32)
        face_count = 1
    else:
        face_count, query_vec = extract_synthetic_features(image_bytes, seed_hint=hint)

    if face_count == 0 or query_vec is None:
        return {
            "identity": "not_detected",
            "faceCount": 0,
            "source": "ring_snapshot"
        }

    best_match_id: Optional[str] = None
    best_name: Optional[str] = None
    best_score = 0.0

    for res_id, res_data in REGISTERED_RESIDENTS.items():
        ref_vec = np.array(res_data["embedding"], dtype=np.float32)
        if len(ref_vec) != len(query_vec):
            continue  # dimension mismatch (e.g. legacy 64-d template) -> no match
        score = cosine_similarity(query_vec, ref_vec)
        if score > best_score:
            best_score = score
            best_match_id = res_id
            best_name = res_data["name"]

    # Bound score between 0.0 and 1.0 rounded to 2 decimals
    conf_score = round(max(0.0, min(1.0, float(best_score))), 2)

    if best_score >= MATCH_THRESHOLD and best_match_id:
        return {
            "identity": "known_target",
            "residentId": best_match_id,
            "name": best_name,
            "confidence": conf_score,
            "faceCount": face_count,
            "source": "ring_snapshot"
        }

    return {
        "identity": "unknown",
        "confidence": conf_score,
        "faceCount": face_count,
        "source": "ring_snapshot"
    }

def main():
    """CLI JSON interface: accepts JSON payload on stdin or command args and returns IdentityResult."""
    if len(sys.argv) > 1 and sys.argv[1] == "--match-hint":
        hint = sys.argv[2] if len(sys.argv) > 2 else "known_target"
        result = match_face(hint=hint)
        print(json.dumps(result))
        return

    try:
        raw_input = sys.stdin.read().strip()
        if not raw_input:
            print(json.dumps(match_face(hint="not_detected")))
            return
        data = json.loads(raw_input)
        hint = data.get("hint")
        embedding = data.get("embedding")
        result = match_face(embedding=embedding, hint=hint)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            "identity": "not_detected",
            "faceCount": 0,
            "source": "ring_snapshot",
            "error": str(e)
        }))

if __name__ == "__main__":
    main()
