import { TrafficLight } from './TrafficLight.js';
import { ROAD_WIDTH, LIGHT_TIMINGS, STOP_LINE_WIDTH, STOP_LINE_LENGTH, STOP_LINE_OFFSET } from './constants.js';

export class Intersection {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        // Initialize traffic lights with correct states
        this.northLight = new TrafficLight('northSouth');
        this.southLight = new TrafficLight('northSouth');
        this.eastLight = new TrafficLight('eastWest');
        this.westLight = new TrafficLight('eastWest');
    }

    update() {
        // Update north/south lights
        if (this.northLight.update()) {
            // When north/south turns red, make east/west green
            this.eastLight.state = 'green';
            this.westLight.state = 'green';
            this.eastLight.timer = 0;
            this.westLight.timer = 0;
            this.eastLight.lastUpdate = Date.now();
            this.westLight.lastUpdate = Date.now();
        }
        this.southLight.state = this.northLight.state;
        this.southLight.timer = this.northLight.timer;
        this.southLight.lastUpdate = this.northLight.lastUpdate;

        // Update east/west lights
        if (this.eastLight.update()) {
            // When east/west turns red, make north/south green
            this.northLight.state = 'green';
            this.southLight.state = 'green';
            this.northLight.timer = 0;
            this.southLight.timer = 0;
            this.northLight.lastUpdate = Date.now();
            this.southLight.lastUpdate = Date.now();
        }
        this.westLight.state = this.eastLight.state;
        this.westLight.timer = this.eastLight.timer;
        this.westLight.lastUpdate = this.eastLight.lastUpdate;
    }

    drawStopLines(ctx) {
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = STOP_LINE_WIDTH;

        // North approach stop line
        ctx.beginPath();
        ctx.moveTo(this.x - STOP_LINE_LENGTH/2, this.y - ROAD_WIDTH/2 - STOP_LINE_OFFSET);
        ctx.lineTo(this.x + STOP_LINE_LENGTH/2, this.y - ROAD_WIDTH/2 - STOP_LINE_OFFSET);
        ctx.stroke();

        // South approach stop line
        ctx.beginPath();
        ctx.moveTo(this.x - STOP_LINE_LENGTH/2, this.y + ROAD_WIDTH/2 + STOP_LINE_OFFSET);
        ctx.lineTo(this.x + STOP_LINE_LENGTH/2, this.y + ROAD_WIDTH/2 + STOP_LINE_OFFSET);
        ctx.stroke();

        // East approach stop line
        ctx.beginPath();
        ctx.moveTo(this.x + ROAD_WIDTH/2 + STOP_LINE_OFFSET, this.y - STOP_LINE_LENGTH/2);
        ctx.lineTo(this.x + ROAD_WIDTH/2 + STOP_LINE_OFFSET, this.y + STOP_LINE_LENGTH/2);
        ctx.stroke();

        // West approach stop line
        ctx.beginPath();
        ctx.moveTo(this.x - ROAD_WIDTH/2 - STOP_LINE_OFFSET, this.y - STOP_LINE_LENGTH/2);
        ctx.lineTo(this.x - ROAD_WIDTH/2 - STOP_LINE_OFFSET, this.y + STOP_LINE_LENGTH/2);
        ctx.stroke();

        ctx.restore();
    }

    draw(ctx) {
        // Draw intersection with lighter gray
        ctx.fillStyle = '#888';
        ctx.fillRect(this.x - ROAD_WIDTH/2, this.y - ROAD_WIDTH/2, 
                    ROAD_WIDTH, ROAD_WIDTH);

        // Draw stop lines
        this.drawStopLines(ctx);

        // Position lights for right-lane traffic according to USA rules
        // North approach (for northbound traffic coming from bottom)
        this.northLight.draw(ctx, 
            this.x - ROAD_WIDTH/4,  // Right side of northbound lanes
            this.y - ROAD_WIDTH/2); // Just before intersection

        // South approach (for southbound traffic coming from top)
        this.southLight.draw(ctx, 
            this.x + ROAD_WIDTH/4,  // Right side of southbound lanes
            this.y + ROAD_WIDTH/2); // Just before intersection

        // East approach (for eastbound traffic coming from left)
        this.eastLight.draw(ctx, 
            this.x + ROAD_WIDTH/2,  // Just before intersection
            this.y - ROAD_WIDTH/4); // Right side of eastbound lanes

        // West approach (for westbound traffic coming from right)
        this.westLight.draw(ctx, 
            this.x - ROAD_WIDTH/2,  // Just before intersection
            this.y + ROAD_WIDTH/4); // Right side of westbound lanes
    }
}
