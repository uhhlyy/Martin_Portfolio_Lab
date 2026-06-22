import './index.css';

// =========================================================================
//  PERSONAL PORTFOLIO CONFIGURATION - EASY TO EDIT!
// =========================================================================
const PORTFOLIO_CONFIG = {
  name: "Ally Voldigoad",
  tagline: "Digital Alchemist & Creative Technologist",
  role: "Creative Developer",
  avatarImage: "/src/assets/images/ghibli_avatar_1782089311946.jpg",
  scenicLandscape: "/src/assets/images/ghibli_landscape_1782089329782.jpg",
  hobbiesIllustration: "/src/assets/images/ghibli_hobbies_1782089344317.jpg",
  
  introHeading: "Tending a quiet garden of curated, high-performance web spaces.",
  introParagraph: "I build fast, interactive web applications that feel warm, tactile, and responsive. Merging complex software design with fine typographic details, comfortable grids, and fluid animation cycles, my work seeks to restore magic, patience, and visual depth to modern user interfaces.",
  
  hobbies: [
    {
      title: "Tea Craft & Herbology",
      description: "Steeping steaming porcelain cups of chamomile, peppermint, and lavender to sharpen cognitive focus and clear the mind.",
      iconName: "leaf"
    },
    {
      title: "Cozy Modular Synths",
      description: "Sculpting tape-delay saturated ambient pads and analog waveforms that ripple softly alongside the steady rhythm of rain.",
      iconName: "music"
    },
    {
      title: "Analog Journaling",
      description: "Recording logic patterns, field sketches, and technical ideas inside yellowing grid paper notebooks using vintage fountain pens.",
      iconName: "book"
    },
    {
      title: "Nature Wandering",
      description: "Gathering forest artifacts, mapping winding paths, and listening closely to the rustle of sage-scented woodland breezes.",
      iconName: "compass"
    }
  ]
};

// =========================================================================
//  LANYARD SPRING PHYSICS SIMULATOR (VANILLA IMPLEMENTATION)
// =========================================================================
class LanyardPhysics {
  // Pivot anchor coordinates
  private anchorX = 0;
  private anchorY = 0;

  // Elastic card physics coordinates
  public cardX = 0;
  public cardY = 0;
  private vx = 0;
  private vy = 0;

  // Physical attributes
  private gravity = 0.55;
  private springStiffness = 0.045;
  private damping = 0.945;
  private restLength = 210; // Cable length

  // Interaction tracking
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardWidth = 320;
  private cardHeight = 480;

  // Dynamic 3D tilt tracking
  public tiltX = 0;
  public tiltY = 0;
  public tiltZ = 0;

  // DOM elements
  private container!: HTMLElement;
  private card!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor(containerId: string, cardId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
    this.card = document.getElementById(cardId) as HTMLElement;
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Place card initially directly below anchor
    this.cardX = this.anchorX;
    this.cardY = this.anchorY + this.restLength;

    this.setupInteractions();
    this.startLoop();
  }

  private resizeCanvas(): void {
    const parent = this.container.parentElement!;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    
    this.canvas.width = width;
    this.canvas.height = height;

    // Anchor is located at the horizontal center, 15px from the top
    this.anchorX = width / 2;
    this.anchorY = 15;
  }

