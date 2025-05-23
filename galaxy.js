// Animacja galaktyki w tle - tylko gwiazdy
const canvas = document.getElementById('galaxy-bg');
const ctx = canvas.getContext('2d');
let w, h, stars;

function init() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5,
        d: Math.random() * 0.5 + 0.2
    }));
}

function draw() {
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#0a0a1a');  // Ciemny granat
    gradient.addColorStop(0.5, '#0a001a'); // Bardzo ciemny fiolet
    gradient.addColorStop(1, '#000814');   // Prawie czarny z niebieskim odcieniem
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fff';
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fill();
        s.y += s.d;
        if (s.y > h) s.y = 0;
    });

    requestAnimationFrame(draw);
}

window.addEventListener('resize', init);
init();
draw();