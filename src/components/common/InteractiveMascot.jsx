import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function InteractiveMascot({ 
  role = 'mahasiswa', 
  activeField = '', // 'email', 'password', or ''
  inputLength = 0,
  showPassword = false,
  isSuccess = false 
}) {
  const svgRef = useRef(null);
  const headRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const leftEyelidRef = useRef(null);
  const rightEyelidRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const glassesRef = useRef(null);
  const hatRef = useRef(null);

  // Idle Animation Loop
  useEffect(() => {
    if (activeField === 'password' || isSuccess) return;

    const ctx = gsap.context(() => {
      // Natural breathing animation
      gsap.to(headRef.current, {
        y: -4,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Subtle arm breathing sway
      gsap.to([leftArmRef.current, rightArmRef.current], {
        y: 2,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Academic hat floating
      if (hatRef.current) {
        gsap.to(hatRef.current, {
          rotate: 2,
          y: -2,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }, svgRef);

    return () => ctx.revert();
  }, [activeField, isSuccess]);

  // Handle Email Input Typing (Eye Pupils Tracking)
  useEffect(() => {
    if (activeField === 'email' || activeField === 'text' || activeField === 'nim') {
      // Calculate eye offset based on text length (clamp between -18 and 18)
      const maxOffset = 18;
      const calcX = Math.min(Math.max((inputLength - 12) * 1.5, -maxOffset), maxOffset);
      const calcY = 6; // Look down towards the input box

      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: calcX,
        y: calcY,
        duration: 0.25,
        ease: "power2.out"
      });

      // Head tilts slightly toward text
      gsap.to(headRef.current, {
        rotate: calcX * 0.2,
        y: 2,
        duration: 0.3,
        ease: "power2.out"
      });

      // Hands resting down
      gsap.to(leftArmRef.current, { x: 0, y: 0, rotate: 0, duration: 0.4, ease: "back.out(1.4)" });
      gsap.to(rightArmRef.current, { x: 0, y: 0, rotate: 0, duration: 0.4, ease: "back.out(1.4)" });
    } else if (activeField === '') {
      // Reset pupils to center
      gsap.to([leftPupilRef.current, rightPupilRef.current], {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to(headRef.current, {
        rotate: 0,
        duration: 0.4,
        ease: "power2.out"
      });
      gsap.to([leftArmRef.current, rightArmRef.current], {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.4,
        ease: "power2.out"
      });
    }
  }, [activeField, inputLength]);

  // Handle Password Field (Covering Eyes & Peeking)
  useEffect(() => {
    if (activeField === 'password') {
      if (showPassword) {
        // PEEKING ANIMATION: Left arm covers eye, right arm lowers slightly so mascot peeks!
        gsap.to(leftArmRef.current, {
          x: 25,
          y: -58,
          rotate: -20,
          duration: 0.4,
          ease: "back.out(1.7)"
        });

        gsap.to(rightArmRef.current, {
          x: -25,
          y: -32, // Lower right arm to peek
          rotate: 35,
          duration: 0.4,
          ease: "back.out(1.7)"
        });

        // Pupils peek right
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: 8,
          y: 2,
          scale: 1,
          duration: 0.3
        });
      } else {
        // FULL COVERING EYES
        gsap.to(leftArmRef.current, {
          x: 26,
          y: -58,
          rotate: -15,
          duration: 0.45,
          ease: "back.out(1.7)"
        });

        gsap.to(rightArmRef.current, {
          x: -26,
          y: -58,
          rotate: 15,
          duration: 0.45,
          ease: "back.out(1.7)"
        });

        // Pupils shrink slightly when covered
        gsap.to([leftPupilRef.current, rightPupilRef.current], {
          x: 0,
          y: 0,
          scale: 0.8,
          duration: 0.3
        });
      }
    }
  }, [activeField, showPassword]);

  // Celebration / Success State
  useEffect(() => {
    if (isSuccess) {
      // Raise arms in cheer!
      gsap.to(leftArmRef.current, {
        x: 10,
        y: -80,
        rotate: -45,
        duration: 0.5,
        ease: "back.out(2)"
      });
      gsap.to(rightArmRef.current, {
        x: -10,
        y: -80,
        rotate: 45,
        duration: 0.5,
        ease: "back.out(2)"
      });

      // Jump animation
      gsap.to(headRef.current, {
        y: -18,
        duration: 0.3,
        repeat: 3,
        yoyo: true,
        ease: "power2.out"
      });
    }
  }, [isSuccess]);

  return (
    <div className="mascot-wrapper">
      <svg
        ref={svgRef}
        width="160"
        height="150"
        viewBox="0 0 200 190"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Gradient Shading Definitions */}
          <linearGradient id="bodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>

          <linearGradient id="bellyGrad" x1="70" y1="90" x2="130" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>

          <linearGradient id="earGrad" x1="0" y1="0" x2="30" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </radialGradient>

          <linearGradient id="hatGrad" x1="50" y1="0" x2="150" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="goldGrad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Shadow base */}
        <ellipse cx="100" cy="180" rx="60" ry="8" fill="rgba(0,0,0,0.3)" filter="blur(4px)" />

        {/* Mascot Main Body & Head Container */}
        <g ref={headRef} filter="url(#dropShadow)">
          {/* Ears */}
          <path d="M 45 45 C 30 15, 65 10, 68 40 Z" fill="url(#bodyGrad)" />
          <path d="M 50 42 C 40 22, 60 18, 62 38 Z" fill="url(#earGrad)" />

          <path d="M 155 45 C 170 15, 135 10, 132 40 Z" fill="url(#bodyGrad)" />
          <path d="M 150 42 C 160 22, 140 18, 138 38 Z" fill="url(#earGrad)" />

          {/* Main Rounded Head & Body */}
          <path d="M 40 85 C 40 40, 160 40, 160 85 C 160 145, 140 170, 100 170 C 60 170, 40 145, 40 85 Z" fill="url(#bodyGrad)" />
          
          {/* Belly Patch */}
          <path d="M 65 110 C 65 90, 135 90, 135 110 C 135 155, 120 165, 100 165 C 80 165, 65 155, 65 110 Z" fill="url(#bellyGrad)" />

          {/* Cute Snout/Nose */}
          <ellipse cx="100" cy="98" rx="14" ry="10" fill="#ffffff" />
          <path d="M 95 95 C 98 92, 102 92, 105 95 C 105 98, 95 98, 95 95 Z" fill="#1e1b4b" />
          
          {/* Cute Mouth */}
          <path d="M 94 101 Q 100 106 106 101" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Left Eye */}
          <g>
            <circle cx="72" cy="76" r="15" fill="#ffffff" />
            <circle cx="72" cy="76" r="14" fill="#0f172a" />
            <circle ref={leftPupilRef} cx="72" cy="76" r="7" fill="url(#eyeGlow)" />
            {/* Eye sparkle highlight */}
            <circle cx="70" cy="73" r="2.5" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g>
            <circle cx="128" cy="76" r="15" fill="#ffffff" />
            <circle cx="128" cy="76" r="14" fill="#0f172a" />
            <circle ref={rightPupilRef} cx="128" cy="76" r="7" fill="url(#eyeGlow)" />
            {/* Eye sparkle highlight */}
            <circle cx="126" cy="73" r="2.5" fill="#ffffff" />
          </g>

          {/* Cheeks Glow */}
          <ellipse cx="56" cy="88" rx="7" ry="4" fill="#f472b6" opacity="0.6" />
          <ellipse cx="144" cy="88" rx="7" ry="4" fill="#f472b6" opacity="0.6" />

          {/* ROLE ACCESSORIES */}
          {role === 'mahasiswa' && (
            /* Academic Toga Graduation Cap */
            <g ref={hatRef} transform="translate(0, -5)">
              <polygon points="100,20 160,35 100,50 40,35" fill="url(#hatGrad)" />
              <rect x="75" y="38" width="50" height="14" rx="4" fill="#0f172a" />
              {/* Tassel */}
              <path d="M 100 35 L 145 42 L 145 58" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="145" cy="60" r="4" fill="url(#goldGrad)" />
            </g>
          )}

          {role === 'dosen' && (
            /* Dosen DPL Smart Glasses & Badge */
            <g ref={glassesRef}>
              <circle cx="72" cy="76" r="17" stroke="url(#goldGrad)" strokeWidth="3" fill="none" />
              <circle cx="128" cy="76" r="17" stroke="url(#goldGrad)" strokeWidth="3" fill="none" />
              <line x1="89" y1="76" x2="111" y2="76" stroke="url(#goldGrad)" strokeWidth="3" />
              <line x1="55" y1="74" x2="42" y2="68" stroke="url(#goldGrad)" strokeWidth="2.5" />
              <line x1="145" y1="74" x2="158" y2="68" stroke="url(#goldGrad)" strokeWidth="2.5" />
              {/* DPL Tie */}
              <polygon points="100,105 106,112 103,135 100,138 97,135 94,112" fill="#ef4444" />
            </g>
          )}

          {/* Left Paws / Arm */}
          <g ref={leftArmRef}>
            <ellipse cx="42" cy="135" rx="14" ry="18" fill="url(#bodyGrad)" transform="rotate(20 42 135)" />
            <ellipse cx="42" cy="138" rx="8" ry="10" fill="#c7d2fe" transform="rotate(20 42 135)" />
          </g>

          {/* Right Paws / Arm */}
          <g ref={rightArmRef}>
            <ellipse cx="158" cy="135" rx="14" ry="18" fill="url(#bodyGrad)" transform="rotate(-20 158 135)" />
            <ellipse cx="158" cy="138" rx="8" ry="10" fill="#c7d2fe" transform="rotate(-20 158 135)" />
          </g>
        </g>
      </svg>
    </div>
  );
}
