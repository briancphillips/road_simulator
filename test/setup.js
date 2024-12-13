// Mock canvas and other browser APIs
class MockCanvas {
    constructor() {
        this.width = 800;
        this.height = 600;
    }

    getContext() {
        return {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            closePath: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn()
        };
    }
}

global.HTMLCanvasElement = MockCanvas;
