const map = (() => {
    const CellStatus = {
        NOTHING: 0,
        WALL: 1,
        OBSTACLE: 2,
        UNPATHABLE: 1 | 2,
    };

    const house = {
        width: 100,
        height: 100,
        cells: Array(100 * 100).fill(CellStatus.NOTHING),

    };
    
    const getCell = (x, y) => house.cells[y * house.width + x];
    const setCell = (x, y, v) => house.cells[y * house.width + x] = v;
    const setRect = (x0, y0, w, h, v) => {
        for (let y = y0; y < y0 + h; y++)
        for (let x = x0; x < x0 + w; x++) {
            setCell(x, y, v);
        }
    }

    setRect(10, 10, 4, 90, CellStatus.WALL);

    const colors = {
        [CellStatus.NOTHING]: '#FFF',
        [CellStatus.OBSTACLE]: '#101010',
        [CellStatus.WALL]: '#808080'
    };

    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");
    const width = 400;
    const height = 400;

    const cellSize = 4;


    const render = () => {
        for (let y = 0; y < house.height; y++)
            for (let x = 0; x < house.width; x++) {
                const cell = getCell(x, y);
                ctx.fillStyle = colors[cell];
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
    }

    ctx.stroke();

    return { width, height, getCell, setCell, setRect, render};
})();