  private setupInteractions(): void {
    const startDrag = (clientX: number, clientY: number) => {
      this.isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      this.dragStartX = mouseX - this.cardX;
      this.dragStartY = mouseY - this.cardY;
      
      this.card.classList.add('cursor-grabbing');
      this.card.classList.remove('cursor-grab');
    };

    const moveDrag = (clientX: number, clientY: number) => {
      if (!this.isDragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;

      // Update positions
      const nextX = mouseX - this.dragStartX;
      const nextY = mouseY - this.dragStartY;

      this.vx = (nextX - this.cardX) * 0.4;
      this.vy = (nextY - this.cardY) * 0.4;

      this.cardX = nextX;
      this.cardY = nextY;
    };

    const stopDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.card.classList.remove('cursor-grabbing');
      this.card.classList.add('cursor-grab');
    };

    // Card drag listeners
    this.card.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('.ignore-drag')) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      moveDrag(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      stopDrag();
    });

    // Mobile touch support
    this.card.addEventListener('touchstart', (e) => {
      if ((e.target as HTMLElement).closest('.ignore-drag')) return;
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchend', () => {
      stopDrag();
    });

    // Mouse tilt addition when merely hovering the card
    this.card.addEventListener('mousemove', (e) => {
      if (this.isDragging) return;
      const rect = this.card.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);

      // Interpolate additional slight tilt based on cursor placement
      const hoverTiltY = (x / (rect.width / 2)) * 12; // yaw
      const hoverTiltX = -(y / (rect.height / 2)) * 12; // pitch

      this.tiltX = (this.tiltX * 0.8) + (hoverTiltX * 0.2);
      this.tiltY = (this.tiltY * 0.8) + (hoverTiltY * 0.2);
    });

    this.card.addEventListener('mouseleave', () => {
      // Revert hover tilt back into physical orientation on mouseout
      this.tiltX *= 0.8;
      this.tiltY *= 0.8;
    });
  }

  private startLoop(): void {
    const loop = () => {
      this.updatePhysics();
      this.drawRope();
      this.renderDOM();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private updatePhysics(): void {
    if (this.isDragging) {
      // Direct drag velocity computation
      const maxDisplacement = this.restLength * 1.5;
      const dx = this.cardX - this.anchorX;
      const dy = this.cardY - this.anchorY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxDisplacement) {
        this.cardX = this.anchorX + (dx / dist) * maxDisplacement;
        this.cardY = this.anchorY + (dy / dist) * maxDisplacement;
      }
      return;
    }

    // Pendulum gravity, tension and drag equations
    const dx = this.cardX - this.anchorX;
    const dy = this.cardY - this.anchorY;
    const dist = Math.hypot(dx, dy);

    // Dynamic tension scaling with length
    const strain = dist - this.restLength;
    const forceTension = strain * this.springStiffness;

    // Forces projection
    const fx = -(dx / dist) * forceTension;
    const fy = -(dy / dist) * forceTension + this.gravity;

    // Add breeze oscillations for environmental aesthetic sway
    const time = Date.now() * 0.0012;
    const wildWind = Math.sin(time) * 0.035 + Math.cos(time * 0.5) * 0.015;

    this.vx = (this.vx + fx + wildWind) * this.damping;
    this.vy = (this.vy + fy) * this.damping;

    this.cardX += this.vx;
    this.cardY += this.vy;

    // Rigid safety constraint (hard anchor boundary)
    const safetyLimit = this.restLength * 1.35;
    const ddx = this.cardX - this.anchorX;
    const ddy = this.cardY - this.anchorY;
    const currDist = Math.hypot(ddx, ddy);
    if (currDist > safetyLimit) {
      this.cardX = this.anchorX + (ddx / currDist) * safetyLimit;
      this.cardY = this.anchorY + (ddy / currDist) * safetyLimit;
    }

    // Core inertial card tilt equations
    this.tiltY = (this.vx * -2.4) + (this.cardX - this.anchorX) * -0.055;
    this.tiltX = (this.vy * 1.5) + (this.cardY - this.anchorY - this.restLength) * 0.03;
    this.tiltZ = this.vx * 0.95;

    // Dampen angles nicely
    this.tiltY = Math.max(-50, Math.min(50, this.tiltY));
    this.tiltX = Math.max(-45, Math.min(45, this.tiltX));
    this.tiltZ = Math.max(-25, Math.min(25, this.tiltZ));
  }

  private drawRope(): void {
    const { canvas, ctx, anchorX, anchorY, cardX, cardY } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw card pivot point anchor (brass plate)
    ctx.beginPath();
    ctx.arc(anchorX, anchorY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#b44c33';
    ctx.fill();

    // Rope start coordinator (clasp link coordinate is centered on card's top hinge)
    const cardPivotX = cardX;
    const cardPivotY = cardY - (this.cardHeight / 2) + 2;

    // Compute beautiful rope bend (Midpoint sag based on swing speed and compression/extension)
    const midX = (anchorX + cardPivotX) / 2 + this.vx * 3.5;
    const springSag = Math.max(10, 30 + (this.restLength - Math.hypot(cardPivotX - anchorX, cardPivotY - anchorY)) * 0.8);
    const midY = (anchorY + cardPivotY) / 2 + springSag;

    // 1. Draw smooth ribbon shadow
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY + 3);
    ctx.quadraticCurveTo(midX, midY + 4, cardPivotX, cardPivotY + 3);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Draw colorful, luxury textured fabric ribbon
    const ribbonGrad = ctx.createLinearGradient(anchorX, anchorY, cardPivotX, cardPivotY);
    ribbonGrad.addColorStop(0, '#748E63'); // Sage Green
    ribbonGrad.addColorStop(0.5, '#9CB380'); // Mint Olive
    ribbonGrad.addColorStop(1, '#5e5349'); // Deep Brown Clasp Climax
    
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.quadraticCurveTo(midX, midY, cardPivotX, cardPivotY);
    ctx.strokeStyle = ribbonGrad;
    ctx.lineWidth = 11;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. Draw stylized inner gold stitch trace line
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.quadraticCurveTo(midX, midY, cardPivotX, cardPivotY);
    ctx.strokeStyle = 'rgba(234, 194, 105, 0.7)'; // Warm Gold Stitching
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash array

    // 4. Draw metal mounting clip/ring joining ribbon to the card
    ctx.beginPath();
    ctx.arc(cardPivotX, cardPivotY + 4, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#df6248'; // Terracotta loop
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cardPivotX, cardPivotY + 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#eac269'; // Gold bolt core
    ctx.fill();
  }

  private renderDOM(): void {
    // Transform coordinates relative to container placement
    const leftOffset = this.cardX - (this.cardWidth / 2);
    const topOffset = this.cardY - (this.cardHeight / 2);

    this.card.style.left = `${leftOffset}px`;
    this.card.style.top = `${topOffset}px`;

    // Apply 3D perspective orientation
    const inner = this.card.querySelector('.lanyard-card-inner') as HTMLElement;
    if (inner) {
      // Determine if currently flipped (180deg added to Y axis)
      const isFlipped = this.card.dataset.flipped === 'true';
      const flipRotation = isFlipped ? 180 : 0;
      
      const totalY = this.tiltY + flipRotation;
      // Note the extra sign flip on flipped card tilt to keep physical tilt matching gravity correctly
      const totalX = isFlipped ? -this.tiltX : this.tiltX;

      inner.style.transform = `rotateX(${totalX}deg) rotateY(${totalY}deg) rotateZ(${this.tiltZ}deg)`;

      // Draw glass shine overlay path
      const glareFront = this.card.querySelector('.glare-front') as HTMLElement;
      const glareBack = this.card.querySelector('.glare-back') as HTMLElement;

      if (glareFront) {
        // Adjust linear gradient reflection angles dynamically with sway
        const rotationGradAngle = 135 + this.tiltY + this.tiltX;
        const opacity = Math.max(0, 0.15 + (this.tiltY * -0.005));
        glareFront.style.background = `linear-gradient(${rotationGradAngle}deg, rgba(255, 255, 255, ${opacity * 1.5}) 0%, rgba(255, 255, 255, 0) 65%)`;
      }
      if (glareBack) {
        const rotationGradAngle = 135 - this.tiltY + this.tiltX;
        const opacity = Math.max(0, 0.15 + (this.tiltY * 0.005));
        glareBack.style.background = `linear-gradient(${rotationGradAngle}deg, rgba(255, 255, 255, ${opacity * 1.5}) 0%, rgba(255, 255, 255, 0) 65%)`;
      }
    }

    // Real-time 3D drop-shadow translation matches physical height
    const shadowElement = document.getElementById('card-shadow');
    if (shadowElement) {
      const parentRect = this.container.getBoundingClientRect();
      
      const shadowX = (this.cardX - parentRect.width / 2) * 0.45;
      const shadowY = (this.cardY - parentRect.height / 2) * 0.05 + 110;
      const scale = 1 - (Math.abs(this.cardY - this.anchorY - this.restLength) * 0.001);
      const blur = 24 + Math.abs(this.cardX - this.anchorX) * 0.08;

      shadowElement.style.transform = `translateX(${shadowX}px) translateY(${shadowY}px) scale(${scale})`;
      shadowElement.style.filter = `blur(${blur}px)`;
      shadowElement.style.opacity = `${0.12 - Math.abs(this.cardX - this.anchorX) * 0.0003}`;
    }
  }
}

// =========================================================================
//  PARALLAX SCROLL CONTROLLER
// =========================================================================
class ParallaxScroller {
  constructor() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.handleScroll(); // Trigger initial position setup
  }

  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Foreground decorative leaf translation values
    const layers = document.querySelectorAll('.parallax-layer');
    layers.forEach((layer) => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0');
      const rotateCoeff = parseFloat(layer.getAttribute('data-rotate') || '0');
      
      const yOffset = scrollTop * speed;
      const rotation = scrollTop * rotateCoeff;
      
      (layer as HTMLElement).style.transform = `translateY(${yOffset}px) rotate(${rotation}deg)`;
    });

    // Subtly adjust header bar blur dynamically
    const navBar = document.getElementById('navbar');
    if (navBar) {
      if (scrollTop > 40) {
        navBar.classList.add('glass-scrolled');
      } else {
        navBar.classList.remove('glass-scrolled');
      }
    }
  }
}

