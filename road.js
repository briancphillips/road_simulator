const canvas = document.getElementById('roadCanvas');
const ctx = canvas.getContext('2d');

import { Intersection } from './js/Intersection.js';

// Constants for road dimensions
const ROAD_WIDTH = 200;
const LANE_WIDTH = ROAD_WIDTH / 4;
const LANE_MARKER_WIDTH = 2;
const LANE_MARKER_LENGTH = 30;
const LANE_MARKER_GAP = 30;

// Traffic light constants
const LIGHT_RADIUS = 6;
const LIGHT_SPACING = 15;
const LIGHT_BOX_SHORT = 20;
const LIGHT_BOX_LONG = 60;

// Vehicle constants
const VEHICLE_LENGTH = 30;
const VEHICLE_WIDTH = 20;
let VEHICLE_SPEED = 2;
let VEHICLE_SPAWN_RATE = 0.05; // Increased from previous value
let MAX_VEHICLES = 12; // Reduced to prevent overcrowding
const SAFE_DISTANCE = VEHICLE_LENGTH * 3; // Increased from 2 to 3
const INTERSECTION_BUFFER = 20; // Increased from 10 to 20
const INTERSECTION_MARGIN = ROAD_WIDTH / 2;
const MIN_EXIT_SPACE = VEHICLE_LENGTH * 3; // Increased from 2 to 3

// Traffic light timing (in frames at 60fps)
const LIGHT_TIMINGS = {
    green: 180, // 3 seconds
    yellow: 60, // 1 second
    red: 240 // 4 seconds
};

// Vehicle management
let vehicles = [];
const intersection = new Intersection(canvas.width / 2, canvas.height / 2);

// Get debug panel elements
const greenDurationInput = document.getElementById('greenDuration');
const yellowDurationInput = document.getElementById('yellowDuration');
const greenValueDisplay = document.getElementById('greenValue');
const yellowValueDisplay = document.getElementById('yellowValue');
const redValueDisplay = document.getElementById('redValue');
const nsStateDisplay = document.getElementById('nsState');
const ewStateDisplay = document.getElementById('ewState');

// Get vehicle control elements
const vehicleSpawnRateInput = document.getElementById('vehicleSpawnRate');
const vehicleSpeedInput = document.getElementById('vehicleSpeed');
const maxVehiclesInput = document.getElementById('maxVehicles');
const spawnRateValueDisplay = document.getElementById('spawnRateValue');
const speedValueDisplay = document.getElementById('speedValue');
const maxVehiclesValueDisplay = document.getElementById('maxVehiclesValue');
const vehicleCountDisplay = document.getElementById('vehicleCount');
const waitingCountDisplay = document.getElementById('waitingCount');
const nsCountDisplay = document.getElementById('nsCount');
const ewCountDisplay = document.getElementById('ewCount');
const intersectionCountDisplay = document.getElementById('intersectionCount');

// Debug output element
const debugOutput = document.getElementById('debugOutput');

// Initialize traffic lights
const LIGHTS = {
    northSouth: {
        state: 'red',
        timer: 0
    },
    eastWest: {
        state: 'green',
        timer: 0
    }
};

// Initialize debug panel values
greenDurationInput.value = LIGHT_TIMINGS.green;
yellowDurationInput.value = LIGHT_TIMINGS.yellow;
updateDisplayValues();

// Initialize vehicle control values
vehicleSpawnRateInput.value = VEHICLE_SPAWN_RATE;
vehicleSpeedInput.value = VEHICLE_SPEED;
maxVehiclesInput.value = MAX_VEHICLES;
updateVehicleDisplayValues();

// Save/restore control values
function saveControlValues() {
    const values = {
        greenDuration: LIGHT_TIMINGS.green,
        yellowDuration: LIGHT_TIMINGS.yellow,
        vehicleSpawnRate: VEHICLE_SPAWN_RATE,
        vehicleSpeed: VEHICLE_SPEED,
        maxVehicles: MAX_VEHICLES
    };
    localStorage.setItem('trafficControlValues', JSON.stringify(values));
}

