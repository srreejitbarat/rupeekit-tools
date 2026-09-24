'use client';

export default function HeroMotionBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="hero-motion-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(74,222,128,0.18),transparent_28%),radial-gradient(circle_at_50%_88%,rgba(14,165,233,0.14),transparent_34%),linear-gradient(135deg,#082b78_0%,#07327d_46%,#03183e_100%)]" />

      <div className="hero-scene absolute inset-0">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-orb hero-orb-three" />

        <div className="hero-ring hero-ring-one" />
        <div className="hero-ring hero-ring-two" />

        <div className="hero-icon-badge hero-icon-calculator" title="Calculator">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="3" width="14" height="18" rx="3" />
            <path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 19h2m4 0h2" />
          </svg>
        </div>

        <div className="hero-icon-badge hero-icon-rupee" title="Rupee">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 5h12M6 9h12M7 5c5 0 7 2 7 4s-2 4-7 4h-1l8 7" />
          </svg>
        </div>

        <div className="hero-icon-badge hero-icon-chart" title="Growth chart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" />
            <path d="m4 8 5-3 5 4 6-5" />
          </svg>
        </div>

        <div className="hero-icon-badge hero-icon-wallet" title="Wallet">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11H6.5A2.5 2.5 0 0 1 4 15.5v-8Z" />
            <path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z" />
          </svg>
        </div>

        <div className="hero-icon-badge hero-icon-document" title="Tax document">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 3h8l4 4v14H6V3Z" />
            <path d="M14 3v5h4M9 12h6M9 16h6" />
          </svg>
        </div>

        <div className="hero-icon-badge hero-icon-shield" title="Privacy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <div className="hero-grid-wrap">
          <div className="hero-grid" />
        </div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_42%,rgba(2,17,48,0.18)_72%,rgba(2,17,48,0.52)_100%)]" />

      <style jsx global>{`
        section:has(.hero-motion-backdrop) > div.relative {
          isolation: isolate;
        }
      `}</style>

      <style jsx>{`
        .hero-scene {
          perspective: 1400px;
          transform-style: preserve-3d;
        }

        .hero-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(18px);
          opacity: 0.7;
          transform: translateZ(0);
          will-change: transform;
          animation: hero-orb-float 15s ease-in-out infinite;
        }

        .hero-orb-one {
          left: -5rem;
          top: 22%;
          width: 22rem;
          height: 22rem;
          background: radial-gradient(circle at 35% 35%, rgba(96, 165, 250, 0.48), rgba(37, 99, 235, 0.04) 68%);
        }

        .hero-orb-two {
          right: -4rem;
          top: 6%;
          width: 27rem;
          height: 27rem;
          background: radial-gradient(circle at 45% 45%, rgba(74, 222, 128, 0.3), rgba(22, 163, 74, 0.02) 70%);
          animation-delay: -5s;
          animation-duration: 18s;
        }

        .hero-orb-three {
          left: 44%;
          bottom: -9rem;
          width: 20rem;
          height: 20rem;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.24), rgba(14, 116, 144, 0.02) 70%);
          animation-delay: -9s;
          animation-duration: 17s;
        }

        .hero-ring {
          position: absolute;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 9999px;
          box-shadow: inset 0 0 35px rgba(255, 255, 255, 0.03), 0 0 45px rgba(96, 165, 250, 0.05);
          transform-style: preserve-3d;
          animation: hero-ring-drift 17s ease-in-out infinite;
        }

        .hero-ring-one {
          right: 7%;
          top: 16%;
          width: 23rem;
          height: 23rem;
          transform: rotateX(62deg) rotateZ(-18deg);
        }

        .hero-ring-two {
          left: 5%;
          top: 30%;
          width: 15rem;
          height: 15rem;
          transform: rotateX(68deg) rotateZ(24deg);
          animation-delay: -8s;
          animation-duration: 20s;
        }

        .hero-icon-badge {
          position: absolute;
          width: 4.4rem;
          height: 4.4rem;
          display: grid;
          place-items: center;
          border-radius: 1.35rem;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.045));
          box-shadow:
            0 22px 62px rgba(1, 12, 35, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.17),
            0 0 38px rgba(74, 222, 128, 0.06);
          backdrop-filter: blur(12px);
          color: rgba(220, 252, 231, 0.92);
          transform-style: preserve-3d;
          will-change: transform;
          animation: hero-icon-float 14s ease-in-out infinite;
        }

        .hero-icon-badge::after {
          content: '';
          position: absolute;
          inset: 0.45rem;
          border-radius: 0.95rem;
          border: 1px solid rgba(134, 239, 172, 0.1);
          background: radial-gradient(circle at 35% 25%, rgba(134, 239, 172, 0.09), transparent 62%);
        }

        .hero-icon-badge svg {
          position: relative;
          z-index: 1;
          width: 2rem;
          height: 2rem;
          filter: drop-shadow(0 0 14px rgba(74, 222, 128, 0.2));
        }

        .hero-icon-calculator {
          left: 4.5%;
          top: 17%;
          --base-transform: rotateY(18deg) rotateZ(-7deg) translateZ(36px);
          animation-delay: -1s;
        }

        .hero-icon-rupee {
          right: 5.5%;
          top: 22%;
          --base-transform: rotateY(-18deg) rotateZ(7deg) translateZ(48px);
          animation-delay: -5s;
          animation-duration: 16s;
        }

        .hero-icon-chart {
          right: 7.5%;
          bottom: 13%;
          --base-transform: rotateY(-13deg) rotateZ(-5deg) translateZ(34px);
          animation-delay: -8s;
          animation-duration: 17s;
        }

        .hero-icon-wallet {
          left: 8.5%;
          bottom: 12%;
          --base-transform: rotateY(15deg) rotateZ(6deg) translateZ(30px);
          animation-delay: -10s;
          animation-duration: 18s;
        }

        .hero-icon-document {
          left: 19%;
          top: 8%;
          width: 3.7rem;
          height: 3.7rem;
          --base-transform: rotateY(10deg) rotateZ(9deg) translateZ(20px);
          animation-delay: -3s;
          animation-duration: 19s;
          opacity: 0.72;
        }

        .hero-icon-shield {
          right: 19%;
          top: 7%;
          width: 3.7rem;
          height: 3.7rem;
          --base-transform: rotateY(-10deg) rotateZ(-8deg) translateZ(22px);
          animation-delay: -12s;
          animation-duration: 20s;
          opacity: 0.72;
        }

        .hero-grid-wrap {
          position: absolute;
          left: -10%;
          right: -10%;
          top: 48%;
          bottom: -30%;
          perspective: 1000px;
          overflow: hidden;
          opacity: 0.33;
          mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.78) 27%, #000 100%);
        }

        .hero-grid {
          position: absolute;
          inset: -15% -10%;
          transform-origin: center top;
          transform: rotateX(68deg) scale(1.12);
          background-image:
            linear-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
          background-size: 58px 58px;
          animation: hero-grid-travel 15s linear infinite;
        }

        @keyframes hero-orb-float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -22px, 0) scale(1.06); }
        }

        @keyframes hero-ring-drift {
          0%, 100% { opacity: 0.34; filter: brightness(1); }
          50% { opacity: 0.56; filter: brightness(1.2); }
        }

        @keyframes hero-icon-float {
          0%, 100% { transform: var(--base-transform) translate3d(0, 0, 0) scale(1); }
          50% { transform: var(--base-transform) translate3d(0, -16px, 0) scale(1.04); }
        }

        @keyframes hero-grid-travel {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 0 58px, 58px 0; }
        }

        @media (max-width: 1023px) {
          .hero-icon-document,
          .hero-icon-shield {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .hero-icon-badge {
            width: 3.25rem;
            height: 3.25rem;
            border-radius: 1rem;
            opacity: 0.46;
          }

          .hero-icon-badge svg {
            width: 1.45rem;
            height: 1.45rem;
          }

          .hero-icon-calculator {
            left: -0.8rem;
            top: 17%;
          }

          .hero-icon-rupee {
            right: -0.75rem;
            top: 26%;
          }

          .hero-icon-chart {
            right: -0.75rem;
            bottom: 15%;
          }

          .hero-icon-wallet {
            left: -0.85rem;
            bottom: 15%;
          }

          .hero-ring-one {
            right: -7rem;
          }

          .hero-ring-two {
            left: -7rem;
          }

          .hero-grid-wrap {
            top: 57%;
            opacity: 0.24;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-orb,
          .hero-ring,
          .hero-icon-badge,
          .hero-grid {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
