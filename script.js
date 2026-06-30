// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Canvas setup
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const frameCount = 192;
const currentFrame = index => (
    `webpimages/${index.toString().padStart(5, '0')}.webp`
);

const images = [];
const sequence = {
    frame: 0
};

// Preload images
let imagesLoaded = 0;
const loaderBar = document.querySelector('.loader-bar');
const loader = document.getElementById('loader');

for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        imagesLoaded++;
        const progress = (imagesLoaded / frameCount) * 100;
        if (loaderBar) loaderBar.style.width = `${progress}%`;

        if (imagesLoaded === frameCount) {
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                render();
                initScrollAnimations();
                createParticles();
            }, 500);
        }
    };
    images.push(img);
}

function createParticles() {
    const container = document.getElementById('main');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.opacity = Math.random() * 0.5;
        container.appendChild(particle);

        gsap.to(particle, {
            y: `+=${Math.random() * 100 - 50}`,
            x: `+=${Math.random() * 100 - 50}`,
            duration: Math.random() * 3 + 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const img = images[sequence.frame];
    if (!img) return;

    // Center and scale image to cover canvas (like background-size: cover)
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
}

// GSAP Scroll Animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Image Sequence Animation
    gsap.to(sequence, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "power1.out",
        scrollTrigger: {
            trigger: "#main",
            start: "top top",
            endTrigger: "#section4",
            end: "bottom bottom",
            scrub: 1,
        },
        onUpdate: render
    });

    // Full Page Progress Bar
    ScrollTrigger.create({
        trigger: "#main",
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
            gsap.to("#progress-bar", { width: `${self.progress * 100}%`, duration: 0.3, ease: "power2.out" });
        }
    });

    const splitText = (el) => {
        const content = el.innerHTML;
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        const process = (node) => {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent;
                const words = text.split(/(\s+)/).map(part => {
                    if (part.trim() === '') {
                        return part; // Return spaces/whitespace as is
                    }
                    const chars = part.split('').map(char => 
                        `<span class="char" style="display:inline-block">${char}</span>`
                    ).join('');
                    return `<span class="word-wrap" style="display:inline-block; white-space:nowrap">${chars}</span>`;
                }).join('');
                
                const span = document.createElement('span');
                span.innerHTML = words;
                node.parentNode.replaceChild(span, node);
            } else if (node.nodeType === 1) { // Element node
                Array.from(node.childNodes).forEach(process);
            }
        };
        
        Array.from(temp.childNodes).forEach(process);
        el.innerHTML = temp.innerHTML;
    };

    const splitWords = (el) => {
        const content = el.innerHTML;
        const temp = document.createElement('div');
        temp.innerHTML = content;
        
        const process = (node) => {
            if (node.nodeType === 3) { // Text node
                const text = node.textContent;
                if (!text.trim()) return; // skip pure whitespace
                const words = text.split(/(\s+)/).map(word => {
                    if (word.trim() === '') return word; // preserve whitespace
                    return `<span class="word" style="display:inline-block">${word}</span>`;
                }).join('');
                const span = document.createElement('span');
                span.innerHTML = words;
                node.parentNode.replaceChild(span, node);
            } else if (node.nodeType === 1) { // Element node
                Array.from(node.childNodes).forEach(process);
            }
        };
        
        Array.from(temp.childNodes).forEach(process);
        el.innerHTML = temp.innerHTML;
    };

    const sections = gsap.utils.toArray(".section, .normal-section");
    sections.forEach((section, i) => {
        const titles = section.querySelectorAll(".reveal-text");
        const subtexts = section.querySelectorAll(".reveal-subtext");

        titles.forEach((title, index) => {
            if (title) {
                splitText(title);
                const chars = title.querySelectorAll(".char");
                
                // Delay the last section slightly more for "next scroll" feel
                const startPos = section.id === "section5" ? "top 85%" : "top 70%";

                gsap.fromTo(chars, 
                    { opacity: 0, y: 50, rotateX: -90 },
                    {
                        opacity: 1, 
                        y: 0, 
                        rotateX: 0,
                        duration: 1,
                        stagger: 0.03,
                        delay: index * 0.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: startPos,
                            end: "bottom 30%",
                            toggleActions: "play none play reverse",
                        }
                    }
                );
            }
        });

        subtexts.forEach((subtext, index) => {
            splitWords(subtext);
            const words = subtext.querySelectorAll(".word");
            const startPos = section.id === "section5" || section.classList.contains("normal-section") ? "top 85%" : "top 70%";
            
            // If there are no words, just animate the element itself (e.g. buttons or icons)
            const target = words.length > 0 ? words : subtext;

            gsap.fromTo(target,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.03,
                    delay: titles.length * 0.2 + index * 0.1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: startPos,
                        end: "bottom 20%",
                        toggleActions: "play none play reverse",
                    }
                }
            );
        });

        // Add animations for other contents like images and cards
        const extraElements = section.querySelectorAll(".product-card, .split-image, .contact-form-block, .contact-info-block, .benefit-card, .gallery-item");
        if (extraElements.length > 0) {
            gsap.fromTo(extraElements,
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: extraElements[0],
                        start: "top 85%",
                        toggleActions: "play none play reverse",
                    }
                }
            );
        }
    });

    // Canvas fading/transitions if needed
    // Example: Fade out background towards the final section
    gsap.to(".canvas-container", {
        opacity: 0.3,
        scrollTrigger: {
            trigger: ".footer-section",
            start: "top 80%",
            end: "top 20%",
            scrub: true
        }
    });

    // Navbar Scrolled State
    ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self) => {
            if (self.direction === 1) {
                document.getElementById('navbar').classList.add('scrolled');
            } else if (self.scroll() < 50) {
                document.getElementById('navbar').classList.remove('scrolled');
            }
        }
    });
}

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        // Disable scroll when menu is open
        if (mobileMenu.classList.contains('active')) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            lenis.start();
        });
    });
}

// Cursor Interaction (Premium Feel)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    // Cursor move
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: "power2.out"
    });

    // Canvas Parallax
    const xPos = (e.clientX / window.innerWidth - 0.5) * 20;
    const yPos = (e.clientY / window.innerHeight - 0.5) * 20;
    
    gsap.to(canvas, {
        x: xPos,
        y: yPos,
        duration: 1.5,
        ease: "power3.out"
    });
});

// Setup cursor hover effects on all interactive elements
function setupCursorHovers() {
    const hoverables = document.querySelectorAll('a, button, .btn-glow, .btn-outline, .btn-primary, .gallery-item, .product-card, .hamburger');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
}

// Initialize hover listeners and also observe DOM changes if dynamic content loads
setupCursorHovers();

// Style the cursor dynamically
const cursorStyle = document.createElement('style');
cursorStyle.innerHTML = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        background: var(--primary);
        border-radius: 50%;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s ease;
    }
    .custom-cursor.hovered {
        transform: scale(3.5);
        background: #fff;
    }
`;
document.head.appendChild(cursorStyle);