function restoreControlValues() {
    const savedValues = localStorage.getItem('trafficControlValues');
    if (savedValues) {
        const values = JSON.parse(savedValues);
        LIGHT_TIMINGS.green = values.greenDuration;
        LIGHT_TIMINGS.yellow = values.yellowDuration;
        VEHICLE_SPAWN_RATE = values.vehicleSpawnRate;
        VEHICLE_SPEED = values.vehicleSpeed;
        MAX_VEHICLES = values.maxVehicles;

        // Update input elements
        greenDurationInput.value = values.greenDuration;
        yellowDurationInput.value = values.yellowDuration;
        vehicleSpawnRateInput.value = values.vehicleSpawnRate;
        vehicleSpeedInput.value = values.vehicleSpeed;
        maxVehiclesInput.value = values.maxVehicles;

        // Update displays
        updateDisplayValues();
        updateVehicleDisplayValues();
    }
}

function updateDisplayValues() {
    greenValueDisplay.textContent = LIGHT_TIMINGS.green;
    yellowValueDisplay.textContent = LIGHT_TIMINGS.yellow;
    redValueDisplay.textContent = LIGHT_TIMINGS.green + LIGHT_TIMINGS.yellow;
}

function updateVehicleDisplayValues() {
    const nsVehicles = vehicles.filter(v => ['north', 'south'].includes(v.direction)).length;
    const ewVehicles = vehicles.filter(v => ['east', 'west'].includes(v.direction)).length;
    const intersectionVehicles = vehicles.filter(v => v.isInIntersection()).length;
    const waitingVehicles = vehicles.filter(v => v.waiting).length;

    spawnRateValueDisplay.textContent = VEHICLE_SPAWN_RATE.toFixed(3);
    speedValueDisplay.textContent = VEHICLE_SPEED.toFixed(1);
    maxVehiclesValueDisplay.textContent = MAX_VEHICLES;
    vehicleCountDisplay.textContent = vehicles.length;
    waitingCountDisplay.textContent = waitingVehicles;
    nsCountDisplay.textContent = nsVehicles;
    ewCountDisplay.textContent = ewVehicles;
    intersectionCountDisplay.textContent = intersectionVehicles;
}

// Add event listeners for duration controls
greenDurationInput.addEventListener('input', function() {
    LIGHT_TIMINGS.green = parseInt(this.value);
    updateDisplayValues();
    saveControlValues();
});

yellowDurationInput.addEventListener('input', function() {
    LIGHT_TIMINGS.yellow = parseInt(this.value);
    updateDisplayValues();
    saveControlValues();
});

// Add event listeners for vehicle controls
vehicleSpawnRateInput.addEventListener('input', function() {
    VEHICLE_SPAWN_RATE = parseFloat(this.value);
    updateVehicleDisplayValues();
    saveControlValues();
});

vehicleSpeedInput.addEventListener('input', function() {
    VEHICLE_SPEED = parseFloat(this.value);
    // Update speed for all existing vehicles
    vehicles.forEach(vehicle => vehicle.speed = VEHICLE_SPEED);
    updateVehicleDisplayValues();
    saveControlValues();
});

maxVehiclesInput.addEventListener('input', function() {
    MAX_VEHICLES = parseInt(this.value);
    updateVehicleDisplayValues();
    saveControlValues();
});

// Restore values on page load
restoreControlValues();

function drawRoads() {
    // Clear canvas
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal road
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, canvas.height / 2 - ROAD_WIDTH / 2, canvas.width, ROAD_WIDTH);

    // Draw vertical road
    ctx.fillRect(canvas.width / 2 - ROAD_WIDTH / 2, 0, ROAD_WIDTH, canvas.height);

    drawLaneMarkers();
    drawTrafficLights();
}

function drawTrafficLights() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    const roadHalfWidth = ROAD_WIDTH / 2;

    // North traffic light
    drawTrafficLight(
        midX - LIGHT_BOX_LONG / 2,
        midY - roadHalfWidth - LIGHT_BOX_SHORT,
        LIGHTS.northSouth.state,
        'horizontal',
        'horizontal'
    );

    // South traffic light
    drawTrafficLight(
        midX - LIGHT_BOX_LONG / 2,
        midY + roadHalfWidth,
        LIGHTS.northSouth.state,
        'horizontal',
        'horizontal'
    );

    // East traffic light
    drawTrafficLight(
        midX + roadHalfWidth,
        midY - LIGHT_BOX_LONG / 2,
        LIGHTS.eastWest.state,
        'vertical',
        'vertical'
    );

    // West traffic light
    drawTrafficLight(
        midX - roadHalfWidth - LIGHT_BOX_SHORT,
        midY - LIGHT_BOX_LONG / 2,
        LIGHTS.eastWest.state,
        'vertical',
        'vertical'
    );
}

