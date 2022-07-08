const createMap = async () => {
    const houseStats = {
        width: 0,
        height: 0
    };

    const areas = [];

    const readSpecs = async (houseStats) => {
        const file = await fetch('/roomspecs.json');
        const data = await file.json();

        const pixelToMeter = (pix) => {
            return pix * data.general.scale / (data.general.zoom * data.general.pix_to_cm * 100);
        };

        houseStats.width = pixelToMeter(data.house.width);
        houseStats.height = pixelToMeter(data.house.height);

        areas.splice(0, areas.length);

        data.areas.forEach(area => {
            const x = pixelToMeter(area.x1);
            const y = pixelToMeter(area.y1);
            const w = pixelToMeter(area.x2 - area.x1);
            const h = pixelToMeter(area.y2 - area.y1);
            areas.push({ x, y, w, h });
        });
    };


    await readSpecs(houseStats);

    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");

    const meterToBrowserSize = (meter) => 50 * meter;

    const canvasWidth = meterToBrowserSize(houseStats.width);
    const canvasHeight = meterToBrowserSize(houseStats.height);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const render = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        areas.forEach(w => {
            ctx.fillStyle = 'blue';
            ctx.fillRect(meterToBrowserSize(w.x), meterToBrowserSize(w.y), meterToBrowserSize(w.w), meterToBrowserSize(w.h));
        });
    };

    ctx.stroke();

    return { canvas, render };
};