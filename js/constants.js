// Road dimensions
export const ROAD_WIDTH = 200;
export const LANE_WIDTH = ROAD_WIDTH / 4; // Four lanes per direction
export const LANE_MARKER_WIDTH = 2;
export const LANE_MARKER_LENGTH = 30;
export const LANE_MARKER_GAP = 30;

// Stop line constants
export const STOP_LINE_WIDTH = 4;
export const STOP_LINE_LENGTH = LANE_WIDTH * 2;  // Width of two lanes
export const STOP_LINE_OFFSET = 20;  // Distance from intersection

// Traffic light constants
export const LIGHT_RADIUS = 6;
export const LIGHT_SPACING = 20;
export const LIGHT_BOX_SHORT = 20;  // Width of the box
export const LIGHT_BOX_LONG = 65;   // Length of the box

// Vehicle constants
export const VEHICLE_LENGTH = 30;
export const VEHICLE_WIDTH = 20;
export const VEHICLE_SPEED = 2;
export const SAFE_DISTANCE = VEHICLE_LENGTH * 3;
export const INTERSECTION_BUFFER = 20;
export const INTERSECTION_MARGIN = ROAD_WIDTH / 2;
export const MIN_EXIT_SPACE = VEHICLE_LENGTH * 3;

// Traffic light timing (in milliseconds)
export const LIGHT_TIMINGS = {
    green: 5000,   // 5 seconds
    yellow: 3000,  // 3 seconds
    red: 0         // Red duration is calculated from green + yellow
};
