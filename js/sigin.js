const STORAGE = {
  companies: 'optivault-companies',
  role:      'optivault-role',
  session:   'optivault-session'
};



const PLATFORM_ADMIN = {
  email:    'admin@optivault.internal',
  password: 'optivault2026'
};



const ROLE_DESTINATIONS = {
  'company-admin':  'company-dashboard.html',
  'supervisor':     'warehouse-select.html',
  'platform-admin': 'platform-admin.html'
};



const ROLE_LABELS = {
  'company-admin':  'Company admin access',
  'supervisor':     'Supervisor access',
  'platform-admin': 'Platform admin access'
};


document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  animateSlotCards();
  initSignInForm();
  initSignUpForm();
});



function seedDemoData(){
  if(localStorage.getItem(STORAGE.companies)) return;

  const demo = [{
    name: 'Harbor & Bell Logistics',
    email: 'ops@harborbell.com',
    password: 'warehouse123',
    status: 'approved',
    warehouses: [
      { id:'WH-01', name:'Manesar',  passcode:'1101', slots:400 },
      { id:'WH-02', name:'Neemrana', passcode:'1102', slots:400 },
      { id:'WH-04', name:'Bhiwadi',  passcode:'1104', slots:400 }
    ]
  }];

  saveCompanies(demo);
}



function getCompanies(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE.companies)) || [];
  }catch(err){
    console.warn('Could not read companies:', err);
    return [];
  }
}

function saveCompanies(list){
  try{
    localStorage.setItem(STORAGE.companies, JSON.stringify(list));
  }catch(err){
    console.warn('Could not save companies:', err);
  }
}



function getSelectedRole(){
  const fromUrl = new URLSearchParams(window.location.search).get('role');
  const fromStore = localStorage.getItem(STORAGE.role);
  return fromUrl || fromStore || 'company-admin';
}



function animateSlotCards(){
  const cards = document.querySelectorAll('.scard');
  if(!cards.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  cards.forEach((card, i) => {
    const target = parseInt(card.dataset.target, 10);
    const pctEl = card.querySelector('.scard-pct');
    const barEl = card.querySelector('.scard-bar i');
    if(reduceMotion){
      pctEl.textContent = `${target}%`;
      barEl.style.width = `${target}%`;
      return;
    }
    const delay = 250 + i * 90;
    setTimeout(() => {
      barEl.style.width = `${target}%`;
      const duration = 900;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        pctEl.textContent = `${Math.round(target * eased)}%`;
        if(t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  });
}



function initSignInForm(){
  const form = document.getElementById('signinForm');
  if(!form) return;

  const email = document.getElementById('orgEmail');
  const password = document.getElementById('orgPassword');
  const btn = form.querySelector('.enter-btn');
  const btnText = btn.querySelector('.btn-text');
  const errorBox = document.getElementById('formError');

  const role = getSelectedRole();

  showRoleOnCard(role);


  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    hideError(errorBox);
    [email, password].forEach(field => field.classList.remove('field-error'));

    if(!email.value || !email.validity.valid){
      email.classList.add('field-error');
      valid = false;
    }
    if(!password.value){
      password.classList.add('field-error');
      valid = false;
    }
    if(!valid){
      const firstInvalid = form.querySelector('.field-error');
      if(firstInvalid) firstInvalid.focus();
      return;
    }

    btn.disabled = true;
    btnText.textContent = 'VERIFYING…';

   
    setTimeout(() => {

      const result = checkCredentials(
        role,
        email.value.trim().toLowerCase(),
        password.value
      );

      if(result.ok){
        startSession(result.session);
        window.location.href = ROLE_DESTINATIONS[role] || 'index.html';
        return;
      }

      btnText.textContent = 'ENTER WORKSPACE';
      btn.disabled = false;
      showError(errorBox, result.message);
      password.value = '';
      password.focus();

    }, 600);
  });

  [email, password].forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('field-error');
      hideError(errorBox);
    });
  });
}



function checkCredentials(role, emailValue, passwordValue){


  if(role === 'platform-admin'){
    const matches =
      emailValue === PLATFORM_ADMIN.email &&
      passwordValue === PLATFORM_ADMIN.password;

    if(matches){
      return {
        ok: true,
        session: { role, email: emailValue, company: 'OptiVault' }
      };
    }

    return {
      ok: false,
      message: 'That is not a valid platform admin login.'
    };
  }

  const company = getCompanies().find(
    item => item.email.toLowerCase() === emailValue
  );

  if(!company){
    return {
      ok: false,
      message: 'No company is registered with that email address.'
    };
  }

  if(company.password !== passwordValue){
    return {
      ok: false,
      message: 'That password does not match this company account.'
    };
  }

  if(company.status === 'pending'){
    return {
      ok: false,
      message: 'This registration is still awaiting approval. We will be in touch soon.'
    };
  }

  return {
    ok: true,
    session: { role, email: emailValue, company: company.name }
  };
}



