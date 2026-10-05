#!/usr/bin/env python3
"""Generate a reproducible, entirely fictional privacy-assessment CSV."""

from __future__ import annotations

import csv
import random
from pathlib import Path

OUTPUT = Path(__file__).with_name("social_media_privacy_assessments.csv")
RECORD_COUNT = 1_000
SEED = 20261005

CATEGORIES = [
    "Profile Exposure",
    "Personal Information",
    "Location Exposure",
    "Content Exposure",
    "Connection Risk",
    "Tagging Risk",
    "Account Security",
    "Third-Party Apps",
    "Social Engineering",
    "Digital Footprint",
]
CATEGORY_WEIGHTS = {
    "Profile Exposure": 10,
    "Personal Information": 15,
    "Location Exposure": 15,
    "Content Exposure": 10,
    "Connection Risk": 10,
    "Tagging Risk": 5,
    "Account Security": 15,
    "Third-Party Apps": 5,
    "Social Engineering": 10,
    "Digital Footprint": 5,
}

# (question_id, category, answer_kind, scoring_weight)
QUESTIONS = [
    ("profile_public", "Profile Exposure", "visibility", 1),
    ("profile_searchable", "Profile Exposure", "control", 1),
    ("profile_followers_public", "Profile Exposure", "visibility", 2),
    ("profile_friends_public", "Profile Exposure", "visibility", 2),
    ("profile_activity_public", "Profile Exposure", "control", 2),
    ("phone_public", "Personal Information", "visibility", 1),
    ("email_public", "Personal Information", "visibility", 1),
    ("birthday_public", "Personal Information", "visibility", 1),
    ("workplace_public", "Personal Information", "visibility", 2),
    ("education_public", "Personal Information", "visibility", 2),
    ("family_details_public", "Personal Information", "visibility", 2),
    ("live_location", "Location Exposure", "behavior", 1),
    ("checkins_public", "Location Exposure", "behavior", 1),
    ("geotagging_enabled", "Location Exposure", "behavior", 1),
    ("travel_plans_public", "Location Exposure", "behavior", 1),
    ("routine_location_public", "Location Exposure", "behavior", 2),
    ("posts_public", "Content Exposure", "visibility", 1),
    ("children_photos_public", "Content Exposure", "behavior", 1),
    ("photo_background_checked", "Content Exposure", "control", 2),
    ("photo_metadata_reviewed", "Content Exposure", "control", 2),
    ("reposts_reviewed", "Content Exposure", "control", 2),
    ("unknown_requests_accepted", "Connection Risk", "behavior", 1),
    ("connections_reviewed", "Connection Risk", "control", 2),
    ("public_dms_open", "Connection Risk", "control", 2),
    ("unknown_connections_verified", "Connection Risk", "control", 1),
    ("follower_changes_reviewed", "Connection Risk", "control", 3),
    ("tag_review_enabled", "Tagging Risk", "control", 1),
    ("mentions_restricted", "Tagging Risk", "control", 2),
    ("tagged_posts_reviewed", "Tagging Risk", "control", 2),
    ("auto_profile_tags_disabled", "Tagging Risk", "control", 1),
    ("tagging_notifications_enabled", "Tagging Risk", "control", 3),
    ("mfa_enabled", "Account Security", "control", 1),
    ("password_unique", "Account Security", "control", 1),
    ("password_manager_used", "Account Security", "control", 2),
    ("login_alerts_enabled", "Account Security", "control", 2),
    ("sessions_reviewed", "Account Security", "control", 2),
    ("third_party_apps_reviewed", "Third-Party Apps", "control", 1),
    ("unused_apps_removed", "Third-Party Apps", "control", 2),
    ("app_permissions_reviewed", "Third-Party Apps", "control", 2),
    ("old_integrations_checked", "Third-Party Apps", "control", 3),
    ("least_privilege_used", "Third-Party Apps", "control", 2),
    ("unexpected_links_checked", "Social Engineering", "control", 1),
    ("verification_codes_shared", "Social Engineering", "behavior", 1),
    ("suspicious_dms_reported", "Social Engineering", "control", 2),
    ("impersonation_verified", "Social Engineering", "control", 1),
    ("personal_details_in_dms", "Social Engineering", "behavior", 1),
    ("old_posts_reviewed", "Digital Footprint", "control", 1),
    ("unused_accounts_reviewed", "Digital Footprint", "control", 2),
    ("public_comments_reviewed", "Digital Footprint", "control", 2),
    ("privacy_settings_reviewed", "Digital Footprint", "control", 1),
    ("linked_profiles_reviewed", "Digital Footprint", "control", 2),
]

