const canvas = document.getElementById('roadCanvas');
const ctx = canvas.getContext('2d');

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

// Traffic light timing (in milliseconds)
const GREEN_DURATION = 30000;
const YELLOW_DURATION = 3000;
const RED_DURATION = 33000;

// Traffic light states
const LIGHTS = {
    northSouth: {
        state: 'red',
        lastChange: Date.now()
    },
    eastWest: {
        state: 'green',
        lastChange: Date.now()
    }
};

function drawRoads() {
    // Clear canvas
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw horizontal road
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, canvas.height/2 - ROAD_WIDTH/2, canvas.width, ROAD_WIDTH);

    // Draw vertical road
    ctx.fillRect(canvas.width/2 - ROAD_WIDTH/2, 0, ROAD_WIDTH, canvas.height);

    drawLaneMarkers();
    drawTrafficLights();
}

function drawTrafficLights() {
    const midX = canvas.width/2;
    const midY = canvas.height/2;
    const roadHalfWidth = ROAD_WIDTH/2;

    // Just draw the North traffic light for now
    drawTrafficLight(
        midX - LIGHT_BOX_LONG/2,
        midY - roadHalfWidth - LIGHT_BOX_SHORT,
        LIGHTS.northSouth.state,
        'horizontal',
        'horizontal'
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
            centerX = x + LIGHT_BOX_SHORT/2 + index * LIGHT_SPACING;
            centerY = y + height/2;
        } else { // vertical
            centerX = x + width/2;
            centerY = y + LIGHT_BOX_SHORT/2 + index * LIGHT_SPACING;
        }
        
        ctx.arc(centerX, centerY, LIGHT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = state === color ? color : '#444';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}

function updateTrafficLights() {
    const currentTime = Date.now();

    // Update north-south lights
    const nsElapsed = currentTime - LIGHTS.northSouth.lastChange;
    if (LIGHTS.northSouth.state === 'green' && nsElapsed >= GREEN_DURATION) {
        LIGHTS.northSouth.state = 'yellow';
        LIGHTS.northSouth.lastChange = currentTime;
    } else if (LIGHTS.northSouth.state === 'yellow' && nsElapsed >= YELLOW_DURATION) {
        LIGHTS.northSouth.state = 'red';
        LIGHTS.northSouth.lastChange = currentTime;
        LIGHTS.eastWest.state = 'green';
        LIGHTS.eastWest.lastChange = currentTime;
    }

    // Update east-west lights
    const ewElapsed = currentTime - LIGHTS.eastWest.lastChange;
    if (LIGHTS.eastWest.state === 'green' && ewElapsed >= GREEN_DURATION) {
        LIGHTS.eastWest.state = 'yellow';
        LIGHTS.eastWest.lastChange = currentTime;
    } else if (LIGHTS.eastWest.state === 'yellow' && ewElapsed >= YELLOW_DURATION) {
        LIGHTS.eastWest.state = 'red';
        LIGHTS.eastWest.lastChange = currentTime;
        LIGHTS.northSouth.state = 'green';
        LIGHTS.northSouth.lastChange = currentTime;
    }
}

function drawLaneMarkers() {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = LANE_MARKER_WIDTH;

    // Draw horizontal road markers
    for (let x = 0; x < canvas.width; x += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
        // Middle line
        drawDashedLine(x, canvas.height/2, x + LANE_MARKER_LENGTH, canvas.height/2);
        // Upper lanes
        drawDashedLine(x, canvas.height/2 - LANE_WIDTH, x + LANE_MARKER_LENGTH, canvas.height/2 - LANE_WIDTH);
        // Lower lanes
        drawDashedLine(x, canvas.height/2 + LANE_WIDTH, x + LANE_MARKER_LENGTH, canvas.height/2 + LANE_WIDTH);
    }

    // Draw vertical road markers
    for (let y = 0; y < canvas.height; y += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
        // Middle line
        drawDashedLine(canvas.width/2, y, canvas.width/2, y + LANE_MARKER_LENGTH);
        // Left lanes
        drawDashedLine(canvas.width/2 - LANE_WIDTH, y, canvas.width/2 - LANE_WIDTH, y + LANE_MARKER_LENGTH);
        // Right lanes
        drawDashedLine(canvas.width/2 + LANE_WIDTH, y, canvas.width/2 + LANE_WIDTH, y + LANE_MARKER_LENGTH);
    }
}

function drawDashedLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function animate() {
    updateTrafficLights();
    drawRoads();
    requestAnimationFrame(animate);
}

// Start the animation
animate();