function drawTrafficLight(x, y, state, boxOrientation, lightOrientation) {
    // Draw the box
    ctx.fillStyle = '#333';
    const width = boxOrientation === 'vertical' ? LIGHT_BOX_SHORT : LIGHT_BOX_LONG;
    const height = boxOrientation === 'vertical' ? LIGHT_BOX_LONG : LIGHT_BOX_SHORT;
    ctx.fillRect(x, y, width, height);

    // Draw the lights
    const colors = ['red', 'yellow', 'green'];
    colors.forEach((color, index) => {
        ctx.beginPath();
        let centerX, centerY;

        if (lightOrientation === 'horizontal') {
            centerX = x + LIGHT_BOX_SHORT / 2 + index * LIGHT_SPACING;
            centerY = y + height / 2;
        } else { // vertical
            centerX = x + width / 2;
            centerY = y + LIGHT_BOX_SHORT / 2 + index * LIGHT_SPACING;
        }

        ctx.arc(centerX, centerY, LIGHT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = state === color ? color : '#444';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}

function updateTrafficLights() {
    // Only increment timer for active direction
    if (LIGHTS.northSouth.state !== 'red') {
        LIGHTS.northSouth.timer++;
    }
    if (LIGHTS.eastWest.state !== 'red') {
        LIGHTS.eastWest.timer++;
    }

    // Handle north-south transitions
    if (LIGHTS.northSouth.state === 'green' && LIGHTS.northSouth.timer >= LIGHT_TIMINGS.green) {
        LIGHTS.northSouth.state = 'yellow';
        LIGHTS.northSouth.timer = 0;
    }
    if (LIGHTS.northSouth.state === 'yellow' && LIGHTS.northSouth.timer >= LIGHT_TIMINGS.yellow) {
        LIGHTS.northSouth.state = 'red';
        LIGHTS.northSouth.timer = 0;
        LIGHTS.eastWest.state = 'green';
    }

    // Handle east-west transitions
    if (LIGHTS.eastWest.state === 'green' && LIGHTS.eastWest.timer >= LIGHT_TIMINGS.green) {
        LIGHTS.eastWest.state = 'yellow';
        LIGHTS.eastWest.timer = 0;
    }
    if (LIGHTS.eastWest.state === 'yellow' && LIGHTS.eastWest.timer >= LIGHT_TIMINGS.yellow) {
        LIGHTS.eastWest.state = 'red';
        LIGHTS.eastWest.timer = 0;
        LIGHTS.northSouth.state = 'green';
    }
}

function drawLaneMarkers() {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = LANE_MARKER_WIDTH;

    // Draw horizontal road markers
    for (let x = 0; x < canvas.width; x += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
        // Middle line
        drawDashedLine(x, canvas.height / 2, x + LANE_MARKER_LENGTH, canvas.height / 2);
        // Upper lanes
        drawDashedLine(x, canvas.height / 2 - LANE_WIDTH, x + LANE_MARKER_LENGTH, canvas.height / 2 - LANE_WIDTH);
        // Lower lanes
        drawDashedLine(x, canvas.height / 2 + LANE_WIDTH, x + LANE_MARKER_LENGTH, canvas.height / 2 + LANE_WIDTH);
    }

    // Draw vertical road markers
    for (let y = 0; y < canvas.height; y += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
        // Middle line
        drawDashedLine(canvas.width / 2, y, canvas.width / 2, y + LANE_MARKER_LENGTH);
        // Left lanes
        drawDashedLine(canvas.width / 2 - LANE_WIDTH, y, canvas.width / 2 - LANE_WIDTH, y + LANE_MARKER_LENGTH);
        // Right lanes
        drawDashedLine(canvas.width / 2 + LANE_WIDTH, y, canvas.width / 2 + LANE_WIDTH, y + LANE_MARKER_LENGTH);
    }
}

function drawDashedLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Vehicle class
class Vehicle {
    constructor(direction, lane) {
        this.direction = direction;
        this.lane = lane;
        this.waiting = false;
        this.waitingTime = 0;
        this.length = VEHICLE_LENGTH;
        this.width = VEHICLE_WIDTH;

        // Set initial position based on direction and lane
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;
        
        // Fix lane offset logic - right lane should always be on the right side of travel direction
        const laneOffset = lane === 'right' ? LANE_WIDTH : -LANE_WIDTH;

        switch (direction) {
            case 'north':
                this.x = midX - laneOffset;  // Reversed for northbound traffic
                this.y = canvas.height + VEHICLE_LENGTH;
                break;
            case 'south':
                this.x = midX + laneOffset;  // Reversed for southbound traffic
                this.y = -VEHICLE_LENGTH;
                break;
            case 'east':
                this.x = -VEHICLE_LENGTH;
                this.y = midY + laneOffset;
                break;
            case 'west':
                this.x = canvas.width + VEHICLE_LENGTH;
                this.y = midY - laneOffset;
                break;
        }

        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    isInIntersection() {
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;
        const intersectionBounds = ROAD_WIDTH / 2;

        // Use center of vehicle for intersection check
        const vehicleCenterX = this.x + this.width / 2;
        const vehicleCenterY = this.y + this.length / 2;

        return (
            Math.abs(vehicleCenterX - midX) < intersectionBounds &&
            Math.abs(vehicleCenterY - midY) < intersectionBounds
        );
    }

    hasExitSpace(vehicles) {
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;

        // Calculate position after intersection
        let exitX = this.getExitX();
        let exitY = this.getExitY();

        // Check if there's enough space at the exit point
        for (const vehicle of vehicles) {
            if (vehicle === this) continue;

            if (this.direction === vehicle.direction && this.lane === vehicle.lane) {
                switch (this.direction) {
                    case 'north':
                        if (vehicle.y < exitY && vehicle.y > exitY - MIN_EXIT_SPACE) return false;
                        break;
                    case 'south':
                        if (vehicle.y > exitY && vehicle.y < exitY + MIN_EXIT_SPACE) return false;
                        break;
                    case 'east':
                        if (vehicle.x > exitX && vehicle.x < exitX + MIN_EXIT_SPACE) return false;
                        break;
                    case 'west':
                        if (vehicle.x < exitX && vehicle.x > exitX - MIN_EXIT_SPACE) return false;
                        break;
                }
            }
        }
        return true;
    }

    getDistanceToVehicle(other) {
        switch (this.direction) {
            case 'north':
                return this.y - (other.y + other.length);
            case 'south':
                return other.y - (this.y + this.length);
            case 'east':
                return other.x - (this.x + this.length);
            case 'west':
                return this.x - (other.x + other.length);
            default:
                return Infinity;
        }
    }

    shouldStop(trafficLight, vehicles, midX, midY) {
        const intersectionBounds = ROAD_WIDTH / 2;

        // If already in intersection, never stop
        if (this.isInIntersection()) {
            return false;
        }

        // Check for vehicles ahead in same lane
        for (let other of vehicles) {
            if (other === this || other.lane !== this.lane || other.direction !== this.direction) {
                continue;
            }

            const distance = this.getDistanceToVehicle(other);
            if (distance < SAFE_DISTANCE && distance > -VEHICLE_LENGTH) {  // Allow small negative distance for close following
                return true;
            }
        }

        // Check traffic light only when approaching intersection
        if (this.isApproachingIntersection()) {
            // Get the correct light state based on direction
            if (trafficLight.state === 'red') {
                return true;
            }

            // For yellow, only stop if we're not too close to intersection
            if (trafficLight.state === 'yellow') {
                const distanceToIntersection = 
                    this.direction === 'north' ? this.y - midY :
                    this.direction === 'south' ? midY - this.y :
                    this.direction === 'east' ? midX - this.x :
                    this.x - midX;
                
                return distanceToIntersection > VEHICLE_LENGTH * 2;
            }
        }

        return false;
    }

    isApproachingIntersection() {
        const midX = canvas.width / 2;
        const midY = canvas.height / 2;
        const approachDistance = ROAD_WIDTH * 1.5;  // Give more space for decision making

        // Use vehicle's front edge for approach detection
        let frontX = this.x;
        let frontY = this.y;
        if (this.direction === 'north') frontY = this.y;
        if (this.direction === 'south') frontY = this.y + this.length;
        if (this.direction === 'east') frontX = this.x + this.length;
        if (this.direction === 'west') frontX = this.x;

        switch (this.direction) {
            case 'north':
                return frontY > midY && frontY < midY + approachDistance;
            case 'south':
                return frontY < midY && frontY > midY - approachDistance;
            case 'east':
                return frontX < midX && frontX > midX - approachDistance;
            case 'west':
                return frontX > midX && frontX < midX + approachDistance;
        }
        return false;
    }

    update(trafficLight, vehicles, midX, midY) {
        // Update vehicle state
        this.waiting = this.shouldStop(trafficLight, vehicles, midX, midY);

        if (!this.waiting) {
            // Move vehicle
            switch (this.direction) {
                case 'north':
                    this.y -= VEHICLE_SPEED;
                    break;
                case 'south':
                    this.y += VEHICLE_SPEED;
                    break;
                case 'east':
                    this.x += VEHICLE_SPEED;
                    break;
                case 'west':
                    this.x -= VEHICLE_SPEED;
                    break;
            }
        }
    }

    draw() {
        // Draw vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        if (['north', 'south'].includes(this.direction)) {
            ctx.fillRect(this.x + 2, this.y + 2, this.width, this.length);
        } else {
            ctx.fillRect(this.x + 2, this.y + 2, this.length, this.width);
        }

        // Draw vehicle body
        ctx.fillStyle = this.color;
        if (['north', 'south'].includes(this.direction)) {
            ctx.fillRect(this.x, this.y, this.width, this.length);
        } else {
            ctx.fillRect(this.x, this.y, this.length, this.width);
        }

        // Draw indicator if vehicle is waiting
        if (this.waiting) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            if (['north', 'south'].includes(this.direction)) {
                ctx.fillRect(this.x, this.y, this.width, this.length);
                // Draw brake lights
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.fillRect(this.x, this.y + this.length - 4, this.width, 3);
            } else {
                ctx.fillRect(this.x, this.y, this.length, this.width);
                // Draw brake lights
                ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.fillRect(this.x + this.length - 4, this.y, 3, this.width);
            }
        }
    }

    isOffScreen() {
        const buffer = VEHICLE_LENGTH * 2;
        return (
            this.x + this.length < -buffer ||
            this.x > canvas.width + buffer ||
            this.y + this.length < -buffer ||
            this.y > canvas.height + buffer
        );
    }
}

function spawnVehicles() {
    if (vehicles.length >= MAX_VEHICLES) return;

    if (Math.random() < VEHICLE_SPAWN_RATE) {
        const directions = ['north', 'south', 'east', 'west'];
        const lanes = ['left', 'right'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];

        // Check if there's space to spawn
        const newVehicle = new Vehicle(direction, lane);
        let canSpawn = true;

        for (const vehicle of vehicles) {
            if (vehicle.direction === direction && vehicle.lane === lane) {
                const dx = vehicle.x - newVehicle.x;
                const dy = vehicle.y - newVehicle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < SAFE_DISTANCE * 2) {
                    canSpawn = false;
                    break;
                }
            }
        }

        if (canSpawn) {
            vehicles.push(newVehicle);
        }
    }
}

function updateVehicles() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Update vehicle positions
    for (let vehicle of vehicles) {
        // Get the correct traffic light for this vehicle's direction
        let trafficLight;
        switch(vehicle.direction) {
            case 'north':
                trafficLight = intersection.northLight;
                break;
            case 'south':
                trafficLight = intersection.southLight;
                break;
            case 'east':
                trafficLight = intersection.eastLight;
                break;
            case 'west':
                trafficLight = intersection.westLight;
                break;
        }

        // Update vehicle state with the correct traffic light
        vehicle.waiting = vehicle.shouldStop(trafficLight, vehicles, midX, midY);

        if (!vehicle.waiting) {
            // Move vehicle
            switch (vehicle.direction) {
                case 'north':
                    vehicle.y -= VEHICLE_SPEED;
                    break;
                case 'south':
                    vehicle.y += VEHICLE_SPEED;
                    break;
                case 'east':
                    vehicle.x += VEHICLE_SPEED;
                    break;
                case 'west':
                    vehicle.x -= VEHICLE_SPEED;
                    break;
            }
        }
    }

    // Remove vehicles that are off screen
    vehicles = vehicles.filter(vehicle => !vehicle.isOffScreen());
}