RISK_VALUES = {
    "visibility": {"PUBLIC": 1.0, "FRIENDS": 0.55, "PRIVATE": 0.0, "NOT_SURE": 0.65},
    "control": {"YES": 0.0, "NO": 1.0, "SOMETIMES": 0.55, "NOT_SURE": 0.65},
    "behavior": {"OFTEN": 1.0, "SOMETIMES": 0.55, "RARELY": 0.25, "NEVER": 0.0, "NOT_SURE": 0.65},
}
SAFE_CONTROL_IDS = {
    "mfa_enabled",
    "password_unique",
    "password_manager_used",
    "login_alerts_enabled",
    "sessions_reviewed",
}
LEGACY_COLUMNS = [
    "profile_visibility",
    "phone_public",
    "email_public",
    "birthday_public",
    "location_public",
    "workplace_public",
    "education_public",
    "relationship_public",
    "posts_public",
    "location_tagging",
    "travel_posts",
    "unknown_connections",
    "tag_review_enabled",
    "third_party_apps_reviewed",
    "mfa_enabled",
    "login_alerts_enabled",
    "password_reuse_reported",
    "suspicious_link_awareness",
    "old_posts_reviewed",
    "privacy_settings_reviewed",
]


def risk_level(score: int) -> str:
    if score <= 20:
        return "LOW"
    if score <= 40:
        return "MODERATE"
    if score <= 70:
        return "HIGH"
    return "CRITICAL"


def round_half_up(value: float) -> int:
    return int(value + 0.5)


def calculate_score(answers: dict[str, str]) -> tuple[int, str]:
    category_scores: dict[str, int] = {}
    for category in CATEGORIES:
        questions = [item for item in QUESTIONS if item[1] == category]
        weighted_risk = sum(
            RISK_VALUES[kind][answers[question_id]] * weight
            for question_id, _, kind, weight in questions
        )
        maximum = sum(weight for _, _, _, weight in questions)
        category_scores[category] = round_half_up(weighted_risk / maximum * 100)

    overall = round_half_up(
        sum(category_scores[name] * weight for name, weight in CATEGORY_WEIGHTS.items())
        / sum(CATEGORY_WEIGHTS.values())
    )
    return overall, risk_level(overall)


def make_answers(rng: random.Random) -> dict[str, str]:
    answers = {}
    for question_id, _, kind, _ in QUESTIONS:
        if kind == "visibility":
            options = ["PUBLIC", "PUBLIC", "FRIENDS", "FRIENDS", "PRIVATE", "PRIVATE", "NOT_SURE"]
        elif kind == "control":
            options = ["YES", "YES", "YES", "YES", "NO", "NO", "SOMETIMES", "NOT_SURE"]
        else:
            options = ["OFTEN", "SOMETIMES", "SOMETIMES", "RARELY", "RARELY", "NEVER", "NOT_SURE"]
        answers[question_id] = rng.choice(options)
    return answers


def legacy_values(answers: dict[str, str]) -> dict[str, str]:
    return {
        "profile_visibility": answers["profile_public"],
        "phone_public": answers["phone_public"],
        "email_public": answers["email_public"],
        "birthday_public": answers["birthday_public"],
        "location_public": answers["live_location"],
        "workplace_public": answers["workplace_public"],
        "education_public": answers["education_public"],
        "relationship_public": answers["family_details_public"],
        "posts_public": answers["posts_public"],
        "location_tagging": answers["geotagging_enabled"],
        "travel_posts": answers["travel_plans_public"],
        "unknown_connections": answers["unknown_requests_accepted"],
        "tag_review_enabled": answers["tag_review_enabled"],
        "third_party_apps_reviewed": answers["third_party_apps_reviewed"],
        "mfa_enabled": answers["mfa_enabled"],
        "login_alerts_enabled": answers["login_alerts_enabled"],
        "password_reuse_reported": "NO" if answers["password_unique"] == "YES" else "YES",
        "suspicious_link_awareness": answers["unexpected_links_checked"],
        "old_posts_reviewed": answers["old_posts_reviewed"],
        "privacy_settings_reviewed": answers["privacy_settings_reviewed"],
    }


def generate_dataset(
    output: Path = OUTPUT,
    count: int = RECORD_COUNT,
    seed: int = SEED,
) -> Path:
    if count < 1:
        raise ValueError("count must be at least one")
    rng = random.Random(seed)
    output.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(dict.fromkeys([
        "profile_id",
        *LEGACY_COLUMNS,
        *[q[0] for q in QUESTIONS],
        "risk_score",
        "risk_level",
    ]))
    with output.open("w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for index in range(1, count + 1):
            answers = make_answers(rng)
            score, level = calculate_score(answers)
            row = {
                "profile_id": f"SYN-{index:04d}",
                **legacy_values(answers),
                **answers,
                "risk_score": score,
                "risk_level": level,
            }
            writer.writerow(row)
    return output


if __name__ == "__main__":
    path = generate_dataset()
    print(f"Generated {RECORD_COUNT:,} synthetic records at {path}")
