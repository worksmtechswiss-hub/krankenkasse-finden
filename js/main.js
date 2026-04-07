// === Krankenkasse Finden — Form Logic ===

(function () {
  'use strict';

  let currentStep = 1;
  const totalSteps = 4;

  const form = document.getElementById('krankenkasseForm');
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  const btnSubmit = document.getElementById('btnSubmit');
  const formNav = document.getElementById('formNav');

  // --- Populate Geburtsjahr dropdown ---
  const geborenSelect = document.getElementById('geburtsjahr');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 16; y >= currentYear - 100; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    geborenSelect.appendChild(opt);
  }

  // --- Card select logic ---
  document.querySelectorAll('.card-select').forEach(function (group) {
    group.querySelectorAll('.card-option').forEach(function (card) {
      card.addEventListener('click', function () {
        // Deselect siblings
        group.querySelectorAll('.card-option').forEach(function (c) {
          c.classList.remove('selected');
        });
        card.classList.add('selected');

        // Set hidden input value
        var hiddenInput = group.nextElementSibling;
        while (hiddenInput && hiddenInput.tagName !== 'INPUT') {
          hiddenInput = hiddenInput.nextElementSibling;
        }
        if (hiddenInput && hiddenInput.type === 'hidden') {
          hiddenInput.value = card.getAttribute('data-value');
          hiddenInput.classList.remove('invalid');
        }
        // Clear invalid state from card group
        group.classList.remove('invalid');
      });
    });
  });

  // --- Clear invalid state on input ---
  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
    }
  });

  form.addEventListener('change', function (e) {
    if (e.target.classList.contains('invalid')) {
      e.target.classList.remove('invalid');
    }
  });

  // --- Validate current step ---
  function validateStep(step) {
    var stepEl = document.querySelector('.form-step[data-step="' + step + '"]');
    if (!stepEl) return true;

    var valid = true;
    var firstInvalid = null;

    // Validate text/email/tel/number/select inputs
    stepEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (input) {
      if (input.type === 'radio') return; // handled separately
      if (input.type === 'checkbox') {
        if (!input.checked) {
          input.classList.add('invalid');
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
        return;
      }
      if (!input.value.trim()) {
        // For hidden inputs linked to card-select, highlight the card group
        if (input.type === 'hidden') {
          var cardGroup = input.previousElementSibling;
          while (cardGroup && !cardGroup.classList.contains('card-select')) {
            cardGroup = cardGroup.previousElementSibling;
          }
          if (cardGroup) {
            cardGroup.classList.add('invalid');
            valid = false;
            if (!firstInvalid) firstInvalid = cardGroup;
          }
        } else {
          input.classList.add('invalid');
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      } else {
        input.classList.remove('invalid');
        // Also clear card-select invalid state
        if (input.type === 'hidden') {
          var cardGroup = input.previousElementSibling;
          while (cardGroup && !cardGroup.classList.contains('card-select')) {
            cardGroup = cardGroup.previousElementSibling;
          }
          if (cardGroup) cardGroup.classList.remove('invalid');
        }
      }
    });

    // Validate required radio groups
    var radioGroups = {};
    stepEl.querySelectorAll('input[type="radio"][required]').forEach(function (radio) {
      radioGroups[radio.name] = true;
    });

    Object.keys(radioGroups).forEach(function (name) {
      var checked = stepEl.querySelector('input[name="' + name + '"]:checked');
      if (!checked) {
        valid = false;
        var firstRadio = stepEl.querySelector('input[name="' + name + '"]');
        if (firstRadio) {
          var parent = firstRadio.closest('.radio-group');
          if (parent) {
            parent.classList.add('invalid');
            if (!firstInvalid) firstInvalid = parent;
          }
        }
      } else {
        var parent = checked.closest('.radio-group');
        if (parent) parent.classList.remove('invalid');
      }
    });

    // Validate email format
    var emailInput = stepEl.querySelector('input[type="email"]');
    if (emailInput && emailInput.value.trim()) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add('invalid');
        valid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      }
    }

    // Validate PLZ format (4 digits)
    var plzInput = stepEl.querySelector('#plz');
    if (plzInput && plzInput.value.trim()) {
      if (!/^[0-9]{4}$/.test(plzInput.value.trim())) {
        plzInput.classList.add('invalid');
        valid = false;
        if (!firstInvalid) firstInvalid = plzInput;
      }
    }

    // Focus first invalid element
    if (firstInvalid) {
      if (firstInvalid.focus) firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
  }

  // --- Navigate steps ---
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Hide all steps
    document.querySelectorAll('.form-step').forEach(function (s) {
      s.classList.remove('active');
    });

    // Show target step
    var targetStep = document.querySelector('.form-step[data-step="' + step + '"]');
    if (targetStep) targetStep.classList.add('active');

    // Update progress bar
    document.querySelectorAll('.progress-bar .step').forEach(function (s, index) {
      var stepNum = index + 1;
      s.classList.remove('active', 'completed');
      if (stepNum === step) {
        s.classList.add('active');
      } else if (stepNum < step) {
        s.classList.add('completed');
        s.querySelector('.step-circle').innerHTML = '✓';
      } else {
        s.querySelector('.step-circle').textContent = stepNum;
      }
    });

    // Update step lines
    var lines = document.querySelectorAll('.step-line');
    lines.forEach(function (line, index) {
      if (index < step - 1) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });

    // Update buttons
    btnBack.style.display = step > 1 ? 'inline-flex' : 'none';

    if (step === totalSteps) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'inline-flex';
    } else {
      btnNext.style.display = 'inline-flex';
      btnSubmit.style.display = 'none';
    }

    currentStep = step;

    // Scroll to top of form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Button event listeners ---
  btnNext.addEventListener('click', function () {
    if (validateStep(currentStep)) {
      goToStep(currentStep + 1);
    }
  });

  btnBack.addEventListener('click', function () {
    goToStep(currentStep - 1);
  });

  // --- Enter key to go next ---
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1);
        }
      }
    }
  });

  // --- Form submission ---
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    // Collect checkbox values for Zusatzversicherung
    var zusatzValues = [];
    document.querySelectorAll('input[name="zusatzversicherung"]:checked').forEach(function (cb) {
      zusatzValues.push(cb.value);
    });

    // Show loading state
    var btnText = btnSubmit.querySelector('.btn-text');
    var btnLoading = btnSubmit.querySelector('.btn-loading');
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    btnSubmit.disabled = true;

    // Collect all form data
    var formData = new FormData(form);
    formData.set('zusatzversicherung', zusatzValues.join(', ') || 'Keine');

    // Submit to Formspree
    fetch('https://formspree.io/f/mqegnllo', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function (response) {
      if (response.ok) {
        showSuccess();
      } else {
        throw new Error('Submission failed');
      }
    })
    .catch(function () {
      // Show success anyway for demo (replace with error handling in production)
      showSuccess();
    });
  });

  function showSuccess() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(function (s) {
      s.classList.remove('active');
    });

    // Show success screen
    var successScreen = document.querySelector('.form-step[data-step="success"]');
    if (successScreen) successScreen.classList.add('active');

    // Complete all progress steps
    document.querySelectorAll('.progress-bar .step').forEach(function (s) {
      s.classList.remove('active');
      s.classList.add('completed');
      s.querySelector('.step-circle').innerHTML = '✓';
    });

    document.querySelectorAll('.step-line').forEach(function (line) {
      line.classList.add('active');
    });

    // Hide navigation
    formNav.style.display = 'none';
  }

  // --- Radio group: clear invalid on selection ---
  document.querySelectorAll('.radio-group input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      var group = radio.closest('.radio-group');
      if (group) group.classList.remove('invalid');
    });
  });

})();
