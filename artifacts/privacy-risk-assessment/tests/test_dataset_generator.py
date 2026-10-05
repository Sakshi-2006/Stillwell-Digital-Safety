import csv
import sys
import tempfile
import unittest
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
sys.path.insert(0, str(DATA_DIR))

from generate_dataset import (  # noqa: E402
    LEGACY_COLUMNS,
    QUESTIONS,
    calculate_score,
    generate_dataset,
)


class DatasetGeneratorTests(unittest.TestCase):
    def test_default_generator_writes_one_thousand_records(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv")
            with path.open(newline="", encoding="utf-8") as source:
                self.assertEqual(sum(1 for _ in csv.DictReader(source)), 1_000)

    def test_generator_writes_the_complete_question_set(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv", count=1)
            with path.open(newline="", encoding="utf-8") as source:
                headers = next(csv.reader(source))
            self.assertTrue({item[0] for item in QUESTIONS}.issubset(headers))

    def test_csv_headers_are_unique(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv", count=1)
            with path.open(newline="", encoding="utf-8") as source:
                headers = next(csv.reader(source))
            self.assertEqual(len(headers), len(set(headers)))

    def test_seed_produces_reproducible_rows(self):
        with tempfile.TemporaryDirectory() as folder:
            first = generate_dataset(Path(folder) / "first.csv", count=8, seed=17)
            second = generate_dataset(Path(folder) / "second.csv", count=8, seed=17)
            self.assertEqual(first.read_bytes(), second.read_bytes())

    def test_different_seeds_produce_different_rows(self):
        with tempfile.TemporaryDirectory() as folder:
            first = generate_dataset(Path(folder) / "first.csv", count=8, seed=17)
            second = generate_dataset(Path(folder) / "second.csv", count=8, seed=18)
            self.assertNotEqual(first.read_bytes(), second.read_bytes())

    def test_scores_are_in_range_and_have_a_valid_level(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv", count=30)
            with path.open(newline="", encoding="utf-8") as source:
                rows = list(csv.DictReader(source))
        for row in rows:
            self.assertGreaterEqual(int(row["risk_score"]), 0)
            self.assertLessEqual(int(row["risk_score"]), 100)
            self.assertIn(row["risk_level"], {"LOW", "MODERATE", "HIGH", "CRITICAL"})

    def test_csv_avoids_identifying_value_columns(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv", count=1)
            with path.open(newline="", encoding="utf-8") as source:
                headers = set(next(csv.reader(source)))
        sensitive_columns = {
            "name", "username", "phone", "email", "address", "password",
            "latitude", "longitude", "profile_url", "post_content", "message",
        }
        self.assertTrue(headers.isdisjoint(sensitive_columns))

    def test_legacy_columns_are_kept_for_portfolio_compatibility(self):
        with tempfile.TemporaryDirectory() as folder:
            path = generate_dataset(Path(folder) / "sample.csv", count=1)
            with path.open(newline="", encoding="utf-8") as source:
                headers = set(next(csv.reader(source)))
        self.assertTrue(set(LEGACY_COLUMNS).issubset(headers))

    def test_invalid_zero_record_count_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError):
                generate_dataset(Path(folder) / "sample.csv", count=0)

    def test_all_safe_responses_score_zero(self):
        answers = {
            question_id: {"visibility": "PRIVATE", "control": "YES", "behavior": "NEVER"}[kind]
            for question_id, _, kind, _ in QUESTIONS
        }
        self.assertEqual(calculate_score(answers), (0, "LOW"))

    def test_all_exposed_responses_score_one_hundred(self):
        answers = {
            question_id: {"visibility": "PUBLIC", "control": "NO", "behavior": "OFTEN"}[kind]
            for question_id, _, kind, _ in QUESTIONS
        }
        self.assertEqual(calculate_score(answers), (100, "CRITICAL"))


if __name__ == "__main__":
    unittest.main()
