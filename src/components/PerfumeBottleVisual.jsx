import React, { useRef, useEffect } from 'react';

export default function PerfumeBottleVisual({ 
  liquidColor = "#3B2314", 
  accentGlow = "rgba(184, 154, 98, 0.4)",
  brandName = "İLLURÊ",
  perfumeName = "OUD WOOD",
  concentration = "PARFUM",
  className = "",
  interactive = true,
  height = 540
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    // Handle high DPI crisp rendering
    const width = canvas.parentElement ? canvas.parentElement.clientWidth : 400;
    const canvasHeight = height;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Particle system for ambient luxury dust
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * canvasHeight,
      size: Math.random() * 2 + 0.5,
      speedY: - (Math.random() * 0.4 + 0.1),
      opacity: Math.random() * 0.5 + 0.2
    }));

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - canvasHeight / 2;
      mouseRef.current.targetX = (x / (width / 2)) * 14;
      mouseRef.current.targetY = (y / (canvasHeight / 2)) * 14;
    };

    const parent = canvas.parentElement;
    if (parent && interactive) {
      parent.addEventListener('mousemove', handleMouseMove);
    }

    const render = () => {
      time += 0.02;

      // Smooth mouse damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const tiltX = mouseRef.current.x;
      const tiltY = mouseRef.current.y;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, canvasHeight);

      const centerX = width / 2 + tiltX;
      const centerY = canvasHeight / 2 + tiltY + Math.sin(time) * 4;

      // 1. Render Radial Ambient Backlight
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY - 20, 10,
        centerX, centerY - 20, 180
      );
      glowGradient.addColorStop(0, accentGlow || 'rgba(212, 175, 55, 0.35)');
      glowGradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.08)');
      glowGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, 200, 0, Math.PI * 2);
      ctx.fill();

      // 2. Render Gold Dust Floating Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < 0) p.y = canvasHeight;
        ctx.fillStyle = `rgba(230, 198, 135, ${p.opacity * (0.6 + Math.sin(time * 2 + p.x) * 0.3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bottle dimensions
      const bWidth = Math.min(width * 0.45, 180);
      const bHeight = bWidth * 1.55;
      const bLeft = centerX - bWidth / 2;
      const bTop = centerY - bHeight / 2 + 15;

      // 3. Drop Shadow under bottle
      const shadowGrad = ctx.createRadialGradient(
        centerX, bTop + bHeight + 25, 5,
        centerX, bTop + bHeight + 25, bWidth * 0.8
      );
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      shadowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, bTop + bHeight + 25, bWidth * 0.7, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4. Heavy Heavy Glass Body (Dark Obsidian Glass with Gold Rim)
      const glassGrad = ctx.createLinearGradient(bLeft, bTop, bLeft + bWidth, bTop + bHeight);
      glassGrad.addColorStop(0, '#1E2429');
      glassGrad.addColorStop(0.3, '#0C1013');
      glassGrad.addColorStop(0.7, '#080B0D');
      glassGrad.addColorStop(1, '#1A2126');

      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(bLeft, bTop, bWidth, bHeight, 16);
      ctx.fill();

      // Glass Outer Bevel / Border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5. Liquid Reservoir inside Glass
      const innerMargin = 14;
      const liquidTop = bTop + bHeight * 0.35;
      const liquidHeight = bHeight * 0.6;
      const liquidGrad = ctx.createLinearGradient(bLeft, liquidTop, bLeft + bWidth, liquidTop + liquidHeight);
      liquidGrad.addColorStop(0, liquidColor);
      liquidGrad.addColorStop(0.5, '#4A2A14');
      liquidGrad.addColorStop(1, '#1A0D06');

      ctx.fillStyle = liquidGrad;
      ctx.beginPath();
      ctx.roundRect(bLeft + innerMargin, liquidTop, bWidth - innerMargin * 2, liquidHeight, 8);
      ctx.fill();

      // Subtle Liquid Wave
      const waveY = liquidTop + Math.sin(time * 1.5) * 2;
      ctx.strokeStyle = 'rgba(255, 235, 180, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bLeft + innerMargin, waveY);
      ctx.lineTo(bLeft + bWidth - innerMargin, waveY);
      ctx.stroke();

      // 6. Gold Atomizer Cap (Metallic Champagne)
      const capWidth = bWidth * 0.42;
      const capHeight = 44;
      const capLeft = centerX - capWidth / 2;
      const capTop = bTop - capHeight - 6;

      // Cap Neck
      ctx.fillStyle = '#C5A059';
      ctx.fillRect(centerX - capWidth * 0.3, bTop - 8, capWidth * 0.6, 8);

      // Main Cap Body
      const capGrad = ctx.createLinearGradient(capLeft, capTop, capLeft + capWidth, capTop);
      capGrad.addColorStop(0, '#8C6F2D');
      capGrad.addColorStop(0.3, '#F5E6A3');
      capGrad.addColorStop(0.5, '#E6C687');
      capGrad.addColorStop(0.8, '#D4AF37');
      capGrad.addColorStop(1, '#664E1C');

      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.roundRect(capLeft, capTop, capWidth, capHeight, 4);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Horizontal grooves on cap for tactile luxury look
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const lineY = capTop + (capHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(capLeft + 2, lineY);
        ctx.lineTo(capLeft + capWidth - 2, lineY);
        ctx.stroke();
      }

      // 7. Glass Specular Highlights (Left Light Edge)
      const highlightGrad = ctx.createLinearGradient(bLeft, bTop, bLeft + 20, bTop);
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.beginPath();
      ctx.roundRect(bLeft + 2, bTop + 4, 18, bHeight - 8, [12, 0, 0, 12]);
      ctx.fill();

      // Right subtle edge reflection
      const rightGrad = ctx.createLinearGradient(bLeft + bWidth - 15, bTop, bLeft + bWidth, bTop);
      rightGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      rightGrad.addColorStop(1, 'rgba(212, 175, 55, 0.3)');
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.roundRect(bLeft + bWidth - 16, bTop + 4, 14, bHeight - 8, [0, 12, 12, 0]);
      ctx.fill();

      // 8. Luxury Metallic Label Plaque on Bottle
      const labelW = bWidth * 0.76;
      const labelH = bHeight * 0.38;
      const labelL = centerX - labelW / 2;
      const labelT = bTop + bHeight * 0.16;

      // Label background (Soft Matte Gold/Black Plaque)
      const labelGrad = ctx.createLinearGradient(labelL, labelT, labelL, labelT + labelH);
      labelGrad.addColorStop(0, '#14181B');
      labelGrad.addColorStop(1, '#090C0E');
      ctx.fillStyle = labelGrad;
      ctx.beginPath();
      ctx.roundRect(labelL, labelT, labelW, labelH, 2);
      ctx.fill();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner gold hairline border
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(labelL + 4, labelT + 4, labelW - 8, labelH - 8);

      // Label Typography
      ctx.textAlign = 'center';

      // Brand
      ctx.fillStyle = '#D4AF37';
      ctx.font = '600 11px "Cinzel", serif';
      ctx.letterSpacing = '3px';
      ctx.fillText(brandName.toUpperCase(), centerX, labelT + 22);

      // Perfume Name
      ctx.fillStyle = '#F4F1EA';
      ctx.font = '600 14px "Cormorant Garamond", serif';
      ctx.letterSpacing = '1px';
      ctx.fillText(perfumeName.toUpperCase(), centerX, labelT + 42);

      // Concentration
      ctx.fillStyle = '#A39E93';
      ctx.font = '400 8px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(concentration.toUpperCase(), centerX, labelT + labelH - 12);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (parent && interactive) {
        parent.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [liquidColor, accentGlow, brandName, perfumeName, concentration, interactive, height]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="block transition-transform duration-300 ease-out" />
    </div>
  );
}
