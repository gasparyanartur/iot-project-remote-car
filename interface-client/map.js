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

    const canv_m = dictApply(specs.house, ['width', 'height'], meterToBrowserSize);

    canvas.width = canv_m.width;
    canvas.height = canv_m.height;

    const render = () => {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canv_m.width, canv_m.height);

        specs.areas.forEach(w => {
            ctx.fillStyle = 'blue';
            const wm = dictApply(w, ['x', 'y', 'w', 'h'], meterToBrowserSize);
            ctx.fillRect(wm.x, wm.y, wm.w, wm.h);
        });

        specs.points.forEach(p => {
            ctx.fillStyle = 'red';
            const pm = dictApply(p, ['x', 'y'], meterToBrowserSize);
            ctx.moveTo(pm.x, pm.y);
            console.log(pm.x, pm.y);
            ctx.arc(pm.x, pm.y, 15, 0, 2 * Math.PI, true);
            ctx.fill();
        });
    };

    ctx.fill();

    return { canvas, render };
};