function startSession(session){
  try{
    localStorage.setItem(STORAGE.session, JSON.stringify(session));
  }catch(err){
    console.warn('Could not save session:', err);
  }
}



function showRoleOnCard(role){
  const banner = document.getElementById('roleBanner');
  const label = document.getElementById('roleLabel');
  if(!banner || !label) return;

  label.textContent = ROLE_LABELS[role] || 'Company access';
  banner.hidden = false;

  
  const emailField = document.getElementById('orgEmail');
  const emailLabel = document.querySelector('label[for="orgEmail"]');

  if(role === 'platform-admin' && emailField && emailLabel){
    emailLabel.textContent = 'ADMIN EMAIL';
    emailField.placeholder = 'admin@optivault.internal';
  }
}



function showError(box, message){
  if(!box) return;
  box.textContent = message;
  box.classList.add('show');
}

function hideError(box){
  if(!box) return;
  box.classList.remove('show');
}



function initSignUpForm(){
  const form = document.getElementById('signupForm');
  if(!form) return;

  const companyName = document.getElementById('companyName');
  const contactName = document.getElementById('contactName');
  const workEmail   = document.getElementById('workEmail');
  const warehouses  = document.getElementById('warehouseCount');
  const password    = document.getElementById('newPassword');
  const confirm     = document.getElementById('confirmPassword');
  const btn         = form.querySelector('.enter-btn');
  const btnText     = btn.querySelector('.btn-text');
  const errorBox    = document.getElementById('formError');

  const fields = [companyName, contactName, workEmail, warehouses, password, confirm];


  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    hideError(errorBox);
    fields.forEach(field => field.classList.remove('field-error'));


    fields.forEach(field => {
      if(!field.value.trim()){
        field.classList.add('field-error');
        valid = false;
      }
    });

    if(workEmail.value && !workEmail.validity.valid){
      workEmail.classList.add('field-error');
      valid = false;
    }

    if(!valid){
      showError(errorBox, 'Please fill in every field with a valid value.');
      const firstInvalid = form.querySelector('.field-error');
      if(firstInvalid) firstInvalid.focus();
      return;
    }

    if(password.value.length < 6){
      password.classList.add('field-error');
      showError(errorBox, 'Choose a password of at least 6 characters.');
      password.focus();
      return;
    }

    if(password.value !== confirm.value){
      confirm.classList.add('field-error');
      showError(errorBox, 'The two passwords do not match.');
      confirm.focus();
      return;
    }

    const companies = getCompanies();
    const emailValue = workEmail.value.trim().toLowerCase();
    const taken = companies.some(
      item => item.email.toLowerCase() === emailValue
    );

    if(taken){
      workEmail.classList.add('field-error');
      showError(errorBox, 'A company is already registered with that email address.');
      workEmail.focus();
      return;
    }

    btn.disabled = true;
    btnText.textContent = 'SENDING…';

    setTimeout(() => {

      companies.push({
        name: companyName.value.trim(),
        contact: contactName.value.trim(),
        email: emailValue,
        password: password.value,
        requestedWarehouses: parseInt(warehouses.value, 10),
        status: 'pending',       
        warehouses: []
      });

      saveCompanies(companies);

      playSuccessScreen(companyName.value.trim());

    }, 700);
  });

  fields.forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('field-error');
      hideError(errorBox);
    });
  });
}



function playSuccessScreen(company){
  const screen = document.getElementById('successScreen');
  const boxWrap = document.getElementById('successBoxes');
  const message = document.getElementById('successMessage');
  const nameSlot = document.getElementById('successCompany');
  const refSlot = document.getElementById('successRef');

  if(!screen || !boxWrap || !message) return;

  if(nameSlot) nameSlot.textContent = company;
  if(refSlot) refSlot.textContent = makeReference();


  const columns = 12;
  const boxSize = window.innerWidth / columns;
  const rows = Math.ceil(window.innerHeight / boxSize) + 1;
  const total = columns * rows;

  boxWrap.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  boxWrap.innerHTML = '';

  for(let i = 0; i < total; i++){
    boxWrap.appendChild(document.createElement('span'));
  }

  screen.classList.add('active');
  document.body.style.overflow = 'hidden';

  const boxes = Array.from(boxWrap.querySelectorAll('span'));
  const reduceMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if(reduceMotion){
    boxes.forEach(box => box.classList.add('box-hide'));
    message.classList.add('show');
    return;
  }

  
  const blockDelay = 18;

  boxes.forEach((box, index) => {
    setTimeout(() => {
      box.classList.add('box-hide');
    }, index * blockDelay);
  });

  const lastBox = (boxes.length - 1) * blockDelay;

  setTimeout(() => {
    message.classList.add('show');
  }, lastBox + 400);
}



function makeReference(){
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OV-${year}-${random}`;
}
