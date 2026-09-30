// Business Rule: Evaluate whether employee clock-in distance is within the allowed geofence (threshold: 0.5 miles)
function evaluateClockInDistance(distanceInMiles) {
  const GEOFENCE_RADIUS = 0.5;

  if (distanceInMiles <= GEOFENCE_RADIUS) {
    return "Approved: Within geofence";
  } else {
    return "Flagged: Outside geofence, requires manager review";
  }
}

// --- Boundary Testing ---
console.log("=== Testing Geofence Business Rule ===");

// 1. Below threshold (Valid / Inside boundary)
console.log("Test 0.2 miles (Inside):", evaluateClockInDistance(0.2));

// 2. Exactly at threshold (Boundary)
console.log("Test 0.5 miles (Boundary):", evaluateClockInDistance(0.5));

// 3. Above threshold (Invalid / Flagged)
console.log("Test 0.8 miles (Outside):", evaluateClockInDistance(0.8));
