# Traffic Light Positions Reference

This document details the correct positioning of traffic lights at intersections according to USA traffic rules.

## Coordinate System
- Origin (x, y) is at center of intersection
- Positive x is rightward
- Positive y is downward
- ROAD_WIDTH is the total width of the road

## Light Positions

### Northbound Traffic (Bottom to Top)
- Coming from: Bottom of intersection
- Light Position: 
  - x: `x - ROAD_WIDTH/4` (left side, which is right side for northbound traffic)
  - y: `y - ROAD_WIDTH/2` (just before intersection)

### Southbound Traffic (Top to Bottom)
- Coming from: Top of intersection
- Light Position:
  - x: `x + ROAD_WIDTH/4` (right side for southbound traffic)
  - y: `y + ROAD_WIDTH/2` (just before intersection)

### Eastbound Traffic (Left to Right)
- Coming from: Left of intersection
- Light Position:
  - x: `x + ROAD_WIDTH/2` (just before intersection)
  - y: `y - ROAD_WIDTH/4` (right side for eastbound traffic)

### Westbound Traffic (Right to Left)
- Coming from: Right of intersection
- Light Position:
  - x: `x - ROAD_WIDTH/2` (just before intersection)
  - y: `y + ROAD_WIDTH/4` (right side for westbound traffic)

## Implementation Notes
- Each light is positioned on the right side of its respective approach
- Lights are placed just before the intersection for maximum visibility
- This configuration follows standard USA traffic rules where vehicles drive on the right side of the road
