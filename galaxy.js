function togglePassword(fieldId, iconId) {
      const input = document.getElementById(fieldId);
      const icon = document.getElementById(iconId);
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
          <line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/>
          <line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/>
          <line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/>
          <line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>
        `;
      } else {
        input.type = 'password';
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010 9.79z"/>`;
      }
    }

    // Animacja galaktyki w tle
    const canvas = document.getElementById('galaxy-bg');
    const ctx = canvas.getContext('2d');
    let w, h, stars, planets;

    function init() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;

      stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5,
        d: Math.random() * 0.5 + 0.2
      }));

      planets = [
        { 
          type: 'ringed', 
          r: 22, 
          s: 0.001, 
          offset: 0,
          x: Math.random() * w,
          y: Math.random() * h,
          dx: (Math.random() - 0.5) * 0.8,
          dy: (Math.random() - 0.5) * 0.8,
          rotation: 0,
          rotationSpeed: Math.random() * 0.02 - 0.01
        },
        { 
          type: 'striped', 
          r: 18, 
          s: 0.0014, 
          offset: 90,
          x: Math.random() * w,
          y: Math.random() * h,
          dx: (Math.random() - 0.5) * 0.9,
          dy: (Math.random() - 0.5) * 0.9,
          rotation: 0,
          rotationSpeed: Math.random() * 0.02 - 0.01
        },
        { 
          type: 'spotted', 
          r: 14, 
          s: 0.0017, 
          offset: 180,
          x: Math.random() * w,
          y: Math.random() * h,
          dx: (Math.random() - 0.5) * 1.0,
          dy: (Math.random() - 0.5) * 1.0,
          rotation: 0,
          rotationSpeed: Math.random() * 0.02 - 0.01
        }
      ];
    }

    function drawPlanet(x, y, r, rotate, hue, type) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotate);

      const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
      grad.addColorStop(0, `hsl(${hue}, 70%, 80%)`);
      grad.addColorStop(1, `hsl(${hue}, 80%, 40%)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (type === 'ringed') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotate * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.8, r * 0.5, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.4)`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotate);

      if (type === 'striped') {
        for (let i = -r + 3; i < r; i += 5) {
          ctx.beginPath();
          ctx.arc(0, 0, r - Math.abs(i / 2), Math.PI * 1.0, Math.PI * 2.0);
          ctx.strokeStyle = `hsla(${hue + 20}, 100%, 90%, 0.2)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      if (type === 'spotted') {
        for (let i = 0; i < 6; i++) {
          const dx = (Math.random() - 0.5) * r;
          const dy = (Math.random() - 0.5) * r;
          ctx.beginPath();
          ctx.arc(dx, dy, Math.random() * 2 + 1, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue - 30}, 80%, 65%, 0.5)`;
          ctx.fill();
        }
      }

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#000');
      gradient.addColorStop(0.5, '#220033');
      gradient.addColorStop(1, '#001a4d');
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

      const time = Date.now() * 0.002;

      planets.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.rotation += p.rotationSpeed;
        
        if (p.x < p.r || p.x > w - p.r) {
          p.dx *= -1;
          p.dy += (Math.random() - 0.5) * 0.2;
        }
        if (p.y < p.r || p.y > h - p.r) {
          p.dy *= -1;
          p.dx += (Math.random() - 0.5) * 0.2;
        }
        
        if (Math.random() > 0.98) {
          p.dx += (Math.random() - 0.5) * 0.1;
          p.dy += (Math.random() - 0.5) * 0.1;
        }
        
        const maxSpeed = 1.5;
        const speed = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
        if (speed > maxSpeed) {
          p.dx = (p.dx / speed) * maxSpeed;
          p.dy = (p.dy / speed) * maxSpeed;
        }
        
        const hue = (220 + Math.sin(time + p.offset) * 50) % 360;
        drawPlanet(p.x, p.y, p.r, p.rotation, hue, p.type);
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', init);
    init();
    draw();