function drawVehicles() {
    for (const vehicle of vehicles) {
        ctx.save();

        // Vehicle body
        ctx.fillStyle = vehicle.waiting ? '#ff6b6b' : '#4CAF50';
        if (['north', 'south'].includes(vehicle.direction)) {
            ctx.fillRect(vehicle.x, vehicle.y, vehicle.width, vehicle.length);
        } else {
            ctx.fillRect(vehicle.x, vehicle.y, vehicle.length, vehicle.width);
        }

        // Vehicle shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(vehicle.x + 2, vehicle.y + 2, vehicle.width, vehicle.length);

        // Brake lights if waiting
        if (vehicle.waiting) {
            ctx.fillStyle = '#ff0000';
            const lightSize = 4;
            switch (vehicle.direction) {
                case 'north':
                    ctx.fillRect(vehicle.x + 2, vehicle.y + vehicle.length - lightSize, lightSize, lightSize);
                    ctx.fillRect(vehicle.x + vehicle.width - 6, vehicle.y + vehicle.length - lightSize, lightSize, lightSize);
                    break;
                case 'south':
                    ctx.fillRect(vehicle.x + 2, vehicle.y, lightSize, lightSize);
                    ctx.fillRect(vehicle.x + vehicle.width - 6, vehicle.y, lightSize, lightSize);
                    break;
                case 'east':
                    ctx.fillRect(vehicle.x, vehicle.y + 2, lightSize, lightSize);
                    ctx.fillRect(vehicle.x, vehicle.y + vehicle.width - 6, lightSize, lightSize);
                    break;
                case 'west':
                    ctx.fillRect(vehicle.x + vehicle.length - lightSize, vehicle.y + 2, lightSize, lightSize);
                    ctx.fillRect(vehicle.x + vehicle.length - lightSize, vehicle.y + vehicle.width - 6, lightSize, lightSize);
                    break;
            }
        }

        ctx.restore();
    }
}

