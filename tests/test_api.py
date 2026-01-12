#!/usr/bin/env python3
"""
API Testing Script for AI导航
Tests all deployed endpoints and reports their status
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8787"  # 本地测试，生产环境需修改

def test_health_check():
    """Test GET / endpoint"""
    print("=" * 60)
    print("Testing Health Check (GET /)")
    print("=" * 60)
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"✓ Status Code: {response.status_code}")
        print(f"✓ Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_recommend():
    """Test POST /api/recommend endpoint"""
    print("\n" + "=" * 60)
    print("Testing Smart Recommend (POST /api/recommend)")
    print("=" * 60)
    try:
        payload = {"query": "我想剪辑一个视频"}
        print(f"Request: {json.dumps(payload, ensure_ascii=False)}")
        response = requests.post(
            f"{BASE_URL}/api/recommend",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"✓ Status Code: {response.status_code}")
        result = response.json()
        print(f"✓ Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return response.status_code == 200 and "recommendations" in result
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_cases():
    """Test GET /api/cases endpoint"""
    print("\n" + "=" * 60)
    print("Testing Cases List (GET /api/cases)")
    print("=" * 60)
    try:
        response = requests.get(f"{BASE_URL}/api/cases", timeout=10)
        print(f"✓ Status Code: {response.status_code}")
        result = response.json()
        print(f"✓ Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
        print(f"✓ Total cases: {len(result.get('cases', []))}")
        return response.status_code == 200 and "cases" in result
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print("\n🚀 Starting API Tests")
    print(f"Base URL: {BASE_URL}\n")

    results = {
        "Health Check": test_health_check(),
        "Smart Recommend": test_recommend(),
        "Cases List": test_cases()
    }

    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")

    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")

    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
