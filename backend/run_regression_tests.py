#!/usr/bin/env python3
"""
Regression test runner for Trans Comarapa Backend.
This script runs critical regression tests to ensure no breaking changes.
"""
import subprocess
import sys
import os
from datetime import datetime

def run_regression_tests():
    """Run regression tests and generate a report"""
    print("=" * 60)
    print("TRANS COMARAPA - REGRESSION TEST SUITE")
    print("=" * 60)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Set environment variables for testing
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["SECRET_KEY"] = "test-secret-key"

    # Run regression tests
    cmd = [
        "python", "-m", "pytest",
        "-c", "pytest-regression.ini",
        "--verbose",
        "--tb=short",
        "--durations=10",
        "-m", "regression"
    ]

    # Set PYTHONPATH for module imports
    os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))

    print("Running regression tests...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 60)

    result = subprocess.run(cmd, capture_output=False)

    print("-" * 60)
    print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if result.returncode == 0:
        print("✅ ALL REGRESSION TESTS PASSED")
        print("✅ No breaking changes detected")
    else:
        print("❌ REGRESSION TESTS FAILED")
        print("❌ Potential breaking changes detected")
        print("Please review failures before deploying")

    return result.returncode

def run_comprehensive_auth_tests():
    """Run comprehensive authentication tests"""
    print("=" * 60)
    print("COMPREHENSIVE AUTHENTICATION TESTS")
    print("=" * 60)

    # Set environment variables for testing
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["SECRET_KEY"] = "test-secret-key"

    cmd = [
        "python", "-m", "pytest",
        "tests/unit/test_auth_comprehensive.py",
        "--verbose",
        "--tb=short",
        "--durations=10"
    ]

    # Set PYTHONPATH for module imports
    os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))

    result = subprocess.run(cmd, capture_output=False)
    return result.returncode

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--auth-only":
        exit_code = run_comprehensive_auth_tests()
    else:
        exit_code = run_regression_tests()

    sys.exit(exit_code)