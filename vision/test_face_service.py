"""
Unit tests for HESTIA Python Vision / Face Recognition Service.
Validates:
1. Known target (registered resident Eleanor) matching.
2. Unknown visitor classification (without assigning resident ID).
3. No face detected scenarios.
4. Perturbation & threshold calibration tests (lighting, noise, angle).
"""

import unittest
import numpy as np
from face_service import match_face, cosine_similarity, REGISTERED_RESIDENTS, MATCH_THRESHOLD

class TestFaceService(unittest.TestCase):

    def test_known_target_eleanor(self):
        result = match_face(hint="eleanor")
        self.assertEqual(result["identity"], "known_target")
        self.assertEqual(result["residentId"], "resident_eleanor")
        self.assertEqual(result["name"], "Eleanor")
        self.assertGreaterEqual(result["confidence"], MATCH_THRESHOLD)
        self.assertEqual(result["faceCount"], 1)
        self.assertEqual(result["source"], "ring_snapshot")

    def test_unknown_visitor(self):
        result = match_face(hint="visitor")
        self.assertEqual(result["identity"], "unknown")
        self.assertNotIn("residentId", result)
        self.assertNotIn("name", result)
        self.assertLess(result["confidence"], MATCH_THRESHOLD)
        self.assertEqual(result["faceCount"], 1)
        self.assertEqual(result["source"], "ring_snapshot")

    def test_no_face_detected(self):
        result = match_face(hint="no_face")
        self.assertEqual(result["identity"], "not_detected")
        self.assertEqual(result["faceCount"], 0)
        self.assertEqual(result["source"], "ring_snapshot")

    def test_cosine_similarity_properties(self):
        v = np.array([1.0, 0.0, 0.0], dtype=np.float32)
        self.assertAlmostEqual(cosine_similarity(v, v), 1.0, places=5)
        
        ortho = np.array([0.0, 1.0, 0.0], dtype=np.float32)
        self.assertAlmostEqual(cosine_similarity(v, ortho), 0.0, places=5)

    def test_lighting_and_angle_perturbations(self):
        """Simulate realistic lighting and angle variance on registered template."""
        base_emb = np.array(REGISTERED_RESIDENTS["resident_eleanor"]["embedding"], dtype=np.float32)
        
        # Minor perturbation (slight angle/lighting shift) -> should still be recognized
        for seed in [1, 7, 23, 99]:
            noise = np.random.RandomState(seed).randn(64).astype(np.float32) * 0.08
            perturbed = base_emb + noise
            perturbed = (perturbed / np.linalg.norm(perturbed)).tolist()
            res = match_face(embedding=perturbed)
            self.assertEqual(res["identity"], "known_target")
            self.assertEqual(res["residentId"], "resident_eleanor")

        # Heavy distortion/different face -> should drop to unknown
        random_stranger = np.random.RandomState(54321).randn(64).astype(np.float32)
        random_stranger = (random_stranger / np.linalg.norm(random_stranger)).tolist()
        res_stranger = match_face(embedding=random_stranger)
        self.assertEqual(res_stranger["identity"], "unknown")

if __name__ == "__main__":
    unittest.main()