// =========================================================================
//  APPLICATION ENTRY INITIALIZER
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inflate Dynamic Portfolio Config Fields
  const elements = [
    { selector: '.user-name', text: PORTFOLIO_CONFIG.name },
    { selector: '.user-tagline', text: PORTFOLIO_CONFIG.tagline },
    { selector: '.user-role', text: PORTFOLIO_CONFIG.role },
    { selector: '.intro-heading', text: PORTFOLIO_CONFIG.introHeading },
    { selector: '.intro-paragraph', text: PORTFOLIO_CONFIG.introParagraph }
  ];

  elements.forEach((item) => {
    document.querySelectorAll(item.selector).forEach((el) => {
      el.textContent = item.text;
    });
  });

  // Inject user images
  document.querySelectorAll('.avatar-img').forEach((el) => {
    (el as HTMLImageElement).src = PORTFOLIO_CONFIG.avatarImage;
  });
  const hobbiesPic = document.getElementById('hobbies-pic') as HTMLImageElement;
  if (hobbiesPic) hobbiesPic.src = PORTFOLIO_CONFIG.hobbiesIllustration;

  const sceneryPic = document.getElementById('scenery-bg-container');
  if (sceneryPic) {
    sceneryPic.style.backgroundImage = `url(${PORTFOLIO_CONFIG.scenicLandscape})`;
  }

  // Populate dynamic hobbies list
  const hobbiesContainer = document.getElementById('hobbies-grid');
  if (hobbiesContainer) {
    hobbiesContainer.innerHTML = ''; // Clear stub items
    PORTFOLIO_CONFIG.hobbies.forEach((hobby) => {
      const card = document.createElement('div');
      card.className = "bg-white/45 glass border border-ghibli-green-deep/5 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-300 hover:border-[#748E63]/30 hover:-translate-y-1 group";
      
      // Select appropriate Lucide SVG icon paths visually matching
      let iconSvg = '';
      if (hobby.iconName === 'leaf') {
        iconSvg = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z"></path><path d="M9 22v-4h4"></path></svg>`;
      } else if (hobby.iconName === 'music') {
        iconSvg = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
      } else if (hobby.iconName === 'book') {
        iconSvg = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M6 6h10M6 10h10M6 14h10"></path></svg>`;
      } else {
        iconSvg = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`;
      }

      card.innerHTML = `
        <div class="w-11 h-11 rounded-full overflow-hidden bg-[#D0B8A8]/20 text-[#748E63] flex items-center justify-center mb-4 group-hover:bg-[#748E63] group-hover:text-white transition-all duration-500 border border-white">
          ${iconSvg}
        </div>
        <h3 class="font-sans text-xs font-bold uppercase tracking-widest text-[#748E63] mb-1.5">${hobby.title}</h3>
        <p class="font-serif text-sm text-[#5e5349] leading-relaxed italic">${hobby.description}</p>
      `;
      hobbiesContainer.appendChild(card);
    });
  }

  // 2. Initialize physics engine & parallax scroll modules
  const canvas = document.getElementById('lanyard-canvas') as HTMLCanvasElement;
  if (canvas) {
    new LanyardPhysics('lanyard-wrapper', 'lanyard-card', 'lanyard-canvas');
  }
  new ParallaxScroller();

  // 3. ID Card Flip Action (Rotation Controller)
  const lanyardCard = document.getElementById('lanyard-card');
  const flipTrigger = document.getElementById('badge-flip-btn');
  if (lanyardCard && flipTrigger) {
    const runFlip = () => {
      const flipped = lanyardCard.dataset.flipped === 'true';
      lanyardCard.dataset.flipped = flipped ? 'false' : 'true';
      
      // Temporary vibration impulse for haptic satisfaction
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    };
    
    flipTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      runFlip();
    });

    // Allow clicking double-tap on card body to flip as well
    let lastTap = 0;
    lanyardCard.addEventListener('touchend', (e) => {
      if ((e.target as HTMLElement).closest('.ignore-drag')) return;
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        runFlip();
      }
      lastTap = currentTime;
    });

    lanyardCard.addEventListener('dblclick', (e) => {
      if ((e.target as HTMLElement).closest('.ignore-drag')) return;
      e.preventDefault();
      runFlip();
    });
  }

  // 4. Smooth Anchor-links Scrolling Handler
  const navButtons = document.querySelectorAll('[data-scroll-to]');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = btn.getAttribute('data-scroll-to');
      if (sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // 5. Contact Form Micro-Interactions
  const contactForm = document.getElementById('portfolio-contact-form') as HTMLFormElement;
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameVal = (document.getElementById('form-name') as HTMLInputElement).value;
      const emailVal = (document.getElementById('form-email') as HTMLInputElement).value;
      const msgVal = (document.getElementById('form-message') as HTMLTextAreaElement).value;

      if (!nameVal || !emailVal || !msgVal) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]') as HTMLButtonElement;
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg> Sending Letter...
      `;

      // Simulating realistic post-buffer delay
      setTimeout(() => {
        submitBtn.innerHTML = `📬 Letter Sent successfully!`;
        submitBtn.classList.remove('bg-[#748E63]', 'hover:bg-[#5f7451]');
        submitBtn.classList.add('bg-ghibli-green-deep');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('bg-ghibli-green-deep');
          submitBtn.classList.add('bg-[#748E63]', 'hover:bg-[#5f7451]');
        }, 3500);
      }, 1500);
    });
  }
});