function drawIntersection() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    const size = ROAD_WIDTH;
    const boxMargin = INTERSECTION_BUFFER;
    const boxSize = size + boxMargin * 2;

    // Draw approach zones
    ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
    // North approach
    ctx.fillRect(midX - size / 2, midY - size / 2 - VEHICLE_LENGTH * 3, size, VEHICLE_LENGTH * 3);
    // South approach
    ctx.fillRect(midX - size / 2, midY + size / 2, size, VEHICLE_LENGTH * 3);
    // East approach
    ctx.fillRect(midX + size / 2, midY - size / 2, VEHICLE_LENGTH * 3, size);
    // West approach
    ctx.fillRect(midX - size / 2 - VEHICLE_LENGTH * 3, midY - size / 2, VEHICLE_LENGTH * 3, size);

    // Draw intersection box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(midX - boxSize / 2, midY - boxSize / 2, boxSize, boxSize);

    // Count vehicles in intersection and approach zones
    const vehiclesInIntersection = vehicles.filter(v => v.isInIntersection()).length;
    const vehiclesApproaching = vehicles.filter(v => v.isApproachingIntersection()).length;

    // Draw warning if intersection is blocked
    if (vehiclesInIntersection > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(vehiclesInIntersection * 0.15, 0.5)})`;
        ctx.fillRect(midX - size / 2, midY - size / 2, size, size);
    }

    // Draw stats near intersection
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`In intersection: ${vehiclesInIntersection}`, midX - 40, midY);
    ctx.fillText(`Approaching: ${vehiclesApproaching}`, midX - 40, midY + 15);
}

let debugLog = [];
let debugStartTime = null;
const DEBUG_DURATION = 60000; // 1 minute in milliseconds

function updateDebugOutput() {
    if (!debugStartTime) {
        debugStartTime = Date.now();
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - debugStartTime;

    if (elapsedTime <= DEBUG_DURATION) {
        const timestamp = new Date(currentTime).toLocaleTimeString();
        const debugInfo = [];

        // Get vehicle stats
        const movingVehicles = vehicles.filter(v => !v.waiting);
        const waitingVehicles = vehicles.filter(v => v.waiting);
        const vehiclesInIntersection = vehicles.filter(v => v.isInIntersection()).length;

        debugInfo.push(`[${timestamp}]`);
        debugInfo.push('=== System State ===');
        debugInfo.push(`FPS: ${(1000 / (currentTime - lastFrameTime)).toFixed(1)}`);
        debugInfo.push(`Frame: ${frameCount}`);

        debugInfo.push('\n=== Vehicle Stats ===');
        debugInfo.push(`Total Vehicles: ${vehicles.length}`);
        debugInfo.push(`Moving: ${movingVehicles.length}`);
        debugInfo.push(`Waiting: ${waitingVehicles.length}`);
        debugInfo.push(`In Intersection: ${vehiclesInIntersection}`);

        debugInfo.push('\n=== Vehicle States ===');
        vehicles.forEach((v, i) => {
            const state = v.waiting ? 'WAITING' : 'MOVING';
            const pos = `(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`;
            const waitTime = v.waiting ? ` - waiting ${v.waitingTime} frames` : '';
            const inIntersection = v.isInIntersection() ? ' [IN_INTERSECTION]' : '';
            debugInfo.push(`Vehicle ${i}: ${v.direction} | ${state}${waitTime} | ${pos}${inIntersection}`);
        });

        debugInfo.push('\n=== Traffic Lights ===');
        debugInfo.push(`North-South: ${LIGHTS.northSouth.state} (timer: ${LIGHTS.northSouth.timer})`);
        debugInfo.push(`East-West: ${LIGHTS.eastWest.state} (timer: ${LIGHTS.eastWest.timer})`);

        debugInfo.push('\n=== Intersection ===');
        debugInfo.push(`Blocked: ${isIntersectionBlocked()}`);
        debugInfo.push(`Safe to Enter: ${isIntersectionSafeToEnter()}`);
        debugInfo.push('-------------------\n');

        const debugText = debugInfo.join('\n');
        debugOutput.value = debugText;
        debugOutput.readOnly = false; // Make it selectable
        debugOutput.style.userSelect = 'text'; // Ensure text is selectable
        console.log(debugText); // Also log to console

        lastFrameTime = currentTime;
        frameCount++;
    }
}

// Initialize frame counting
let lastFrameTime = Date.now();
let frameCount = 0;

function animate() {
    const currentTime = Date.now();

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Core updates
    updateTrafficLights();
    spawnVehicles();
    updateVehicles();

    // Draw everything
    drawRoads();
    drawIntersection();
    drawVehicles();
    drawTrafficLights();

    // Update displays
    updateVehicleDisplayValues();
    updateDebugOutput();

    // Continue animation without debug duration check
    requestAnimationFrame(animate);
}

// Start animation
animate();

function isIntersectionBlocked() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    const intersectionBounds = ROAD_WIDTH / 2;

    // Count vehicles in the actual intersection box
    let vehiclesInIntersection = 0;
    for (let vehicle of vehicles) {
        if (Math.abs(vehicle.x - midX) < intersectionBounds &&
            Math.abs(vehicle.y - midY) < intersectionBounds) {
            vehiclesInIntersection++;
        }
    }

    return vehiclesInIntersection > 0;
}

function isIntersectionSafeToEnter() {
    // If intersection is blocked, it's not safe
    if (isIntersectionBlocked()) {
        return false;
    }

    // Check if any vehicles are about to enter from other directions
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    const approachZone = ROAD_WIDTH / 2 + INTERSECTION_BUFFER * 2;

    for (let vehicle of vehicles) {
        if (vehicle.isApproachingIntersection() && !vehicle.waiting) {
            return false;
        }
    }

    return true;
}
