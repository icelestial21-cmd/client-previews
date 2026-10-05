/**
 * STUDIO SHOWCASE — JAVASCRIPT CONTROLLER
 * Zero-dependency interactive playground & client flagship switcher
 */

(function () {
  'use strict';

  // Component Lab Manifest
  const LAB_COMPONENTS = {
    'sheet-stack': {
      title: '3D Layered Sheet Stack',
      url: 'components/sheet_stack.html',
      tech: 'CSS 3D Transforms (preserve-3d), pointer gesture dragging, spring dismissal physics',
      license: 'Zero-Rent Sovereign (Reverse-Engineered from HorizonX)'
    },
    'planetrise': {
      title: 'Planetrise WebGL Celestial Shader',
      url: 'shaders/planetrise.html',
      tech: 'WebGL2 fragment shader, Raymarched spherical limb, atmospheric Rayleigh scattering, dynamic pointer flare',
      license: 'Zero-Rent Sovereign (Extracted & Reconstructed)'
    },
    'text-ring': {
      title: 'Kinetic Vector Text Ring',
      url: 'components/text_ring.html',
      tech: 'SVG textPath curvature, pointer angular velocity tracking, elastic RPM damping',
      license: 'Zero-Rent Sovereign'
    },
    'luminous-card': {
      title: 'Luminous Slit Directional Lighting Card',
      url: 'components/luminous_card.html',
      tech: 'CSS custom properties (--mouse-x, --mouse-y), traveling aperture highlight, sub-pixel ambient bloom',
      license: 'Zero-Rent Sovereign'
    },
    'magnetic-button': {
      title: 'Magnetic Gravitational CTA Button',
      url: 'components/magnetic_button.html',
      tech: 'Elastic proximity attraction, two-stage vector offset (text + badge), damped spring return',
      license: 'Zero-Rent Sovereign'
    }
  };

  // Lab Tab Switching
  const labTabs = document.querySelectorAll('.lab-tab');
  const labIframe = document.getElementById('labIframe');
  const labCaptionTitle = document.getElementById('labCaptionTitle');
  const labCaptionTech = document.getElementById('labCaptionTech');

  if (labTabs.length && labIframe) {
    labTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const componentKey = tab.getAttribute('data-component');
        if (!componentKey || !LAB_COMPONENTS[componentKey]) return;

        // Active State
        labTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update Stage
        const comp = LAB_COMPONENTS[componentKey];
        labIframe.src = comp.url;
        if (labCaptionTitle) labCaptionTitle.textContent = comp.title;
        if (labCaptionTech) labCaptionTech.textContent = comp.tech;
      });
    });
  }

  // Animated Number Counters on Scroll
  const metricNums = document.querySelectorAll('.metric-num');
  let metricsAnimated = false;

  function animateMetrics() {
    if (metricsAnimated) return;
    const heroBar = document.querySelector('.hero-metrics-bar');
    if (!heroBar) return;

    const rect = heroBar.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) {
      metricsAnimated = true;
      metricNums.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target') || '0');
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;

        let current = 0;
        const duration = 1200;
        const stepTime = 20;
        const increment = target / (duration / stepTime);

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = `${prefix}${isDecimal ? current.toFixed(1) : Math.floor(current)}${suffix}`;
        }, stepTime);
      });
    }
  }

  window.addEventListener('scroll', animateMetrics, { passive: true });
  animateMetrics();

  // Smooth Scroll for Nav Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
