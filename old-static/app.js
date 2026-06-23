/**
 * Pro Commerce Solutions - Application Logic
 * Authorized Reseller of Square Products & Services
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  const state = {
    currentPlan: 'free',
    locations: 1,
    pricing: {
      plans: { free: 0, plus: 49, premium: 149 },
      hardware: {
        register: { name: 'Square Register (2nd gen)', price: 44, term: '24 mo.', onetime: false },
        handheld: { name: 'Square Handheld', price: 37, term: '12 mo.', onetime: false },
        terminal: { name: 'Square Terminal', price: 27, term: '12 mo.', onetime: false },
        stand: { name: 'Square Stand', price: 14, term: '12 mo.', onetime: false },
        kioskHardware: { name: 'Square Kiosk Hardware', price: 14, term: '12 mo.', onetime: false },
        reader: { name: 'Square Reader for contactless + chip', price: 59, term: 'one-time', onetime: true }
      },
      addons: {
        kds: { free: 0, plus: 30, premium: 20 },
        kiosk: { free: 0, plus: 50, premium: 30 }
      }
    },
    surveyStep: 1,
    chatbotTranscript: []
  };

  // --- UI NAVIGATION & ROUTER ---
  const pages = document.querySelectorAll('.spa-page');
  const navItems = document.querySelectorAll('.nav-item');
  const mobileMenu = document.querySelector('.nav-menu');
  const mobileToggle = document.querySelector('.mobile-toggle');

  function showPage(pageId, sectionId = null) {
    let targetPage = document.getElementById(pageId);
    if (!targetPage) {
      targetPage = document.getElementById('home');
      pageId = 'home';
    }

    pages.forEach(p => {
      p.classList.remove('active');
    });

    targetPage.classList.add('active');

    navItems.forEach(item => {
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile nav menu
    if (mobileMenu) {
      mobileMenu.classList.remove('active');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (sectionId) {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  // Handle Hash Routing
  function handleRoute() {
    const hash = window.location.hash || '#home';
    const parts = hash.substring(1).split('/');
    const pageId = parts[0];
    const sectionId = parts[1] || null;
    showPage(pageId, sectionId);
  }

  window.addEventListener('hashchange', handleRoute);
  // Initial route on load
  handleRoute();

  // Mobile Menu Toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // Global Page Switch Link Helper
  window.navigateTo = function(pageId, sectionId = null) {
    const sectionPart = sectionId ? '/' + sectionId : '';
    window.location.hash = pageId + sectionPart;
  };

  // Navbar background change on scroll
  const topbar = document.querySelector('.topbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  });

  // --- SCROLL ANIMATIONS ---
  const scrollElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  scrollElements.forEach(el => scrollObserver.observe(el));

  // --- CALCULATOR LOGIC ---
  const locationsInput = document.getElementById('calc-locations');
  const planSelect = document.getElementById('calc-plan');
  
  // Elements inside sticky summary box
  const summaryLocations = document.getElementById('sum-locations');
  const summaryPlanName = document.getElementById('sum-plan-name');
  const summaryPlanCost = document.getElementById('sum-plan-cost');
  const summaryHardwareCost = document.getElementById('sum-hardware-cost');
  const summaryKdsCost = document.getElementById('sum-kds-cost');
  const summaryKioskCost = document.getElementById('sum-kiosk-cost');
  const summaryTotalCost = document.getElementById('sum-total');
  const summaryOnetimeCost = document.getElementById('sum-onetime');
  const summaryDetailsList = document.getElementById('sum-details-list');

  window.changeLocations = function(val) {
    const parsed = parseInt(val, 10);
    state.locations = isNaN(parsed) || parsed < 1 ? 1 : parsed;
    if (locationsInput) locationsInput.value = state.locations;
    updateCalculator();
  };

  window.changePlan = function(plan) {
    if (state.pricing.plans[plan] !== undefined) {
      state.currentPlan = plan;
      if (planSelect) planSelect.value = plan;
      updateCalculator();
    }
  };

  window.updateCalculator = function() {
    const planMonthly = state.pricing.plans[state.currentPlan] * state.locations;
    
    // Update plan info text block
    const planInfoTitle = document.getElementById('plan-info-title');
    const planInfoDesc = document.getElementById('plan-info-desc');
    if (planInfoTitle && planInfoDesc) {
      if (state.currentPlan === 'free') {
        planInfoTitle.textContent = 'Square Free';
        planInfoDesc.textContent = 'Best for businesses that need the basic Square POS tools without a monthly software charge. Processing fees still apply.';
      } else if (state.currentPlan === 'plus') {
        planInfoTitle.textContent = 'Square Plus';
        planInfoDesc.textContent = 'Best for growing businesses that need more advanced POS features, staff tools, marketing/loyalty options, or multi-channel operations.';
      } else {
        planInfoTitle.textContent = 'Square Premium';
        planInfoDesc.textContent = 'Best for higher-volume or expanding businesses that may need advanced support, stronger reporting, and premium-level Square features.';
      }
    }

    let hardwareMonthly = 0;
    let onetimeTotal = 0;
    let kdsQty = 0;
    let kioskQty = 0;
    let details = [];

    // Hardware Calculations
    const qtyInputs = document.querySelectorAll('.calc-qty-input');
    qtyInputs.forEach(input => {
      const qty = parseInt(input.value, 10) || 0;
      if (qty <= 0) return;

      const key = input.dataset.hardware;
      const config = state.pricing.hardware[key];
      if (config) {
        const cost = config.price * qty;
        if (config.onetime) {
          onetimeTotal += cost;
          details.push(`${config.name} × ${qty} ($${cost} one-time)`);
        } else {
          hardwareMonthly += cost;
          details.push(`${config.name} × ${qty} ($${cost}/mo over 12-24 mo.)`);
        }
      }
    });

    // Addons Calculations
    const kdsInput = document.getElementById('calc-qty-kds');
    const kioskInput = document.getElementById('calc-qty-kiosk');

    if (kdsInput) kdsQty = parseInt(kdsInput.value, 10) || 0;
    if (kioskInput) kioskQty = parseInt(kioskInput.value, 10) || 0;

    let kdsMonthly = 0;
    let kioskMonthly = 0;

    if (state.currentPlan === 'free') {
      // Disable input / show unavailable note in details
      if (kdsInput) kdsInput.disabled = true;
      if (kioskInput) kioskInput.disabled = true;
      if (kdsQty > 0 || kioskQty > 0) {
        details.push(`Kitchen Display / Kiosk Apps (Unavailable in Square Free plan)`);
      }
    } else {
      if (kdsInput) kdsInput.disabled = false;
      if (kioskInput) kioskInput.disabled = false;

      kdsMonthly = state.pricing.addons.kds[state.currentPlan] * kdsQty;
      kioskMonthly = state.pricing.addons.kiosk[state.currentPlan] * kioskQty;

      if (kdsQty > 0) {
        details.push(`Square KDS App Devices × ${kdsQty} ($${kdsMonthly}/mo)`);
      }
      if (kioskQty > 0) {
        details.push(`Square Kiosk App Devices × ${kioskQty} ($${kioskMonthly}/mo)`);
      }
    }

    const totalMonthly = planMonthly + hardwareMonthly + kdsMonthly + kioskMonthly;

    // Update Summary UI
    if (summaryLocations) summaryLocations.textContent = state.locations;
    if (summaryPlanName) summaryPlanName.textContent = state.currentPlan.charAt(0).toUpperCase() + state.currentPlan.slice(1);
    if (summaryPlanCost) summaryPlanCost.textContent = `$${planMonthly}/mo`;
    if (summaryHardwareCost) summaryHardwareCost.textContent = `$${hardwareMonthly}/mo`;
    if (summaryKdsCost) summaryKdsCost.textContent = `$${kdsMonthly}/mo`;
    if (summaryKioskCost) summaryKioskCost.textContent = `$${kioskMonthly}/mo`;
    if (summaryTotalCost) summaryTotalCost.textContent = `$${totalMonthly}/mo`;
    if (summaryOnetimeCost) summaryOnetimeCost.textContent = `$${onetimeTotal}`;

    // Fill Checklist details
    if (summaryDetailsList) {
      if (details.length === 0) {
        summaryDetailsList.innerHTML = '<li>No items selected yet.</li>';
      } else {
        summaryDetailsList.innerHTML = details.map(d => `<li>${d}</li>`).join('');
      }
    }
  };

  // Connect consultation form to calculator quote
  window.applyQuoteToContact = function() {
    const contactPlan = document.getElementById('contact-plan');
    const contactMessage = document.getElementById('contact-message');
    
    if (contactPlan) {
      contactPlan.value = state.currentPlan;
    }
    
    if (contactMessage) {
      // Compile selections
      const items = [];
      const qtyInputs = document.querySelectorAll('.calc-qty-input');
      qtyInputs.forEach(input => {
        const qty = parseInt(input.value, 10) || 0;
        if (qty > 0) {
          items.push(`${state.pricing.hardware[input.dataset.hardware].name} (Qty: ${qty})`);
        }
      });
      
      const kdsQty = parseInt(document.getElementById('calc-qty-kds')?.value || '0', 10);
      const kioskQty = parseInt(document.getElementById('calc-qty-kiosk')?.value || '0', 10);
      if (kdsQty > 0) items.push(`Square KDS App Devices (Qty: ${kdsQty})`);
      if (kioskQty > 0) items.push(`Square Kiosk App Devices (Qty: ${kioskQty})`);

      contactMessage.value = `Hello Dominique,\n\nI estimated my monthly Square setup via the calculator and would like a quote. Here is my setup:\n- Locations: ${state.locations}\n- Software Plan: Square ${state.currentPlan.toUpperCase()}\n- Selected Hardware/Apps:\n  ${items.length > 0 ? items.join('\n  ') : 'None selected'}\n\nPlease review and let me know the next steps.`;
    }

    navigateTo('contact', 'consultation-form');
  };

  // Run Calculator init
  updateCalculator();

  // --- MODALS ENGINE ---
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Accessibility: Focus trap init
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  };

  // Click outside modal container to close
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // Modal Focus trap event listener
  document.addEventListener('keydown', (e) => {
    const openModal = document.querySelector('.modal-overlay.show');
    if (openModal && e.key === 'Tab') {
      const focusableElements = openModal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
      if (focusableElements.length === 0) return;
      
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // Back tab
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else { // Forward tab
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    } else if (openModal && e.key === 'Escape') {
      openModal.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });

  // --- MULTI-STEP SURVEY MODAL ---
  const surveySteps = document.querySelectorAll('.survey-step');
  const surveyProgressSteps = document.querySelectorAll('.survey-progress-step');

  window.setSurveyStep = function(stepNum) {
    if (stepNum < 1 || stepNum > surveySteps.length) return;
    
    // Validation before moving forward
    if (stepNum > state.surveyStep) {
      const currentStepEl = document.querySelector(`.survey-step[data-step="${state.surveyStep}"]`);
      const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = 'red';
          valid = false;
        } else {
          input.style.borderColor = '';
        }
      });
      if (!valid) {
        alert('Please fill out all required fields before proceeding.');
        return;
      }
    }

    state.surveyStep = stepNum;

    // Toggle steps visibility
    surveySteps.forEach(step => {
      if (parseInt(step.dataset.step, 10) === stepNum) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update progress steps
    surveyProgressSteps.forEach((progress, idx) => {
      if (idx < stepNum) {
        progress.classList.add('active');
      } else {
        progress.classList.remove('active');
      }
    });
  };

  // Pre-fill industry pathway inside survey modal
  window.openSurveyWithPath = function(pathName) {
    const businessTypeSelect = document.getElementById('survey-business-type');
    if (businessTypeSelect) {
      if (pathName.toLowerCase().includes('restaurant')) {
        businessTypeSelect.value = 'Restaurant (table service)';
      } else if (pathName.toLowerCase().includes('cafe') || pathName.toLowerCase().includes('qsr')) {
        businessTypeSelect.value = 'Restaurant (quick service)';
      } else if (pathName.toLowerCase().includes('retail')) {
        businessTypeSelect.value = 'Retail';
      }
    }
    openModal('survey-modal');
  };

  // --- FILE UPLOADS MOCK ---
  window.handleFileSelect = function(input, labelId) {
    const label = document.getElementById(labelId);
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      label.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
      label.style.display = 'block';
    } else {
      label.textContent = '';
      label.style.display = 'none';
    }
  };

  // Drag and Drop for Upload Areas
  const dragAreas = document.querySelectorAll('.upload-area');
  dragAreas.forEach(area => {
    const input = area.querySelector('input[type="file"]');
    const labelId = input.onchange.toString().match(/'([^']+)'/)[1];
    
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
    });

    area.addEventListener('dragleave', () => {
      area.classList.remove('dragover');
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        handleFileSelect(input, labelId);
      }
    });
  });

  // --- CHATBOT DIALOG SYSTEM ---
  const chatPanel = document.getElementById('chat-panel');
  const chatBody = document.getElementById('chat-body');
  const chatInput = document.getElementById('chat-input');

  window.toggleChat = function() {
    chatPanel.classList.toggle('show');
    if (chatPanel.classList.contains('show')) {
      scrollToBottom();
    }
  };

  window.closeChat = function() {
    chatPanel.classList.remove('show');
  };

  function appendChatMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    scrollToBottom();
    state.chatbotTranscript.push({ sender, text });
  }

  function appendChatTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('chat-msg', 'bot', 'typing');
    indicator.textContent = 'Typing...';
    indicator.id = 'chat-typing-indicator';
    chatBody.appendChild(indicator);
    scrollToBottom();
  }

  function removeChatTypingIndicator() {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  window.sendChatMessage = function() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    appendChatMessage('user', text);
    processBotResponse(text);
  };

  window.chatReply = function(text) {
    // Hide quick replies block once selected to make chat clean
    appendChatMessage('user', text);
    processBotResponse(text);
  };

  function processBotResponse(query) {
    appendChatTypingIndicator();
    
    let reply = "I'm Dominique's B2B POS assistant. I can help configure your Square setup, estimate monthly costs, or submit a request for consultation. Would you like to schedule a free 1-on-1 session with us?";
    let leadCaptureTrigger = false;

    const q = query.toLowerCase();

    if (q.includes('pos') || q.includes('square') || q.includes('system')) {
      reply = "Square offers tailormade POS systems for Restaurants, Retailers, and service-based businesses. Would you like me to open our Business Survey so we can recommend the perfect custom hardware setup?";
      leadCaptureTrigger = true;
    } else if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('estimate') || q.includes('hardware')) {
      reply = "Our hardware financing starts from $14/mo (Square Stand) up to $44/mo (Square Register over 24 months). You can use our interactive Setup Estimator on the Products page or I can help collect a custom request here. What industry are you in?";
    } else if (q.includes('restaurant') || q.includes('cafe') || q.includes('food')) {
      reply = "For restaurants, we recommend combining Square Plus ($49/mo) with Register ($44/mo) and Handhelds ($37/mo) for tableside checkout. I can tag your inquiry as 'Restaurant' and have Dominique call you. What is your phone number?";
    } else if (q.includes('retail') || q.includes('store') || q.includes('shop')) {
      reply = "For retail operations, the Square Retail POS software manages inventory levels seamlessly and integrates with barcode scanners. Would you like to schedule a custom statement review to compare rates?";
    } else if (q.includes('upload') || q.includes('statement') || q.includes('rate') || q.includes('fee')) {
      reply = "Uploading a processing statement is the fastest way to see how much you'll save. I can open our secure upload modal for you right now, or you can submit it through our Contact page. Shall I open the uploader?";
      setTimeout(() => openModal('upload-modal'), 1500);
    } else if (q.match(/\b[0-9]{3}[-.]?[0-9]{3}[-.]?[0-9]{4}\b/)) {
      reply = "Got it, I've noted down your phone number. Let me also capture your business name, and I'll notify Dominique to prepare a call. What is your business name?";
    }

    setTimeout(() => {
      removeChatTypingIndicator();
      appendChatMessage('bot', reply);
      
      // If trigger is true, show quick CTA link
      if (leadCaptureTrigger) {
        const ctaBtn = document.createElement('button');
        ctaBtn.className = 'chat-quick-btn';
        ctaBtn.style.alignSelf = 'flex-start';
        ctaBtn.style.marginTop = '-5px';
        ctaBtn.textContent = 'Open Setup Survey';
        ctaBtn.onclick = () => openSurveyWithPath('general');
        chatBody.appendChild(ctaBtn);
        scrollToBottom();
      }
    }, 1000);
  }

  // Handle enter key on chat text input
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // --- FORMS SUBMISSION MOCKS ---
  window.submitConsultation = function(e) {
    if (e) e.preventDefault();
    const form = document.getElementById('consultation-form');
    if (!form) return;

    // Check basic validations
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(inp => {
      if (!inp.value.trim()) {
        inp.style.borderColor = 'red';
        valid = false;
      } else {
        inp.style.borderColor = '';
      }
    });

    if (!valid) {
      alert('Please fill in all required fields.');
      return;
    }

    // Success styling state
    const card = form.closest('.card');
    card.innerHTML = `
      <div style="text-align: center; padding: 2rem 0;">
        <div style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;">✓</div>
        <h3>Request Submitted Successfully!</h3>
        <p style="margin: 1rem 0 1.5rem;">Thank you for contacting Pro Commerce Solutions. Dominique will review your business information and reach out to you within 24 hours.</p>
        <button class="btn ghost small" onclick="window.location.reload()">Send Another Message</button>
      </div>
    `;
  };

  window.submitSurvey = function() {
    // Gather values
    const form = document.getElementById('survey-form-el');
    const modalBody = document.querySelector('#survey-modal .modal-body');
    
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 0;">
        <div style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;">✓</div>
        <h3>Survey Captured!</h3>
        <p style="margin: 1rem 0 2rem;">Your information has been logged securely in our pipeline. Dominique Wright will evaluate your details and prepare custom POS recommendations.</p>
        <div class="btn-row" style="justify-content: center;">
          <button class="btn primary" onclick="closeModal('survey-modal')">Done</button>
        </div>
      </div>
    `;
  };

  window.submitUpload = function() {
    const modalBody = document.querySelector('#upload-modal .modal-body');
    
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 0;">
        <div style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;">✓</div>
        <h3>Statement Uploaded Privately</h3>
        <p style="margin: 1rem 0 2rem;">Your merchant statements have been stored securely in our private drive for analysis. Dominique Wright will build your customized savings estimate.</p>
        <div class="btn-row" style="justify-content: center;">
          <button class="btn primary" onclick="closeModal('upload-modal')">Done</button>
        </div>
      </div>
    `;
  };

  // --- DEVELOPER PANEL TABS ---
  window.showDevPage = function(pageId) {
    const devPages = document.querySelectorAll('.dev-page');
    const devTabs = document.querySelectorAll('.dev-tab');

    devPages.forEach(p => {
      if (p.id === `dev-page-${pageId}`) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    devTabs.forEach(tab => {
      if (tab.id === `dev-tab-${pageId}`) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  };
});
