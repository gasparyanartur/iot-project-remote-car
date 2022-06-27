const map = (() => {
    const canvas = document.getElementById("map-canvas");
    const ctx = canvas.getContext("2d");
    const width = 400;
    const height = 400;

    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#000';
    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
   
    return {width, height}
})();