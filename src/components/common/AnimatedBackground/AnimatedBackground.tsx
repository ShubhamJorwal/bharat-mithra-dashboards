import { useEffect, useRef } from 'react';
import './AnimatedBackground.scss';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'subtle' | 'vibrant';
}

const AnimatedBackground = ({ variant = 'default' }: AnimatedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Store context in a const that TypeScript knows is non-null
    const context = ctx;

    // Canvas dimensions (updated on resize)
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    // Set canvas size
    const resizeCanvas = () => {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;

        const colors = ['#0052CC', '#36B37E', '#FFAB00', '#6554C0'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvasWidth) this.x = 0;
        if (this.x < 0) this.x = canvasWidth;
        if (this.y > canvasHeight) this.y = 0;
        if (this.y < 0) this.y = canvasHeight;
      }

      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;
        context.fill();
        context.globalAlpha = 1;
      }
    }

    // Line class for connecting particles
    class Line {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      opacity: number;
      speed: number;
      angle: number;
      length: number;

      constructor() {
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 100 + 50;
        this.startX = Math.random() * canvasWidth;
        this.startY = Math.random() * canvasHeight;
        this.endX = this.startX + Math.cos(this.angle) * this.length;
        this.endY = this.startY + Math.sin(this.angle) * this.length;
        this.opacity = Math.random() * 0.15 + 0.05;
        this.speed = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.startX += this.speed;
        this.startY += this.speed * 0.3;
        this.endX = this.startX + Math.cos(this.angle) * this.length;
        this.endY = this.startY + Math.sin(this.angle) * this.length;

        if (this.startX > canvasWidth + 100) {
          this.startX = -100;
          this.startY = Math.random() * canvasHeight;
        }
        if (this.startY > canvasHeight + 100) {
          this.startY = -100;
        }
      }

      draw() {
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(this.endX, this.endY);
        context.strokeStyle = '#0052CC';
        context.globalAlpha = this.opacity;
        context.lineWidth = 1;
        context.stroke();
        context.globalAlpha = 1;
      }
    }

    // Floating shape class
    class FloatingShape {
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      speedY: number;
      type: 'circle' | 'square' | 'triangle' | 'hexagon';
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 30 + 10;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.speedY = Math.random() * 0.3 + 0.1;

        const types: ('circle' | 'square' | 'triangle' | 'hexagon')[] = ['circle', 'square', 'triangle', 'hexagon'];
        this.type = types[Math.floor(Math.random() * types.length)];

        const colors = ['#0052CC', '#36B37E', '#FFAB00', '#6554C0', '#FF5630'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.08 + 0.02;
      }

      update() {
        this.y -= this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y < -this.size) {
          this.y = canvasHeight + this.size;
          this.x = Math.random() * canvasWidth;
        }
      }

      draw() {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.globalAlpha = this.opacity;
        context.strokeStyle = this.color;
        context.lineWidth = 1.5;

        switch (this.type) {
          case 'circle':
            context.beginPath();
            context.arc(0, 0, this.size, 0, Math.PI * 2);
            context.stroke();
            break;
          case 'square':
            context.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
            break;
          case 'triangle':
            context.beginPath();
            context.moveTo(0, -this.size);
            context.lineTo(-this.size, this.size);
            context.lineTo(this.size, this.size);
            context.closePath();
            context.stroke();
            break;
          case 'hexagon':
            context.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i;
              const x = Math.cos(angle) * this.size;
              const y = Math.sin(angle) * this.size;
              if (i === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            }
            context.closePath();
            context.stroke();
            break;
        }

        context.restore();
        context.globalAlpha = 1;
      }
    }

    // Create particles, lines, and shapes based on variant
    const particleCount = variant === 'vibrant' ? 80 : variant === 'subtle' ? 30 : 50;
    const lineCount = variant === 'vibrant' ? 20 : variant === 'subtle' ? 5 : 12;
    const shapeCount = variant === 'vibrant' ? 15 : variant === 'subtle' ? 5 : 10;

    const particles: Particle[] = [];
    const lines: Line[] = [];
    const shapes: FloatingShape[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    for (let i = 0; i < lineCount; i++) {
      lines.push(new Line());
    }
    for (let i = 0; i < shapeCount; i++) {
      shapes.push(new FloatingShape());
    }

    // Connect nearby particles with lines
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = '#0052CC';
            context.globalAlpha = 0.05 * (1 - distance / 120);
            context.lineWidth = 0.5;
            context.stroke();
            context.globalAlpha = 1;
          }
        }
      }
    };

    // Animation loop
    let animationId: number;
    const animate = () => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      // Update and draw lines
      lines.forEach(line => {
        line.update();
        line.draw();
      });

      // Update and draw shapes
      shapes.forEach(shape => {
        shape.update();
        shape.draw();
      });

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Connect particles
      connectParticles();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant]);

  return (
    <div className={`bm-animated-bg bm-animated-bg--${variant}`}>
      <canvas ref={canvasRef} className="bm-animated-canvas" />
      <div className="bm-gradient-overlay" />
    </div>
  );
};

export default AnimatedBackground;
