import { ROAD_WIDTH, LANE_WIDTH, LANE_MARKER_WIDTH, 
         LANE_MARKER_LENGTH, LANE_MARKER_GAP } from './constants.js';

export class Road {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }

    drawRoad() {
        // Draw main roads
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(this.width/2 - ROAD_WIDTH/2, 0, ROAD_WIDTH, this.height);
        this.ctx.fillRect(0, this.height/2 - ROAD_WIDTH/2, this.width, ROAD_WIDTH);

        // Draw lane markers
        this.drawLaneMarkers();
    }

    drawLaneMarkers() {
        this.ctx.fillStyle = '#fff';
        const centerX = this.width/2;
        const centerY = this.height/2;
        
        // Vertical road markers (3 sets of dashed lines)
        for (let x = -1; x <= 1; x++) {
            const xPos = centerX + x * LANE_WIDTH;
            for (let y = 0; y < this.height; y += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
                this.ctx.fillRect(
                    xPos - LANE_MARKER_WIDTH/2,
                    y,
                    LANE_MARKER_WIDTH,
                    LANE_MARKER_LENGTH
                );
            }
        }

        // Horizontal road markers (3 sets of dashed lines)
        for (let y = -1; y <= 1; y++) {
            const yPos = centerY + y * LANE_WIDTH;
            for (let x = 0; x < this.width; x += LANE_MARKER_LENGTH + LANE_MARKER_GAP) {
                this.ctx.fillRect(
                    x,
                    yPos - LANE_MARKER_WIDTH/2,
                    LANE_MARKER_LENGTH,
                    LANE_MARKER_WIDTH
                );
            }
        }
    }
}
