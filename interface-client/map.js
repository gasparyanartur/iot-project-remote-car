const createMap = async () => {
    const readSpecs = async () => {
        const file = await fetch('roomspecs.json');

        if (file.status == 404) {
            console.log("Failed to read file");
            return;
        }
        const data = await file.json();

        const pixelToMeter = (pix) => {
            return pix * data.general.scale / (data.general.zoom * data.general.pix_to_cm * 100);
        };

        const house = {
            width: pixelToMeter(data.house.width),
            height: pixelToMeter(data.house.height)
        };

        const areas = data.areas.map(area => {
            const x = pixelToMeter(area.x1);
            const y = pixelToMeter(area.y1);
            const w = pixelToMeter(area.x2 - area.x1);
            const h = pixelToMeter(area.y2 - area.y1);
            return { x, y, w, h };
        });

        const points = data.points.map(pt => {
            const x = pixelToMeter(pt.x);
            const y = pixelToMeter(pt.y);
            return { x, y };
        });

        return { areas, points, house };
    };

    const specs = await readSpecs();

    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");

    const meterToBrowserSize = (meter) => 50 * meter;

    const canvasWidth = meterToBrowserSize(specs.house.width);
    const canvasHeight = meterToBrowserSize(specs.house.height);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const render = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        specs.areas.forEach(w => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(meterToBrowserSize(w.x), meterToBrowserSize(w.y), meterToBrowserSize(w.w), meterToBrowserSize(w.h));
        });

        specs.points.forEach(p => {
            ctx.fillStyle = 'red';
            ctx.moveTo(meterToBrowserSize(p.x), meterToBrowserSize(p.y));
            console.log(meterToBrowserSize(p.x), meterToBrowserSize(p.y));
            ctx.arc(meterToBrowserSize(p.x), meterToBrowserSize(p.y), 15, 0, 2 * Math.PI, true);
            ctx.fill();
        });
    };

    ctx.fill();

    return { canvas, render };
};