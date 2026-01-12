#!/usr/bin/env node
/**
 * API Testing Script for AI导航
 * Tests all deployed endpoints and reports their status
 */

const BASE_URL = "http://localhost:8787";  // 本地测试，生产环境需修改

async function testHealthCheck() {
  console.log("=".repeat(60));
  console.log("Testing Health Check (GET /)");
  console.log("=".repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/`);
    const text = await response.text();
    console.log(`✓ Status Code: ${response.status}`);
    console.log(`✓ Response: ${text}`);
    return response.status === 200;
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    return false;
  }
}

async function testRecommend() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing Smart Recommend (POST /api/recommend)");
  console.log("=".repeat(60));
  try {
    const payload = { query: "我想剪辑一个视频" };
    console.log(`Request: ${JSON.stringify(payload)}`);
    const response = await fetch(`${BASE_URL}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    console.log(`✓ Status Code: ${response.status}`);
    console.log(`✓ Response: ${JSON.stringify(result, null, 2)}`);
    return response.status === 200 && result.recommendations;
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    return false;
  }
}

async function testCases() {
  console.log("\n" + "=".repeat(60));
  console.log("Testing Cases List (GET /api/cases)");
  console.log("=".repeat(60));
  try {
    const response = await fetch(`${BASE_URL}/api/cases`);
    const result = await response.json();
    console.log(`✓ Status Code: ${response.status}`);
    console.log(`✓ Response: ${JSON.stringify(result, null, 2)}`);
    console.log(`✓ Total cases: ${result.cases?.length || 0}`);
    return response.status === 200 && result.cases;
  } catch (e) {
    console.log(`✗ Error: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("\n🚀 Starting API Tests");
  console.log(`Base URL: ${BASE_URL}\n`);

  const results = {
    "Health Check": await testHealthCheck(),
    "Smart Recommend": await testRecommend(),
    "Cases List": await testCases()
  };

  console.log("\n" + "=".repeat(60));
  console.log("Test Summary");
  console.log("=".repeat(60));
  for (const [testName, passed] of Object.entries(results)) {
    const status = passed ? "✓ PASSED" : "✗ FAILED";
    console.log(`${testName}: ${status}`);
  }

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  console.log(`\nTotal: ${passed}/${total} tests passed`);

  process.exit(passed === total ? 0 : 1);
}

main();
