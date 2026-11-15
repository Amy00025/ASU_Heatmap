'use client';

import Image from 'next/image';
import { Activity, ArrowRight, ArrowUpRight, Flame, MapPin } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <main className="welcome-screen" aria-label="ASU Sun Devil Crowd Tracker">
      <div className="welcome-orbit welcome-orbit-one" />
      <div className="welcome-orbit welcome-orbit-two" />

      <header className="welcome-header">
        <div className="welcome-brand">
          <div className="welcome-brand-mark">
            <Flame aria-hidden="true" size={22} />
          </div>
          <div>
            <span className="welcome-brand-name">SUN DEVIL</span>
            <span className="welcome-brand-subtitle">CAMPUS PULSE</span>
          </div>
        </div>
        <div className="welcome-campus-tag">
          <span className="welcome-status-dot" />
          ARIZONA STATE · TEMPE
        </div>
      </header>

      <section className="welcome-content">
        <div className="welcome-copy">
          <div className="welcome-eyebrow">
            <Activity aria-hidden="true" size={14} />
            YOUR CAMPUS, AT A GLANCE
          </div>
          <h1>
            Find your
            <br />
            <span>flow</span> on campus.
          </h1>
          <p className="welcome-description">
            Check the campus pulse before you head out. Find a quiet study spot,
            beat the gym rush, and make every Sun Devil minute count.
          </p>

          <button className="welcome-enter-button" onClick={onEnter}>
            Explore the heatmap
            <ArrowRight aria-hidden="true" size={18} />
          </button>
          <p className="welcome-auto-note">
            Your live campus dashboard is ready
            <span className="welcome-loading-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>

          <div className="welcome-promise">
            <span className="welcome-promise-line" />
            BY THE STUDENT, FOR THE STUDENT
          </div>
        </div>

        <div className="welcome-visual" aria-label="Illustration of the ASU campus heatmap">
          <div className="welcome-map-card">
            <div className="welcome-map-topline">
              <div>
                <span className="welcome-map-kicker">CAMPUS PULSE</span>
                <span className="welcome-map-location">
                  <MapPin aria-hidden="true" size={12} />
                  TEMPE, ARIZONA
                </span>
              </div>
              <span className="welcome-live-tag">
                <span className="welcome-status-dot" />
                LIVE
              </span>
            </div>

            <div className="welcome-map">
              <div className="welcome-map-block welcome-map-block-one" />
              <div className="welcome-map-block welcome-map-block-two" />
              <div className="welcome-map-block welcome-map-block-three" />
              <div className="welcome-map-block welcome-map-block-four" />
              <div className="welcome-map-park" />
              <svg
                className="welcome-map-route"
                viewBox="0 0 420 300"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M66 242C110 224 112 176 163 174C214 172 208 117 258 117C306 117 305 75 361 57"
                  pathLength="1"
                />
              </svg>
              <div className="welcome-map-pin welcome-pin-library">
                <span />
                <div className="welcome-pin-label">HAYDEN LIBRARY</div>
              </div>
              <div className="welcome-map-pin welcome-pin-fitness">
                <span />
                <div className="welcome-pin-label">SDFC</div>
              </div>
              <div className="welcome-map-label welcome-map-label-one">PALM WALK</div>
              <div className="welcome-map-label welcome-map-label-two">SUN DEVIL WAY</div>
              <div className="welcome-map-compass">N</div>
            </div>

            <div className="welcome-map-footer">
              <div className="welcome-map-metric">
                <span className="welcome-metric-dot metric-gold" />
                <span>STUDY</span>
                <strong>Quiet spots</strong>
              </div>
              <span className="welcome-map-divider" />
              <div className="welcome-map-metric">
                <span className="welcome-metric-dot metric-maroon" />
                <span>FITNESS</span>
                <strong>Live crowd levels</strong>
              </div>
              <ArrowUpRight
                className="welcome-map-arrow"
                aria-hidden="true"
                size={17}
              />
            </div>
          </div>
          <figure className="welcome-sparky-card">
            <Image
              src="/sparky-mascot.jpeg"
              alt="Sparky the Sun Devil holding a pitchfork"
              width={700}
              height={1000}
              priority
            />
            <figcaption>FORKS UP</figcaption>
          </figure>
          <div className="welcome-float-card">
            <span className="welcome-float-icon">
              <Activity aria-hidden="true" size={15} />
            </span>
            <span>
              <strong>Campus, in the moment</strong>
              <small>Know before you go</small>
            </span>
            <span className="welcome-float-pulse" />
          </div>
          <div className="welcome-sunburst" />
        </div>
      </section>

      <footer className="welcome-footer">
        <span>ASU SUN DEVIL CROWD TRACKER</span>
        <span className="welcome-footer-center">
          BUILT FOR THE TEMPE COMMUNITY
        </span>
        <button className="welcome-skip-button" onClick={onEnter}>
          Skip intro <ArrowRight aria-hidden="true" size={14} />
        </button>
      </footer>
    </main>
  );
}
