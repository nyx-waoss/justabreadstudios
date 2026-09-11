const $ = (el) => document.getElementById(el);
function hideAllPages() {
    document.body.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
}

let loggedIn = false;

function runDependentFunctionsOfPage(page) {
	if (page === "strikes") {
		loadMyAccountStatus();
	}
	if (page === "home") {
		loadMyAccountStatus();
    	loadLatestAnnouncementWidget();
	}
	if (page === "requests") {
		populateRequestAdminSelect();
		loadMyRequests();
	}
	if (page === "incomingrequests") {
		loadIncomingRequests();
	}
	if (page === "files") {
		loadSharedFiles();
	}
	if (page === "news") {
		loadAnnouncements();
	}
	if (page === "stats") {
	  	loadStatsPage();
	}
	if (page === "feedback") {
	 	loadFeedbackList();
	}
	if (page === "directory") {
		loadDirectory();
	}
	if (page === "identification") {
		loadMyIdentification();
	}
}

function gotoPage(page = "home") {
	hideAllPages();
	try {
		hideMobileSidebar();

		$(`page_${page}`).classList.remove('hidden');

		if (!loggedIn) {
			$('sidebar').classList.add('hidden');
			$('header').classList.add('hidden');
		} else {
			$('sidebar').classList.remove('hidden');
			$('header').classList.remove('hidden');
		}

		if (loggedIn) {
			runDependentFunctionsOfPage(page);
		}

		if (page !== 'login' && loggedIn) {
			supabaseClient.from('activity_log').insert([{ user_id: currentUser.id, event_type: 'page_view', page }]);
		}
	} catch(e) {
		console.error('Error when loading page:', e);
	}
}
gotoPage('login');

function toggleSidebarCategory(categoryId) {
  $(categoryId).classList.toggle('open');
}

document.querySelectorAll('.page').forEach(page => {
	page.addEventListener('click', () => {
		hideMobileSidebar();
	});
});

function showMobileSidebar() {
	document.getElementById('sidebar').classList.add('show');
	document.querySelectorAll('.page').forEach(page => {
		page.classList.add('remBrightness');
	});
}
function hideMobileSidebar() {
	document.getElementById('sidebar').classList.remove('show');
	document.querySelectorAll('.page').forEach(page => {
		page.classList.remove('remBrightness');
	});
}

function updateHeaderClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  $('header').querySelector('.time').textContent = `${hours}:${minutes} ${ampm}`;
}
updateHeaderClock();
setInterval(updateHeaderClock, 30000);

//const plataformActivated = localStorage.getItem('localTestingBN_activated'); //Comentar el viernes
const plataformActivated = "true"; //Descomentar el viernes

$('notAvailable').classList.remove('hidden');
$('login-section').classList.add('hidden');
setTimeout(() => {
	if (plataformActivated && plataformActivated == "true") {
		$('notAvailable').classList.add('hidden');
		$('login-section').classList.remove('hidden');
	}
}, 100);

function activatePlataformLocal() {
  $('notAvailable').classList.add('hidden');
  $('login-section').classList.remove('hidden');
  localStorage.setItem('localTestingBN_activated', 'true');
}
function disablePlataformLocal() {
  $('notAvailable').classList.remove('hidden');
  $('login-section').classList.add('hidden');
  localStorage.setItem('localTestingBN_activated', 'false');
}

console.log("Bienvenido a BreadNet!");
console.log("Por favor, no copies ni pegues ningun codigo aqui, podrias poner tu cuenta en riesgo!");

const debugActivated = false;
if (debugActivated) {
  console.log("[Debug] Welcome to BreadNet. Type bndebug('help') to see all available commands.");
}
function bndebug(com) {
	if (com == 'help') {
		console.log("= Command List =======");
		console.log("activatePlataformLocal() .... Activate plataform locally if disabled");
		console.log("disablePlataformLocal() ..... Disable plataform locally");
		console.log("======================");
	}
}

function highlightElement(el) {
    el.classList.remove('jsHighlighted');
    
    void el.offsetWidth; 

    el.classList.add('jsHighlighted');

    el.addEventListener('animationend', () => {
        el.classList.remove('jsHighlighted');
    }, { once: true });
}

//=================================
// "Liquid Glass" for apple devices cuz android is poor HAHAAH (i have an android btw 😭)
//=================================
function isAppleDevice() {
  if (navigator.userAgentData?.brands) {
    const platform = navigator.userAgentData.platform?.toLowerCase() || '';
    if (['macos', 'ios'].includes(platform)) {
      return true;
    }
  }

  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isTraditionalApple = /Mac|iPod|iPhone|iPad/.test(userAgent);

  const isiPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return isTraditionalApple || isiPadOS;
}

if (isAppleDevice()) {
  document.body.classList.add('apple_device');
}

//=================================
// Params
//=================================
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('help') == "1") {
	setTimeout(() => {
		gotoPage('help');
	}, 100);
}

//=================================
// Identification
//=================================
function pageIdentificationShow(part = "front") {
	if (part == "front") {
		$('pageIdentificationIDP_front').classList.remove('hidden');
		$('pageIdentificationIDP_back').classList.add('hidden');
	} else {
		$('pageIdentificationIDP_front').classList.add('hidden');
		$('pageIdentificationIDP_back').classList.remove('hidden');
	}
}

//=================================
// Tooltip
//=================================
const tooltip = document.createElement('div');
tooltip.id = 'tooltip-global';
document.body.appendChild(tooltip);

document.addEventListener('mouseover', (e) => {
	const target = e.target.closest('[data-tooltip]');
	if (!target) return;

	const text = target.getAttribute('data-tooltip');
	const rect = target.getBoundingClientRect();

	tooltip.textContent = text;
	tooltip.style.opacity = '1';

	const top = rect.bottom + 6;
	const left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

	tooltip.style.top = top + "px";
	tooltip.style.left = left + "px";
});

document.addEventListener('mouseout', (e) => {
	if (e.target.closest('[data-tooltip]')) {
		tooltip.style.opacity = '0';
	}
});

//=================================
// SW
//=================================

const isDevEnvironment = 
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.hostname.endsWith('.devtunnels.ms') ||
  location.hostname.endsWith('.ngrok-free.app');

if ('serviceWorker' in navigator && !isDevEnvironment) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/breadnet/sw.js', { scope: '/breadnet/' })
			.then((reg) => console.log('Service Worker registered in scope successfully:', reg.scope))
			.catch((err) => console.error('Service Worker Error:', err));
	});
}

//=================================
// MsgBox
//=================================
function getMsgBoxIcon(type = "success") {
	if (type == "success") {
		return "fi fi-rs-check-circle";
	} else if (type == "warn") {
		return "fi fi-rs-triangle-warning";
	} else if (type == "error") {
		return "fi fi-rs-exclamation";
	} else if (type == "info") {
		return "fi fi-rs-info";
	} else if (type == "question") {
		return "fi fi-rs-interrogation";
	} else {
		return "fi fi-rs-info";
	}
}
function showMsgBox(type = "success", title = "Éxito!", info = "Operacion completada con exito!", buttonText = "Aceptar") {
	//set content
  	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.title').textContent = title;
  	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.info').textContent = info;
  	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').textContent = buttonText;

	//show/hide buttons
	$('msgbox-overlay').classList.remove('extend');
	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').classList.add('hidden');
	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').classList.remove('hidden');
	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').classList.add('hidden');

	//button actions
	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').onclick = () => {
		$('msgbox-overlay').classList.add('hide');
	};

	//set icon
	$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('i').className = getMsgBoxIcon(type);

	//show
	$('msgbox-overlay').classList.remove('hide');

	if (type === "error") {
		console.error(`${title}: ${info}`);
	}
}

function showPromptMsgBox(type = "success", title = "Éxito!", info = "Operacion completada con exito!", buttonText = "Aceptar", buttonCancelText = "Cancelar") {
	return new Promise((resolve) => {
		//set content
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.title').textContent = title;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.info').textContent = info;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').textContent = buttonText;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').textContent = buttonCancelText;

		//show/hide buttons
		$('msgbox-overlay').classList.add('extend');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').classList.remove('hidden');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').classList.remove('hidden');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').classList.remove('hidden');

		//input enter handle
		const handleEnter = (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').click();
			}
		}
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').addEventListener('keydown', handleEnter);

		//button actions
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').onclick = () => {
			$('msgbox-overlay').classList.add('hide');
			$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').value = "";
			$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').removeEventListener('keydown', handleEnter);
			resolve({confirmed: false, value: null});
		};

		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').onclick = () => {
			const enteredValue = $('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').value; // <- lee ANTES de borrar
			$('msgbox-overlay').classList.add('hide');
			$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').value = "";
			$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').removeEventListener('keydown', handleEnter);
			resolve({confirmed: true, value: enteredValue});
		};

		//set icon
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('i').className = getMsgBoxIcon(type);

		//show
		$('msgbox-overlay').classList.remove('hide');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').focus();
	});
}

function showAskBox(type = "success", title = "Titulo", info = "dummy string", buttonText = "Aceptar", buttonCancelText = "Cancelar") {
	return new Promise((resolve) => {
		//set content
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.title').textContent = title;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.info').textContent = info;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').textContent = buttonText;
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').textContent = buttonCancelText;

		//show/hide buttons
		$('msgbox-overlay').classList.add('extend');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.inputText').classList.add('hidden');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').classList.remove('hidden');
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').classList.remove('hidden');

		//button actions
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option1').onclick = () => {
			$('msgbox-overlay').classList.add('hide');
			resolve({confirmed: false});
		};

		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('.buttons_wrapper').querySelector('.option2').onclick = () => {
			$('msgbox-overlay').classList.add('hide');
			resolve({confirmed: true});
		};

		//set icon
		$('msgbox-overlay').querySelector('.msgbox-modal').querySelector('i').className = getMsgBoxIcon(type);

		//show
		$('msgbox-overlay').classList.remove('hide');
	});
}


//=================================
// Files
//=================================
function filePreview(filePath) {
	//window.open(filePath);
	taskOpenFilePreview(filePath);
}

function fileDownload(filePath, fileName) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath;
    link.dispatchEvent(new MouseEvent('click'));
}


//=================================
// Settings
//=================================
async function setting_changePassword() {
	const oldPassword = await showPromptMsgBox('question', 'Contraseña', 'Ingrese su contraseña actual', 'Siguiente', 'Cancelar');
	if (!oldPassword.confirmed) return;

	const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
		email: currentUser.email,
		password: oldPassword.value
	});
	if (verifyError) {
		console.error('Detalle del error de verificación:', verifyError.message, verifyError.status);
		showMsgBox('error', 'Contraseña incorrecta', 'La contraseña ingresada no es correcta.', 'Cerrar');
		return;
	}

	const newPassword = await showPromptMsgBox('question', 'Contraseña', 'Ingrese su nueva contraseña', 'Siguiente', 'Cancelar');
	if (!newPassword.confirmed) return;

	const reentrerNewPassword = await showPromptMsgBox('question', 'Contraseña', 'Ingrese su nueva contraseña nuevamente', 'Cambiar', 'Cancelar');
	if (!reentrerNewPassword.confirmed) return;
	if (reentrerNewPassword.value != newPassword.value) {
		showMsgBox('error', 'Contraseñas incorrectas', 'Las contraseñas no coinciden.', 'Cerrar');
		return;
	}

	$('loadingModal').classList.remove('hidden');
	$('loadingModal').querySelector('span').textContent = "Procesando...";

	const { error } = await supabaseClient.auth.updateUser({ password: newPassword.value });

	$('loadingModal').classList.add('hidden');

	if (error) {
	showMsgBox('error', 'Error', `Ocurrio un error al cambiar la contraseña: ${error.message}`, 'Cerrar');
	} else {
		await supabaseClient.from('profiles').update({ password_changed: true }).eq('id', currentUser.id);
		userProfile.password_changed = true;
		showMsgBox('success', 'Éxito!', 'Contraseña cambiada!', 'Cerrar');
		checkSecurityWarning();
	}
}

async function setting_changePIN() {
	console.log('PIN actual en memoria:', userProfile.pin, typeof userProfile.pin);
	const oldPassword = await showPromptMsgBox('question', 'PIN', 'Ingrese su PIN actual', 'Siguiente', 'Cancelar');
	if (!oldPassword.confirmed) return;
	if (oldPassword.value != userProfile.pin) {
		showMsgBox('error', 'PIN incorrecto', 'El PIN ingresado no es correcto.', 'Cerrar');
		return;
	}

	const newPassword = await showPromptMsgBox('question', 'PIN', 'Ingrese su nuevo PIN', 'Siguiente', 'Cancelar');
	if (!newPassword.confirmed) return;

	const reentrerNewPassword = await showPromptMsgBox('question', 'PIN', 'Ingrese su nuevo PIN nuevamente', 'Cambiar', 'Cancelar');
	if (!reentrerNewPassword.confirmed) return;
	if (reentrerNewPassword.value != newPassword.value) {
		showMsgBox('error', 'PIN incorrectos', 'Los PIN no coinciden.', 'Cerrar');
		return;
	}

	$('loadingModal').classList.remove('hidden');
	$('loadingModal').querySelector('span').textContent = "Procesando...";

	const { error } = await supabaseClient
		.from('profiles')
		.update({ pin: newPassword.value })
		.eq('id', currentUser.id);

	$('loadingModal').classList.add('hidden');

	if (error) {
		showMsgBox('error', 'Error', `Ocurrio un error al cambiar el PIN: ${error.message}`, 'Cerrar');
	} else {
		userProfile.pin = newPassword.value;
		await supabaseClient.from('profiles').update({ pin_changed: true }).eq('id', currentUser.id);
		userProfile.pin_changed = true;
		showMsgBox('success', 'Éxito!', 'PIN cambiado!', 'Cerrar');
		checkSecurityWarning();
	}
}

function checkSecurityWarning() {
	const widget = $('dashboard_widget_security');
	if (!userProfile.password_changed || !userProfile.pin_changed) {
		widget.classList.remove('hidden');
	} else {
		widget.classList.add('hidden');
	}
}

async function resizeImageToBase64(file, size = 256, quality = 0.6) {
    let processedFile = file;

    const isHeic = file.type === 'image/heic' || 
                   file.type === 'image/heif' || 
                   file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif');

    if (isHeic && typeof heic2any !== 'undefined') {
        try {
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8
            });

            processedFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        } catch (err) {
            console.error('Error al convertir HEIC:', err);
            throw new Error('No se pudo convertir el formato HEIC');
        }
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;

                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(processedFile);
    });
}

async function setting_changePFP() {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'image/*';

	input.onchange = async () => {
		if (input.files.length === 0) return;
		const file = input.files[0];

		$('loadingModal').classList.remove('hidden');
		$('loadingModal').querySelector('span').textContent = "Procesando imagen...";

		let base64;
		try {
			base64 = await resizeImageToBase64(file, 256, 0.6);
		} catch (e) {
			$('loadingModal').classList.add('hidden');
			showMsgBox('error', 'Error', 'No se pudo procesar la imagen seleccionada.', 'Cerrar');
			return;
		}

		$('loadingModal').querySelector('span').textContent = "Actualizando foto...";

		const { data, error } = await supabaseClient
			.from('profiles')
			.update({ photo_url: base64 })
			.eq('id', currentUser.id)
			.select();

		console.log('Filas actualizadas:', data);

		$('loadingModal').classList.add('hidden');

		if (error) {
			showMsgBox('error', 'Error', `Error al actualizar el perfil: ${error.message}`, 'Cerrar');
			return;
		}

		if (!data || data.length === 0) {
			showMsgBox('error', 'Error', 'No se pudo actualizar el perfil (posible bloqueo de permisos).', 'Cerrar');
			return;
		}

		userProfile.photo_url = base64;
		$('headerPFPimg').src = base64;
		$('softLockPFPImg').src = base64;
		$('strikesPagePFPimg').src = base64;
		$('settings_pfp').src = base64;

		showMsgBox('success', 'Éxito!', 'Foto de perfil actualizada!', 'Cerrar');
	};

	input.click();
}

let inactivityTimeForSoftLock = parseInt(localStorage.getItem('softLockTimeout')) || 60000;

$('settings_softLockSelect').value = inactivityTimeForSoftLock;

$('settings_softLockSelect').onchange = () => {
	inactivityTimeForSoftLock = parseInt($('settings_softLockSelect').value);
	localStorage.setItem('softLockTimeout', inactivityTimeForSoftLock);
};


//=================================
// SUPABASE
//=================================
const SUPABASE_URL = "https://ogdnjfmeouevtybmuquq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZG5qZm1lb3VldnR5Ym11cXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMTExOTksImV4cCI6MjEwMzc4NzE5OX0.Vz_M2mf2qgZX-aWwHnQy0DI59EQJCDtYpl3aBt3TFtM";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let userProfile = null;
let peopleMap = {};

document.getElementById('btn-login').addEventListener('click', async () => {
  const rawInput = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  $('btn-login').disabled = true;
  $('login-loading').classList.remove('hidden');
  $('page_login').style.cursor = "progress";

  let email = rawInput;

  if (rawInput && !rawInput.includes('@')) {
    const { data: resolvedEmail, error: usernameError } = await supabaseClient.rpc('get_email_by_username', { lookup_username: rawInput.toLowerCase() });

    if (usernameError || !resolvedEmail) {
      $('btn-login').disabled = false;
      $('login-loading').classList.add('hidden');
      $('page_login').style.cursor = "default";
      $('login_error_message').textContent = `Correo o Contraseña incorrectos.`;
      $('login_reset_password').classList.remove('hidden');
      return;
    }
    email = resolvedEmail;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    $('btn-login').disabled = false;
    $('login-loading').classList.add('hidden');
	$('page_login').style.cursor = "default";

    console.error("Cannot login: " + error.message);
	$('login_reset_password').classList.add('hidden');
	if (error.message.toLowerCase().includes('invalid login credentials')) {
		$('login_error_message').textContent = `Correo o Contraseña incorrectos.`;
		$('login_reset_password').classList.remove('hidden');
	} else if (error.message.toLowerCase().includes('missing email or phone')) {
		$('login_error_message').textContent = `Por favor, rellene todos los datos.`;
  	} else if (error.message.toLowerCase().includes('failed to fetch')) {
		if (navigator.onLine) {
			$('login_error_message').textContent = `Ocurrio un error de comunicacion con el servidor, reintentelo más tarde.`;
		} else {
			$('login_error_message').textContent = `No hay conexión a internet.`;
		}
	} else {
		$('login_error_message').textContent = `Error al iniciar sesion: ${error.message}`;
	}
	return;
  }
  $('login_reset_password').classList.add('hidden');

  if (platformMaintenanceMode) {
    const { data: roleCheck } = await supabaseClient.from('profiles').select('role').eq('id', data.user.id).single();

    if (!roleCheck || roleCheck.role !== 'ceo') {
        await supabaseClient.auth.signOut();
        $('btn-login').disabled = false;
        $('login-loading').classList.add('hidden');
        $('page_login').style.cursor = "default";
        showMsgBox('warn', 'Mantenimiento', 'La plataforma esta en mantenimiento, vuelve mas tarde.', 'Cerrar');
        return;
    } else {
        const reactivate = await showAskBox('question', 'Modo Mantenimiento', 'La plataforma esta en mantenimiento. ¿Reactivar plataforma y salir de mantenimiento?', 'Reactivar', 'Cancelar');
        if (reactivate.confirmed) {
            await supabaseClient.from('platform_settings').update({ maintenance_mode: false }).eq('id', 1);
            platformMaintenanceMode = false;
        } else {
            await supabaseClient.auth.signOut();
            $('btn-login').disabled = false;
            $('login-loading').classList.add('hidden');
            $('page_login').style.cursor = "default";
            return;
        }
      }
  }

  const { data: profileCheck, error: profileCheckError } = await supabaseClient
    .from('profiles')
    .select('is_banned, ban_reason, ban_expires_at')
    .eq('id', data.user.id)
    .single();

  if (profileCheckError) {
    $('btn-login').disabled = false;
    $('login-loading').classList.add('hidden');
    $('page_login').style.cursor = "default";
    $('login_error_message').textContent = `Error al verificar la cuenta: ${profileCheckError.message}`;
    await supabaseClient.auth.signOut();
    return;
  }

  if (profileCheck.is_banned) {
    const now = new Date();
    const expiresAt = profileCheck.ban_expires_at ? new Date(profileCheck.ban_expires_at) : null;

    if (expiresAt && expiresAt <= now) {
      await supabaseClient
        .from('profiles')
        .update({ is_banned: false, ban_reason: null, ban_expires_at: null })
        .eq('id', data.user.id);
    } else {
      $('btn-login').disabled = false;
      $('login-loading').classList.add('hidden');
      $('page_login').style.cursor = "default";

      if (expiresAt) {
        const diffMs = expiresAt - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        $('login_error_message').textContent = `Cuenta baneada temporalmente. Razón: ${profileCheck.ban_reason || 'Sin especificar'}. Se reactivará en ${diffHours}h ${diffMins}m.`;
		showMsgBox('warn', 'Cuenta baneada temporalmente', `Razón: ${profileCheck.ban_reason || 'Sin especificar'}. Reintente ingresar cuando termine el ban.`, 'Cerrar');
      } else {
        $('login_error_message').textContent = `Cuenta baneada permanentemente. Razón: ${profileCheck.ban_reason || 'Sin especificar'}.`;
		showMsgBox('warn', 'Cuenta baneada permanentemente', `Razón: ${profileCheck.ban_reason || 'Sin especificar'}.`, 'Cerrar');
      }

      await supabaseClient.auth.signOut();
      return;
    }
  }

  initDashboard(data.user);
});
$('password').onkeydown = (e) => {
	if (e.key == "Enter") {
		$('btn-login').click();
	}
};
$('email').onkeydown = (e) => {
	if (e.key == "Enter") {
		$('password').focus();
	}
};
$('login_reset_password').addEventListener('click', async (e) => {
  e.preventDefault();
  const emailPrompt = await showPromptMsgBox('question', 'Restablecer Contraseña', 'Ingresa tu correo electrónico para recibir un enlace de restablecimiento.', 'Enviar', 'Cancelar');
  if (!emailPrompt.confirmed || !emailPrompt.value.trim()) return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Enviando correo...";

  const { error } = await supabaseClient.auth.resetPasswordForEmail(emailPrompt.value.trim(), {
    redirectTo: window.location.origin + '/breadnet/reset-password.html'
  });

  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo enviar el correo: ${error.message}`, 'Cerrar');
  } else {
    showMsgBox('success', 'Correo enviado', 'Revisa tu correo electrónico para continuar con el restablecimiento.', 'Cerrar');
  }
});




function getAutomaticGreeting(pf_name, pf_role) {
  const currentHour = new Date().getHours();
  let tag, text;

  if (currentHour >= 6 && currentHour < 12) {
    tag = "c-gradient-morning";
    text = "Buenos días";
  } else if (currentHour >= 12 && currentHour < 19) {
    tag = "c-gradient-afternoon";
    text = "Buenas tardes";
  } else {
    tag = "c-gradient-night";
    text = "Buenas noches";
  }

  return `<${tag}>${text}</${tag}>,<br>${pf_name}`;
}

async function initDashboard(user) {
  currentUser = user;
  recordLoginTimestamp(user.id);

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  
  $('btn-login').disabled = false;
  $('login-loading').classList.add('hidden');
  $('page_login').style.cursor = "default";

  if (error) {
    console.error("Error loading profile:", error);
    return;
  }

  userProfile = profile;
  loggedIn = true;

  checkSecurityWarning();

	if (!profile.password_changed || !profile.pin_changed) {
		const gotoChangeData = await showAskBox('warn', 'Cuenta Desprotegida', 'Nunca ha cambiado su contraseña o PIN desde la creación de su cuenta. Desea cambiar esos datos ahora mismo?', 'Ir a configuración', 'Más tarde');
    setTimeout(() => {
      if (gotoChangeData && gotoChangeData.confirmed) {
        gotoPage('settings');
        highlightElement($('settingsBtn_changePass'));
        highlightElement($('settingsBtn_changePIN'));
      }
    }, 100);
	}

  gotoPage('home');
  document.getElementById('user-welcome').innerHTML = getAutomaticGreeting(profile.name, profile.role);
  $('header_pfp').querySelector('.name').textContent = profile.name;
  $('settings_displayName').textContent = `${profile.name}`;
  $('settings_userExtraInfo').textContent = `Tipo de cuenta: ${profile.role} | Username: ${profile.username}`;

  if (!profile.photo_url) {
	console.error('Missing PFP');

	$('headerPFPimg').src = '/assets/userdefault.jpg';
	$('softLockPFPImg').src = '/assets/userdefault.jpg';
	$('strikesPagePFPimg').src = '/assets/userdefault.jpg';
	$('settings_pfp').src = '/assets/userdefault.jpg';
  } else {
	$('headerPFPimg').src = profile.photo_url;
	$('softLockPFPImg').src = profile.photo_url;
	$('strikesPagePFPimg').src = profile.photo_url;
	$('settings_pfp').src = profile.photo_url;
  }

  await loadPeopleMap();

	if (['admin', 'ceo'].includes(profile.role)) {
		await loadEmployeesDropdowns();
		document.getElementById('btn-create-task').addEventListener('click', createTask);
		$('assigneTaskBtn').classList.remove('hidden');
		$('admin-upload-file').classList.remove('hidden');
    	$('admin-create-announcement').classList.remove('hidden');

		$('adminCategory').classList.remove('hidden');

		if (profile.role === 'ceo') {
			$('maintenanceToggleBtn').classList.remove('hidden');
			$('directoryBtn').classList.remove('hidden');
      $('manage-identification-section').classList.remove('hidden');
		}

		requestNotificationPermission();
		subscribeToIncomingRequests();
	}

  loadTasks();
  subscribeToTasks();
  loadNotifications();
  setupPresence();
  subscribeToMaintenanceMode();
  await supabaseClient.from('activity_log').insert([{ user_id: currentUser.id, event_type: 'login' }]);
}

async function loadPeopleMap() {
  const { data: people, error } = await supabaseClient
    .from('profiles')
    .select('id, name, role');

  if (error) {
    console.error('Error cargando nombres de usuarios:', error);
    return null;
  }

  peopleMap = {};
  adminList = [];
  people.forEach(p => {
    peopleMap[p.id] = p.name;
    if (p.role === 'admin' || p.role === 'ceo') adminList.push(p);
  });
  return people;
}

async function loadEmployeesDropdowns() {
  const people = await loadPeopleMap();
  if (!people) return;

  const isCeo = userProfile.role === 'ceo';

  const manageable = isCeo
    ? people.filter(p => p.role === 'employee' || p.role === 'admin')
    : people.filter(p => p.role === 'employee');
  manageablePeopleList = manageable;

  const select = document.getElementById('task-assignee');
  select.innerHTML = '';
  manageable.forEach(person => {
    const opt = document.createElement('option');
    opt.value = person.id;
    opt.textContent = `${person.name}${person.role === 'admin' ? ' (Admin)' : ''}`;
    select.appendChild(opt);
  });

  const manageableForManagement = isCeo
    ? [...manageable, people.find(p => p.id === currentUser.id)].filter(Boolean)
    : manageable;

  const manageSelect = document.getElementById('manage-employee-select');
  manageSelect.innerHTML = '';
  manageableForManagement.forEach(person => {
    const opt = document.createElement('option');
    const isSelf = person.id === currentUser.id;
    opt.value = person.id;
    opt.textContent = `${person.name}${person.role === 'admin' ? ' (Admin)' : ''}${isSelf ? ' (Usted)' : ''}`;
    manageSelect.appendChild(opt);
  });
}

let employeesMap = {};
async function loadEmployees() {
  const { data: employees } = await supabaseClient
    .from('profiles')
    .select('id, name')
    .eq('role', 'employee');

  employeesMap = {};
  employees.forEach(emp => { employeesMap[emp.id] = emp.name; });

  const select = document.getElementById('task-assignee');
  select.innerHTML = '';
  employees.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = emp.name;
    select.appendChild(opt);
  });
}

async function createTask() {
  $('btn-create-task').disabled = true;
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-desc').value;
  const assigned_to = document.getElementById('task-assignee').value;
  const fileInput = document.getElementById('task-file');

  let referenceFileUrl = null;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const filePath = `assignments/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('task-files')
      .upload(filePath, file);

    if (uploadError) {
      $('btn-create-task').disabled = false;
      showMsgBox('error', 'Error', `Error al subir el archivo: ${uploadError.message}`, 'Cerrar');
      return;
    }

    const { data: urlData } = supabaseClient.storage.from('task-files').getPublicUrl(filePath);
    referenceFileUrl = urlData.publicUrl;
  }

  const { error } = await supabaseClient.from('tasks').insert([
    {
      title,
      description,
      assigned_to,
      created_by: currentUser.id,
      status: 'pending',
      reference_file_url: referenceFileUrl
    }
  ]);
  $('btn-create-task').disabled = false;

  if (error) {
	showMsgBox('error', 'Error', `Error al crear la tarea: ${error.message}`, 'Cerrar');
  } else {
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    fileInput.value = '';
    showMsgBox('success', 'Éxito!', 'Tarea asignada!', 'Cerrar');
  }
}

async function loadTasks() {
  let query = supabaseClient.from('tasks').select('*');

  if (!['admin', 'ceo'].includes(userProfile.role)) {
    query = query.eq('assigned_to', currentUser.id);
  }

  const { data: tasks, error } = await query;
  if (error) return console.error(error);

  renderTasks(tasks);
}

function renderTasks(tasks) {
  const container = document.getElementById('tasks-list');
  container.innerHTML = '';

  if (tasks.length <= 0) {
    container.innerHTML = '<span>No tienes trabajos pendientes!</span>';
    $('dashboard_widget_tasks').className = "widget status_ok";
    $('dashboard_widget_tasks').querySelector('.status').textContent = "Sin tareas pendientes";
    return;

  } else if (tasks.length == 1) {
    $('dashboard_widget_tasks').className = "widget status_info";
    $('dashboard_widget_tasks').querySelector('.status').textContent = "Tienes 1 tarea pendiente.";

  } else if (tasks.length >= 1) {
    $('dashboard_widget_tasks').className = "widget status_info";
    $('dashboard_widget_tasks').querySelector('.status').textContent = `Tienes ${tasks.length} tareas pendientes.`;

  }

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `task-card ${task.status}`;

    const isMine = task.assigned_to === currentUser.id;
    const isCreatedByMe = task.created_by === currentUser.id;
    const assigneeName = peopleMap[task.assigned_to] || 'Empleado';
    const creatorName = peopleMap[task.created_by] || 'Admin';

    const assignedByLabel = isCreatedByMe
      ? `<span class="assigned-by">Asignada por Usted</span>`
      : `<span class="assigned-by">Asignada por ${creatorName}</span>`;

    const submittedByLabel = task.status === 'completed'
      ? (isMine
          ? `<span class="submitted-by">Enviado por Usted</span>`
          : `<span class="submitted-by">Enviado por ${assigneeName}</span>`)
      : '';

    const fileLinkLabel = isMine
      ? 'Ver mi Archivo Enviado'
      : `Ver Archivo de ${assigneeName}`;

    div.innerHTML = `
		<div class="top_wrapper">
			<i class="fi fi-sr-note"></i>
			<span class="title">${task.title}</span>
			${assignedByLabel}
			${submittedByLabel}
			<p>Estado: <strong>${task.status}</strong></p>
		</div>
		${!isMine ? `<p class="assigned-to"><small>Asignado a: ${assigneeName}</small></p>` : ''}
		<p>${task.description || ''}</p>
		${task.reference_file_url ? `<p><a href="${task.reference_file_url}" target="_blank">Ver Archivo de Referencia</a></p>` : ''}
		${task.file_url ? `<p><a href="#" onclick="taskOpenFilePreview('${task.file_url}')">${fileLinkLabel}</a></p>` : ''}

		<div class="bottom_wrapper">
			${task.status === 'pending' && isMine ? `
			<input type="file" id="file-${task.id}">
			<button onclick="uploadFileAndComplete('${task.id}')" id="taskButton_${task.id}"><i class="fi fi-br-check"></i> Enviar Tarea</button>
			` : ''}
		</div>
	`;
    container.appendChild(div);
  });
}

function taskOpenFilePreview(file) {
	const urlLimpia = file.split('?')[0];
	const extension = urlLimpia.split('.').pop().toLowerCase();
	if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
		$('filePreview').querySelector('.preview').querySelector('img').classList.remove('hidden');
		$('filePreview').querySelector('.preview').querySelector('iframe').classList.add('hidden');
    $('filePreview').classList.remove('hidden');
    setTimeout(() => {
		    $('filePreview').querySelector('.preview').querySelector('img').src = file;
    }, 100);

	} else if (extension === 'pdf') {
		$('filePreview').querySelector('.preview').querySelector('iframe').classList.remove('hidden');
		$('filePreview').querySelector('.preview').querySelector('img').classList.add('hidden');
    $('filePreview').classList.remove('hidden');
    setTimeout(() => {
		    $('filePreview').querySelector('.preview').querySelector('iframe').src = file;
    }, 100);

	} else {
		window.open(file);
	}
}

$('filePreview').addEventListener('pointerdown', () => {
	$('filePreview').querySelector('.preview').querySelector('iframe').src = '';
	$('filePreview').querySelector('.preview').querySelector('img').src = '';
	$('filePreview').querySelector('.loading').classList.remove('hidden');
	$('filePreview').classList.add('hidden');
});
$('filePreview').querySelector('.preview').addEventListener('pointerdown', (e) => {
	e.stopPropagation();
});

$('filePreview').querySelector('.preview').querySelector('img').addEventListener('load', () => {
	$('filePreview').querySelector('.loading').classList.add('hidden');
});
$('filePreview').querySelector('.preview').querySelector('iframe').addEventListener('load', () => {
	$('filePreview').querySelector('.loading').classList.add('hidden');
});

window.uploadFileAndComplete = async (taskId) => {
  $(`taskButton_${taskId}`).innerHTML = `<i class="fi fi-rr-duration-alt"></i> Enviando...`;
  $(`taskButton_${taskId}`).disabled = true;

  const fileInput = document.getElementById(`file-${taskId}`);
  let fileUrl = null;

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const filePath = `tasks/${taskId}-${file.name}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('task-files')
      .upload(filePath, file);

    if (uploadError) {
      $(`taskButton_${taskId}`).innerHTML = `<i class="fi fi-br-check"></i> Enviar Tarea`;
      $(`taskButton_${taskId}`).disabled = false;
      showMsgBox('error', 'Error', `Error al subir el archivo: ${uploadError.message}`, 'Cerrar');
      return;
    }

    const { data: urlData } = supabaseClient.storage
      .from('task-files')
      .getPublicUrl(filePath);

    fileUrl = urlData.publicUrl;
  }

  const { data, error } = await supabaseClient
    .from('tasks')
    .update({ status: 'completed', file_url: fileUrl })
    .eq('id', taskId)
    .select();

  $(`taskButton_${taskId}`).innerHTML = `<i class="fi fi-br-check"></i> Enviar Tarea`;
  $(`taskButton_${taskId}`).disabled = false;

  if (error) {
    showMsgBox('error', 'Error', `Error al entregar la tarea: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo entregar la tarea (posible bloqueo de permisos).', 'Cerrar');
    return;
  }

  showMsgBox('success', 'Entregado', `Tarea subida y entregada`, 'Cerrar');

  loadTasks();
};

function subscribeToTasks() {
  supabaseClient
    .channel('realtime:tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      loadTasks();
    })
    .subscribe();
}

async function sysLogOut() {
	$('loadingModal').classList.remove('hidden');
	$('loadingModal').querySelector('span').textContent = "Cerrando sesión...";
	$('logoutDialog').classList.remove('show');
	await supabaseClient.auth.signOut();
	loggedIn = false;
	window.location.reload();
}
document.getElementById('btn-logout').addEventListener('click', () => {
	sysLogOut();
});

//=================================
// Login Frequency
//=================================
function recordLoginTimestamp(userId) {
  const key = `loginHistory_${userId}`;
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    history = [];
  }
  history.push(Date.now());
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  history = history.filter(ts => Date.now() - ts <= THIRTY_DAYS);
  localStorage.setItem(key, JSON.stringify(history));
  return history;
}

function getLoginFrequencyInfo(userId) {
  const key = `loginHistory_${userId}`;
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    history = [];
  }
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const recentLogins = history.filter(ts => Date.now() - ts <= SEVEN_DAYS);
  return {
    totalRecorded: history.length,
    loginsLast7Days: recentLogins.length,
    isFrequent: recentLogins.length >= 3
  };
}

//=================================
// Account Status
//=================================
async function loadMyAccountStatus() {
  const { data: strikes, error: strikesError } = await supabaseClient
    .from('strikes')
    .select('*')
    .eq('employee_id', currentUser.id)
    .order('created_at', { ascending: false });

  const { data: tasks, error: tasksError } = await supabaseClient
    .from('tasks')
    .select('id, status')
    .eq('assigned_to', currentUser.id);

  if (strikesError || tasksError) {
    console.error('Error cargando estado de cuenta:', strikesError, tasksError);
    return;
  }

  const strikeCount = strikes.length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const frequency = getLoginFrequencyInfo(currentUser.id);

  if (strikeCount <= 0) {
	$('dashboard_widget_brief').className = "widget status_ok";
	$('dashboard_widget_brief').querySelector('.status').textContent = "Todo correcto por aqui!";
  } else if (strikeCount == 1) {
	$('dashboard_widget_brief').className = "widget status_warn";
	$('dashboard_widget_brief').querySelector('.status').textContent = "Tienes 1 Strike";
  } else if (strikeCount >= 1) {
	$('dashboard_widget_brief').className = "widget status_warn";
	$('dashboard_widget_brief').querySelector('.status').textContent = "Tienes varios strikes!";
  }

  renderMyStrikesList(strikes);
  renderAccountBrief(strikeCount, pendingCount, frequency);
}

function renderMyStrikesList(strikes) {
  const container = $('strikes-list');
  container.innerHTML = '';

  if (!strikes || strikes.length === 0) {
    container.innerHTML = '<span>No tienes ningún strike.</span>';
    return;
  }

  strikes.forEach(strike => {
    const div = document.createElement('div');
    div.className = 'element';

    const icon = document.createElement('i');
    icon.className = 'fi fi-sr-triangle-warning';

    const span = document.createElement('span');
    span.textContent = strike.short_reason;

    const btn = document.createElement('button');
    btn.textContent = 'Mas Información';
    btn.onclick = () => showMsgBox('info', strike.short_reason, strike.detailed_reason, 'Cerrar');

    div.appendChild(icon);
    div.appendChild(span);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

function renderAccountBrief(strikeCount, pendingCount, frequency) {
  $('briefStrikesCount').textContent = strikeCount === 0
    ? 'No tienes ningun strike registrado.'
    : `Tienes ${strikeCount} strike${strikeCount === 1 ? '' : 's'}.`;

  if (pendingCount === 0) {
    $('briefTasksCheck').innerHTML = `<i class="fi fi-br-check"></i> Has entregado todos tus trabajos`;
  } else {
    $('briefTasksCheck').innerHTML = `<i class="fi fi-sr-triangle-warning"></i> Te falta${pendingCount === 1 ? '' : 'n'} entregar ${pendingCount} tarea${pendingCount === 1 ? '' : 's'}`;
  }

  if (frequency.isFrequent) {
    $('briefFrequencyCheck').innerHTML = `<i class="fi fi-br-check"></i> Has ingresado a la plataforma con frecuencia`;
  } else {
    $('briefFrequencyCheck').innerHTML = `<i class="fi fi-sr-triangle-warning"></i> Deberías ingresar a la plataforma con más frecuencia`;
  }

  if (strikeCount === 0) {
    $('briefStrikesCheck').innerHTML = `<i class="fi fi-br-check"></i> No tienes ningun strike`;
  } else {
    $('briefStrikesCheck').innerHTML = `<i class="fi fi-sr-triangle-warning"></i> Tienes strikes registrados`;
  }

  let score = 0;
  score += strikeCount * 2;
  score += pendingCount * 1;
  score += frequency.isFrequent ? 0 : 2;

  if (score === 0) {
    $('briefTitle').innerHTML = `Tienes un <c-gradient>buen desempeño</c-gradient>!`;
  } else if (score <= 3) {
    $('briefTitle').innerHTML = `<c-gradient-warn>Vamos bien</c-gradient-warn>!`;
  } else {
    $('briefTitle').innerHTML = `<c-gradient-bad>Podemos mejorar</c-gradient-bad>!`;
  }
}


//=================================
// Employee Managment for Admins
//=================================
let currentManagedEmployee = null;

function toggleBanUntilField() {
  const banType = document.querySelector('input[name="ban-type"]:checked').value;
  $('ban-until-input').classList.toggle('hidden', banType === 'permanent');
  $('ban-until-row').classList.toggle('hidden', banType === 'permanent');
}

async function updateEmployeeUsername() {
  if (!currentManagedEmployee) return;

  const username = $('manage-username-input').value.trim().toLowerCase();

  if (!username) {
    showMsgBox('error', 'Error', 'Ingresa un nombre de usuario.', 'Cerrar');
    return;
  }
  if (!/^[a-z]+$/.test(username)) {
    showMsgBox('error', 'Formato inválido', 'El usuario debe ser solo letras minúsculas, sin espacios ni números.', 'Cerrar');
    return;
  }

  $('loadingModal').classList.remove('hidden');
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ username })
    .eq('id', currentManagedEmployee.id)
    .select();
  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo guardar (¿el usuario ya existe?): ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo guardar (posible bloqueo de permisos).', 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'Usuario actualizado.', 'Cerrar');
  loadEmployeeManagement();
}

async function loadEmployeeManagement() {
  const employeeId = $('manage-employee-select').value;
  if (!employeeId) return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Cargando...";

  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', employeeId)
    .single();

  const { data: strikes, error: strikesError } = await supabaseClient
    .from('strikes')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  $('loadingModal').classList.add('hidden');

  if (profileError || strikesError) {
    showMsgBox('error', 'Error', 'No se pudo cargar la información del empleado.', 'Cerrar');
    return;
  }

  currentManagedEmployee = profile;
  $('employeeManagementPanel').classList.remove('hidden');
  $('manage-employee-name').textContent = profile.name;
  $('manage-username-input').value = profile.username || '';

  renderBanStatus(profile);
  renderManagedStrikesList(strikes);
  $('working-areas-input').value = (profile.working_areas || []).join(', ');

  if (userProfile.role === 'ceo') {
    loadEmployeeIdentification(employeeId);
    $('current-cid-display').textContent = profile.current_cid || 'Ninguno';
    renderCidQr(profile.current_cid);
    loadIdCardsHistory(employeeId);
  }
}

function renderBanStatus(profile) {
  const container = $('manage-ban-status');
  if (profile.is_banned) {
    const isTemp = !!profile.ban_expires_at;
    const untilText = isTemp ? `hasta ${new Date(profile.ban_expires_at).toLocaleString()}` : '(permanente)';
    container.innerHTML = `<p><i class="fi fi-rr-ban"></i> Este empleado está baneado ${untilText}.<br>Razón: ${profile.ban_reason || ''}</p>`;
    $('unban-btn').classList.remove('hidden');
  } else {
    container.innerHTML = `<p><i class="fi fi-br-check"></i> Este empleado no está baneado.</p>`;
    $('unban-btn').classList.add('hidden');
  }
}

function renderManagedStrikesList(strikes) {
  const container = $('manage-strikes-list');
  container.innerHTML = '';
  if (!strikes || strikes.length === 0) {
    container.innerHTML = '<span>Este empleado no tiene strikes.</span>';
    return;
  }
  strikes.forEach(strike => {
    const div = document.createElement('div');
    div.className = 'element';

    const icon = document.createElement('i');
    icon.className = 'fi fi-sr-triangle-warning';

    const span = document.createElement('span');
    span.textContent = strike.short_reason;

    const infoBtn = document.createElement('button');
    infoBtn.textContent = 'Mas Información';
    infoBtn.onclick = () => showMsgBox('info', strike.short_reason, strike.detailed_reason, 'Cerrar');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = `<i class="fi fi-rr-trash"></i>`;
    deleteBtn.className = 'btnsmall';
    deleteBtn.onclick = () => deleteStrike(strike.id);

    div.appendChild(icon);
    div.appendChild(span);
    div.appendChild(infoBtn);
    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
}

async function deleteStrike(strikeId) {
  const confirmMsg = await showAskBox('question', 'Confirmar', 'Desea borrar el archivo?', 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed) return;

  $('loadingModal').classList.remove('hidden');
  const { error } = await supabaseClient.from('strikes').delete().eq('id', strikeId);
  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo eliminar el strike: ${error.message}`, 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'Strike eliminado.', 'Cerrar');
  loadEmployeeManagement();
}

async function addStrike() {
  if (!currentManagedEmployee) return;

  const shortReason = $('strike-short-reason').value.trim();
  const detailedReason = $('strike-detailed-reason').value.trim();

  if (!shortReason || !detailedReason) {
    showMsgBox('error', 'Datos incompletos', 'Debes ingresar un motivo breve y un detalle del motivo.', 'Cerrar');
    return;
  }

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Guardando strike...";

  const { data, error } = await supabaseClient
    .from('strikes')
    .insert([{
      employee_id: currentManagedEmployee.id,
      created_by: currentUser.id,
      short_reason: shortReason,
      detailed_reason: detailedReason
    }])
    .select();

  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo agregar el strike: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo agregar el strike (posible bloqueo de permisos).', 'Cerrar');
    return;
  }

  $('strike-short-reason').value = '';
  $('strike-detailed-reason').value = '';
  showMsgBox('success', 'Éxito!', 'Strike agregado.', 'Cerrar');
  loadEmployeeManagement();
}

async function banEmployee() {
  if (!currentManagedEmployee) return;

  const banType = document.querySelector('input[name="ban-type"]:checked').value;
  const reason = $('ban-reason-input').value.trim();

  if (!reason) {
    showMsgBox('error', 'Datos incompletos', 'Debes ingresar una razón para el baneo.', 'Cerrar');
    return;
  }

  let banUntil = null;
  if (banType === 'temporary') {
    const rawValue = $('ban-until-input').value;
    if (!rawValue) {
      showMsgBox('error', 'Datos incompletos', 'Debes elegir una fecha/hora para el baneo temporal.', 'Cerrar');
      return;
    }
    banUntil = new Date(rawValue).toISOString();
  }

  const confirmMsg = await showPromptMsgBox(
    'warn',
    'Confirmar baneo',
    `Esto baneará a ${currentManagedEmployee.name}. Escribe "CONFIRMAR" para continuar.`,
    'Banear',
    'Cancelar'
  );
  if (!confirmMsg.confirmed || confirmMsg.value !== 'CONFIRMAR') return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Baneando...";

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({
      is_banned: true,
      ban_reason: reason,
      ban_expires_at: banUntil
    })
    .eq('id', currentManagedEmployee.id)
    .select();

  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo banear al empleado: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo banear (posible bloqueo de permisos).', 'Cerrar');
    return;
  }

  $('ban-reason-input').value = '';
  showMsgBox('success', 'Éxito!', 'Empleado baneado.', 'Cerrar');
  loadEmployeeManagement();
}

async function unbanEmployee() {
  if (!currentManagedEmployee) return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Procesando...";

  const { data, error } = await supabaseClient
    .from('profiles')
    .update({
      is_banned: false,
      ban_reason: null,
      ban_expires_at: null
    })
    .eq('id', currentManagedEmployee.id)
    .select();

  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo quitar el baneo: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo quitar el baneo (posible bloqueo de permisos).', 'Cerrar');
    return;
  }

  showMsgBox('success', 'Éxito!', 'Baneo removido.', 'Cerrar');
  loadEmployeeManagement();
}



//=================================
// Automatic Lock
//=================================
$('softlockInput').onkeydown = (e) => {
	if (e.key == "Enter" || e.key == "enter") {
		verifySoftLockPIN();
	}
};
function verifySoftLockPIN() {
	if ($('softlockInput').value == userProfile.pin) {
		isManualIdle = false;
		deshabilitarBloqueoLeve();
		$('softLockOverlay').classList.remove('show');
		$('softlockInput').value = "";
		$('softLockError').classList.remove('show');
	} else {
		$('softlockInput').value = "";
		$('softLockError').classList.add('show');
	}
}

function softLockAlert_extendSession() {
	$('softLockAlertOverlay').classList.remove('show');
}

let inactivityTimer;
let isPinLocked = false;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
	if (!loggedIn) return;
	if (isManualIdle) return;
    if (isPinLocked) {
        faseBloqueoTotal();
    } else {
        faseAlerta();
    }
}

// espera 1 minuto de inactividad
function faseAlerta() {
    inactivityTimer = setTimeout(() => {
        if (!loggedIn) return;
        console.log("Muestra alerta: En 60s se bloquea levemente.");
		$('softLockAlertOverlay').classList.add('show');
        faseBloqueoLeve();
    }, inactivityTimeForSoftLock);
}

// alerta estuvo 1min en pantalla -> Bloqueo leve por PIN
function faseBloqueoLeve() {
    inactivityTimer = setTimeout(() => {
        if (!loggedIn) return;
        
        isPinLocked = true;
        console.log("Soft Locked. Requesting PIN.");
		$('softLockOverlay').classList.add('show');
		$('softLockAlertOverlay').classList.remove('show');
        
        faseBloqueoTotal();
    }, 60000);
}

// 30s en bloqueo leve -> cierra sesion
function faseBloqueoTotal() {
    inactivityTimer = setTimeout(() => {
        if (!loggedIn) return;
        console.log("Logging Out..");
        isPinLocked = false;
		sysLogOut();
    }, 30000);
}

function deshabilitarBloqueoLeve() {
    isPinLocked = false;
    resetInactivityTimer();
}

['mousemove', 'keydown', 'click', 'scroll'].forEach(e => {
    window.addEventListener(e, resetInactivityTimer);
});

resetInactivityTimer();

//=================================
// requests
//=================================

let adminList = [];

function statusLabel(status) {
  if (status === 'approved') return { text: 'Aceptada', icon: 'fi fi-br-check' };
  if (status === 'rejected') return { text: 'Denegada', icon: 'fi fi-rr-cross' };
  return { text: 'En revisión', icon: 'fi fi-rr-duration-alt' };
}

function populateRequestAdminSelect() {
  const select = $('request-admin-select');
  if (!select) return;
  select.innerHTML = '';
  adminList.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = `${a.name} (${a.role === 'ceo' ? 'CEO' : 'Admin'})`;
    select.appendChild(opt);
  });
}

async function sendRequest(typeLabel) {
  const adminId = $('request-admin-select').value;
  if (!adminId) {
    showMsgBox('error', 'Error', 'No hay administradores disponibles para recibir la solicitud.', 'Cerrar');
    return;
  }

  const reasonPrompt = await showPromptMsgBox('question', typeLabel, 'Describe brevemente tu solicitud:', 'Enviar', 'Cancelar');
  if (!reasonPrompt.confirmed || !reasonPrompt.value.trim()) return;

  $('loadingModal').classList.remove('hidden');
  const { data, error } = await supabaseClient.from('requests').insert([{
    employee_id: currentUser.id,
    admin_id: adminId,
    type: typeLabel,
    reason: reasonPrompt.value.trim(),
    status: 'pending'
  }]).select();
  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo enviar la solicitud: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo enviar la solicitud (posible bloqueo de permisos).', 'Cerrar');
    return;
  }

  showMsgBox('success', 'Enviada', 'Tu solicitud fue enviada.', 'Cerrar');
  loadMyRequests();
}

async function loadMyRequests() {
  const { data: myRequests, error } = await supabaseClient
    .from('requests')
    .select('*')
    .eq('employee_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  renderMyRequests(myRequests);
}

function renderMyRequests(requests) {
  const container = $('my-requests-list');
  container.innerHTML = '';
  if (!requests || requests.length === 0) {
    container.innerHTML = '<span>No has enviado solicitudes.</span>';
    return;
  }
  requests.forEach(r => {
    const label = statusLabel(r.status);
    const div = document.createElement('div');
    div.className = `element request-${r.status}`;
    div.innerHTML = `
      <i class="${label.icon}"></i>
      <span>${r.type}: ${r.reason}</span>
      <span class="request-status">${label.text}</span>
    `;
    container.appendChild(div);
  });
}

async function loadIncomingRequests() {
  const { data: incoming, error } = await supabaseClient
    .from('requests')
    .select('*')
    .eq('admin_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  renderIncomingRequests(incoming);
}

function renderIncomingRequests(requests) {
  const container = $('incoming-requests-list');
  container.innerHTML = '';
  if (!requests || requests.length === 0) {
    container.innerHTML = '<span>No tienes solicitudes recibidas.</span>';
    return;
  }
  requests.forEach(r => {
    const employeeName = peopleMap[r.employee_id] || 'Empleado';
    const label = statusLabel(r.status);
    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
      <div class="top_wrapper">
        <i class="fi fi-rr-envelope"></i>
        <span class="title">${employeeName} - ${r.type}</span>
        <span class="request-status">${label.text}</span>
      </div>
      <p>${r.reason}</p>
      ${r.status === 'pending' ? `
        <div class="bottom_wrapper">
          <button onclick="resolveRequest('${r.id}', 'approved')"><i class="fi fi-br-check"></i> Aceptar</button>
          <button onclick="resolveRequest('${r.id}', 'rejected')"><i class="fi fi-br-cross"></i> Rechazar</button>
        </div>
      ` : ''}
    `;
    container.appendChild(div);
  });
}

async function resolveRequest(requestId, newStatus) {
  const { data, error } = await supabaseClient
    .from('requests')
    .update({ status: newStatus, resolved_at: new Date().toISOString() })
    .eq('id', requestId)
    .select();

  if (error) {
    showMsgBox('error', 'Error', `No se pudo actualizar la solicitud: ${error.message}`, 'Cerrar');
    return;
  }
  if (!data || data.length === 0) {
    showMsgBox('error', 'Error', 'No se pudo actualizar (posible bloqueo de permisos).', 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', `Solicitud ${newStatus === 'approved' ? 'aceptada' : 'rechazada'}.`, 'Cerrar');
  loadIncomingRequests();
}

//=================================
// Archivos compartidos
//=================================
const MAX_SHARED_FILE_SIZE = 15 * 1024 * 1024; // 15 MB limite

async function resizeImagePreservingAspect(file, maxDimension = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        if (width <= maxDimension && height <= maxDimension) {
          resolve(null);
          return;
        }

        const scale = Math.min(maxDimension / width, maxDimension / height);
        const newWidth = Math.round(width * scale);
        const newHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('No se pudo procesar la imagen')); return; }
          resolve(blob);
        }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadSharedFile() {
  const fileInput = $('new-shared-file');
  if (fileInput.files.length === 0) {
    showMsgBox('error', 'Error', 'Selecciona un archivo primero.', 'Cerrar');
    return;
  }

  let file = fileInput.files[0];
  const originalName = file.name;

  if (file.size > MAX_SHARED_FILE_SIZE) {
    showMsgBox('error', 'Archivo muy pesado', `El archivo supera el límite permitido de ${(MAX_SHARED_FILE_SIZE / (1024*1024)).toFixed(0)}MB.`, 'Cerrar');
    return;
  }

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Procesando archivo...";

  if (file.type.startsWith('image/')) {
    try {
      const resizedBlob = await resizeImagePreservingAspect(file, 1024, 0.85);
      if (resizedBlob) {
        file = new File([resizedBlob], originalName, { type: resizedBlob.type });
      }
    } catch (e) {
      $('loadingModal').classList.add('hidden');
      showMsgBox('error', 'Error', 'No se pudo procesar la imagen.', 'Cerrar');
      return;
    }
  }

  const filePath = `shared/${Date.now()}-${originalName}`;

  $('loadingModal').querySelector('span').textContent = "Subiendo archivo...";

  const { error: uploadError } = await supabaseClient.storage
    .from('shared-files')
    .upload(filePath, file);

  if (uploadError) {
    $('loadingModal').classList.add('hidden');
    showMsgBox('error', 'Error', `No se pudo subir el archivo: ${uploadError.message}`, 'Cerrar');
    return;
  }

  const { data, error } = await supabaseClient.from('files').insert([{
    name: originalName,
    storage_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: currentUser.id
  }]).select();

  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo registrar el archivo: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }

  fileInput.value = '';
  showMsgBox('success', 'Éxito!', 'Archivo subido.', 'Cerrar');
  loadSharedFiles();
}

async function loadSharedFiles() {
  const { data: files, error } = await supabaseClient
    .from('files')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }

  renderSharedFiles(files);

  if (['admin', 'ceo'].includes(userProfile.role)) {
    checkLowUsageFiles(files);
  }
}

function renderSharedFiles(files) {
  const container = $('dynamic-files-container');
  container.innerHTML = '';
  if (!files || files.length === 0) return;

  const isAdmin = ['admin', 'ceo'].includes(userProfile.role);

  files.forEach(f => {
    const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(f.storage_path);
    const isImage = f.mime_type && f.mime_type.startsWith('image/');

    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
      <div class="preview" onclick="openSharedFile('${f.id}', '${urlData.publicUrl}')">
        ${isImage ? `<img alt="${f.name}" src="${urlData.publicUrl}">` : `<i class="fi fi-rr-document"></i>`}
      </div>
      <span class="name" onclick="openSharedFile('${f.id}', '${urlData.publicUrl}')">${f.name}</span>
      <div class="btns">
        <button onclick="openSharedFile('${f.id}', '${urlData.publicUrl}')"><i class="fi fi-rr-eye"></i> Abrir</button>
        <button class="btnsmall" onclick="downloadSharedFile('${f.id}', '${urlData.publicUrl}', '${f.name}')"><i class="fi fi-rr-download"></i></button>
        ${isAdmin ? `<button class="btnsmall" onclick="deleteSharedFile('${f.id}', '${f.storage_path}')"><i class="fi fi-rr-trash"></i></button>` : ''}
      </div>
    `;
    container.appendChild(div);
  });
}

async function deleteSharedFile(fileId, storagePath) {
  const confirmMsg = await showPromptMsgBox('warn', 'Confirmar eliminación', 'Escribe "BORRAR" para eliminar este archivo.', 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed || confirmMsg.value !== 'BORRAR') return;

  $('loadingModal').classList.remove('hidden');
  await supabaseClient.storage.from('shared-files').remove([storagePath]);
  const { error } = await supabaseClient.from('files').delete().eq('id', fileId);
  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo eliminar el archivo: ${error.message}`, 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'Archivo eliminado.', 'Cerrar');
  loadSharedFiles();
}

async function logFileAccess(fileId, action) {
  await supabaseClient.from('file_access_log').insert([{
    file_id: fileId,
    accessed_by: currentUser.id,
    action
  }]);
}

function openSharedFile(fileId, url) {
  logFileAccess(fileId, 'view');
  //window.open(url);
  filePreview(url);
}

function downloadSharedFile(fileId, url, fileName) {
  logFileAccess(fileId, 'download');
  /*const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.dispatchEvent(new MouseEvent('click'));*/
  const nameToUse = fileName || url.split('/').pop().replace(/^\d+-/, '');
  window.open(`${url}?download=${encodeURIComponent(nameToUse)}`);
}

async function checkLowUsageFiles(files) {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const eligibleFiles = files.filter(f => now - new Date(f.created_at).getTime() >= THIRTY_DAYS_MS);
  if (eligibleFiles.length === 0) {
    $('lowUsageAlert').classList.add('hidden');
    return;
  }

  const thirtyDaysAgoIso = new Date(now - THIRTY_DAYS_MS).toISOString();

  const { data: logs, error } = await supabaseClient
    .from('file_access_log')
    .select('file_id')
    .gte('accessed_at', thirtyDaysAgoIso);

  if (error) { console.error(error); return; }

  const accessCounts = {};
  logs.forEach(l => { accessCounts[l.file_id] = (accessCounts[l.file_id] || 0) + 1; });

  const LOW_USAGE_THRESHOLD = 3; //menos de 3 accesos en 30 dias = "casi no se usa"
  const lowUsageFiles = eligibleFiles.filter(f => (accessCounts[f.id] || 0) < LOW_USAGE_THRESHOLD);

  if (lowUsageFiles.length === 0) {
    $('lowUsageAlert').classList.add('hidden');
    return;
  }

  renderLowUsageAlert(lowUsageFiles, accessCounts);
}

function renderLowUsageAlert(files, accessCounts) {
  const container = $('lowUsageList');
  container.innerHTML = '';

  files.forEach(f => {
    const count = accessCounts[f.id] || 0;
    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
      <label>
        <input type="checkbox" class="lowUsageCheckbox" value="${f.id}" data-path="${f.storage_path}">
        ${f.name} (${count} acceso${count === 1 ? '' : 's'} en 30 días)
      </label>
    `;
    container.appendChild(div);
  });

  const delAllBtn = document.createElement('button');
  delAllBtn.innerHTML = `<i class="fi fi-rr-trash"></i> Eliminar seleccionados`;
  delAllBtn.onclick = () => { deleteSelectedLowUsageFiles() };
  container.appendChild(delAllBtn);

  $('lowUsageAlert').classList.remove('hidden');
}

async function deleteSelectedLowUsageFiles() {
  const checked = document.querySelectorAll('.lowUsageCheckbox:checked');
  if (checked.length === 0) {
    showMsgBox('error', 'Nada seleccionado', 'Selecciona al menos un archivo para eliminar.', 'Cerrar');
    return;
  }

  const confirmMsg = await showPromptMsgBox('warn', 'Confirmar eliminación', `Se eliminarán ${checked.length} archivo(s). Escribe "BORRAR" para continuar.`, 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed || confirmMsg.value !== 'BORRAR') return;

  $('loadingModal').classList.remove('hidden');

  for (const checkbox of checked) {
    const fileId = checkbox.value;
    const storagePath = checkbox.dataset.path;
    await supabaseClient.storage.from('shared-files').remove([storagePath]);
    await supabaseClient.from('files').delete().eq('id', fileId);
  }

  $('loadingModal').classList.add('hidden');
  showMsgBox('success', 'Éxito!', 'Archivos eliminados.', 'Cerrar');
  loadSharedFiles();
}

//=================================
// Notifications
//=================================
async function loadNotifications() {
  const { data: seen, error: seenError } = await supabaseClient
    .from('seen_items')
    .select('item_type, item_id')
    .eq('user_id', currentUser.id);

  if (seenError) { console.error(seenError); return; }
  const seenSet = new Set((seen || []).map(s => `${s.item_type}:${s.item_id}`));

  let notifications = [];

  const { data: myTasks } = await supabaseClient
    .from('tasks')
    .select('id, title, created_at')
    .eq('assigned_to', currentUser.id);

  (myTasks || []).forEach(t => {
    if (!seenSet.has(`task:${t.id}`)) {
      notifications.push({ type: 'task', id: t.id, text: `Nueva tarea asignada: ${t.title}`, created_at: t.created_at, targetPage: 'tasks' });
    }
  });

  const { data: news } = await supabaseClient
    .from('announcements')
    .select('id, title, created_at');

  (news || []).forEach(n => {
    if (!seenSet.has(`announcement:${n.id}`)) {
      notifications.push({ type: 'announcement', id: n.id, text: `Nueva novedad: ${n.title}`, created_at: n.created_at, targetPage: 'news' });
    }
  });

  if (['admin', 'ceo'].includes(userProfile.role)) {
    const { data: incoming } = await supabaseClient
      .from('requests')
      .select('id, type, created_at')
      .eq('admin_id', currentUser.id)
      .eq('status', 'pending');

    (incoming || []).forEach(r => {
      if (!seenSet.has(`request:${r.id}`)) {
        notifications.push({ type: 'request', id: r.id, text: `Nueva solicitud: ${r.type}`, created_at: r.created_at, targetPage: 'incomingrequests' });
      }
    });
  }

  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  renderNotifications(notifications);
}

function renderNotifications(notifications) {
  const container = $('notifications-list');
  container.innerHTML = '';

  const badge = $('notifications-badge');
  if (notifications.length > 0) {
    badge.textContent = notifications.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if (!notifications || notifications.length === 0) {
    container.innerHTML = '<span class="empty"><i class="fi fi-rr-party-horn"></i> No tienes notificaciones :D</span>';
    return;
  }

  notifications.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notification-item';
    div.innerHTML = `
      <span onclick="handleNotificationClick('${n.type}', '${n.id}', '${n.targetPage}')">${n.text}</span>
      <button class="btnsmall" onclick="dismissNotification('${n.type}', '${n.id}')"><i class="fi fi-br-cross"></i></button>
    `;
    container.appendChild(div);
  });
}

async function markItemSeen(type, id) {
  await supabaseClient.from('seen_items').upsert(
    [{ user_id: currentUser.id, item_type: type, item_id: id }],
    { onConflict: 'user_id,item_type,item_id' }
  );
}

async function dismissNotification(type, id) {
  await markItemSeen(type, id);
  loadNotifications();
}

async function handleNotificationClick(type, id, targetPage) {
  await markItemSeen(type, id);
  $('notificationsDialog').classList.remove('show');
  loadNotifications();
  gotoPage(targetPage);
}

function toggleNotificationsDialog() {
  const dialog = $('notificationsDialog');
  const opening = !dialog.classList.contains('show');
  dialog.classList.toggle('show');
  if (opening) loadNotifications();
}


//=================================
// Announcements
//=================================
async function createAnnouncement() {
  const title = $('announcement-title').value.trim();
  const body = $('announcement-body').value.trim();
  const imageInput = $('announcement-image');

  if (!title || !body) {
    showMsgBox('error', 'Datos incompletos', 'Debes ingresar un título y un cuerpo para la novedad.', 'Cerrar');
    return;
  }

  let imageUrl = null;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Publicando...";

  if (imageInput.files.length > 0) {
    let file = imageInput.files[0];
    try {
      const resizedBlob = await resizeImagePreservingAspect(file, 1024, 0.85);
      if (resizedBlob) {
        file = new File([resizedBlob], file.name, { type: resizedBlob.type });
      }
    } catch (e) {
      $('loadingModal').classList.add('hidden');
      showMsgBox('error', 'Error', 'No se pudo procesar la imagen.', 'Cerrar');
      return;
    }

    const filePath = `announcements/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseClient.storage.from('shared-files').upload(filePath, file);

    if (uploadError) {
      $('loadingModal').classList.add('hidden');
      showMsgBox('error', 'Error', `No se pudo subir la imagen: ${uploadError.message}`, 'Cerrar');
      return;
    }

    const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(filePath);
    imageUrl = urlData.publicUrl;
  }

  const { data, error } = await supabaseClient.from('announcements').insert([{
    title, body, image_url: imageUrl, created_by: currentUser.id
  }]).select();

  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo publicar la novedad: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }

  $('announcement-title').value = '';
  $('announcement-body').value = '';
  imageInput.value = '';
  showMsgBox('success', 'Éxito!', 'Novedad publicada.', 'Cerrar');
  loadAnnouncements();
}

async function loadAnnouncements() {
  const { data: announcements, error } = await supabaseClient
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }
  renderAnnouncements(announcements);
}

function renderAnnouncements(announcements) {
  const container = $('announcements-list');
  container.innerHTML = '';

  if (!announcements || announcements.length === 0) {
    container.innerHTML = '<span>No hay novedades publicadas.</span>';
    return;
  }

  const isAdmin = ['admin', 'ceo'].includes(userProfile.role);

  announcements.forEach(a => {
    const div = document.createElement('div');
    div.className = 'announcement-card';
    div.innerHTML = `
      ${a.image_url ? `<div class="announcement-image" style="background-image: url('${a.image_url}')"></div>` : ''}
      <h4>${a.title}</h4>
      <span class="announcement-body">${a.body}</span>
      ${isAdmin ? `<button class="btnsmall" onclick="deleteAnnouncement('${a.id}')"><i class="fi fi-rr-trash"></i></button>` : ''}
    `;
    container.appendChild(div);
  });
}

async function deleteAnnouncement(id) {
  const confirmMsg = await showPromptMsgBox('warn', 'Confirmar', 'Escribe "BORRAR" para eliminar esta novedad.', 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed || confirmMsg.value !== 'BORRAR') return;

  const { error } = await supabaseClient.from('announcements').delete().eq('id', id);
  if (error) {
    showMsgBox('error', 'Error', `No se pudo eliminar: ${error.message}`, 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'Novedad eliminada.', 'Cerrar');
  loadAnnouncements();
}

async function loadLatestAnnouncementWidget() {
  const { data: announcements, error } = await supabaseClient
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) { console.error(error); return; }

  if (!announcements || announcements.length === 0) {
    $('newsPreviewTitle').textContent = 'Sin Novedades';
    $('newsPreviewTitle').className = "newsPreviewTitle empty";
    $('newsPreviewBg').style.backgroundImage = '';
    return;
  }

  const latest = announcements[0];
  $('newsPreviewTitle').textContent = latest.title;
  $('newsPreviewTitle').className = "newsPreviewTitle";

  $('newsPreviewBg').style.backgroundImage = latest.image_url
    ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${latest.image_url}')`
    : '';
}

//=================================
// Search 
//=================================
const REQUEST_OPTIONS_STATIC = [
  { name: 'Cambio de Proyecto' },
  { name: 'Cambio de Area de Trabajo' },
  { name: 'Cambio de Datos' },
  { name: 'Renuncia' }
];
let manageablePeopleList = [];

let searchDebounceTimer = null;
$('global-search-input').addEventListener('input', () => {
  clearTimeout(searchDebounceTimer);
  const query = $('global-search-input').value.trim();
  if (query.length < 2) {
    $('global-search-results').classList.remove('hidden');
    $('global-search-results').innerHTML = '<span>Buscando...</span>';
    return;
  }
  searchDebounceTimer = setTimeout(() => performGlobalSearch(query), 300);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.headerSearch')) {
    $('global-search-results').classList.add('hidden');
  }
});

async function performGlobalSearch(query) {
  if (!loggedIn) return;
  const lowerQuery = query.toLowerCase();
  const results = [];

  const { data: tasks } = await supabaseClient
    .from('tasks').select('id, title').ilike('title', `%${query}%`).limit(5);
  (tasks || []).forEach(t => results.push({ category: 'Tarea', label: t.title, action: () => gotoPage('tasks') }));

  const { data: files } = await supabaseClient
    .from('files').select('id, name').ilike('name', `%${query}%`).limit(5);
  (files || []).forEach(f => results.push({ category: 'Archivo', label: f.name, action: () => gotoPage('files') }));

  const { data: announcements } = await supabaseClient
    .from('announcements').select('id, title').ilike('title', `%${query}%`).limit(5);
  (announcements || []).forEach(a => results.push({ category: 'Novedad', label: a.title, action: () => gotoPage('news') }));

  REQUEST_OPTIONS_STATIC.forEach(opt => {
    if (opt.name.toLowerCase().includes(lowerQuery)) {
      results.push({ category: 'Solicitud', label: opt.name, action: () => gotoPage('requests') });
    }
  });

  if (['admin', 'ceo'].includes(userProfile.role)) {
    manageablePeopleList.forEach(person => {
      if (person.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          category: 'Empleado',
          label: person.name,
          action: () => {
            gotoPage('manageemployees');
            setTimeout(() => {
              $('manage-employee-select').value = person.id;
              loadEmployeeManagement();
            }, 50);
          }
        });
      }
    });
  }

  renderSearchResults(results);
}

function renderSearchResults(results) {
  const container = $('global-search-results');
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = '<div class="search-empty">Sin resultados</div>';
    container.classList.remove('hidden');
    return;
  }

  results.forEach(r => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.innerHTML = `<span class="search-category">${r.category}</span><span class="search-label">${r.label}</span>`;
    div.onclick = () => {
      r.action();
      $('global-search-input').value = '';
      container.classList.add('hidden');
    };
    container.appendChild(div);
  });

  container.classList.remove('hidden');
}

//=================================
// Stats
//=================================
async function loadStatsPage() {
  const THIRTY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: activity, error } = await supabaseClient
    .from('activity_log')
    .select('user_id, event_type, page, created_at')
    .gte('created_at', THIRTY_DAYS_AGO);

  if (error) { console.error(error); return; }

  const logins = activity.filter(a => a.event_type === 'login');
  const pageViews = activity.filter(a => a.event_type === 'page_view');

  $('stat-total-logins').textContent = logins.length;
  $('stat-total-pageviews').textContent = pageViews.length;

  renderTopPages(pageViews);
  renderLoginsByUser(logins);
  await renderSecurityStatus();
}

function renderTopPages(pageViews) {
  const counts = {};
  pageViews.forEach(pv => { counts[pv.page] = (counts[pv.page] || 0) + 1; });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const container = $('stats-top-pages');
  container.innerHTML = '';
  if (sorted.length === 0) {
    container.innerHTML = '<span>Sin datos todavía.</span>';
    return;
  }
  sorted.forEach(([page, count]) => {
    const div = document.createElement('div');
    div.className = 'stats-row';
    div.innerHTML = `<span>${page}</span><span class="stats-count">${count} vistas</span>`;
    container.appendChild(div);
  });
}

function renderLoginsByUser(logins) {
  const counts = {};
  logins.forEach(l => { counts[l.user_id] = (counts[l.user_id] || 0) + 1; });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const container = $('stats-logins-by-user');
  container.innerHTML = '';
  if (sorted.length === 0) {
    container.innerHTML = '<span>Sin datos todavía.</span>';
    return;
  }
  sorted.forEach(([userId, count]) => {
    const name = peopleMap[userId] || 'Usuario desconocido';
    const div = document.createElement('div');
    div.className = 'stats-row';
    div.innerHTML = `<span>${name}</span><span class="stats-count">${count} inicios de sesión</span>`;
    container.appendChild(div);
  });
}

async function renderSecurityStatus() {
  const { data: allProfiles, error } = await supabaseClient
    .from('profiles')
    .select('id, name, password_changed, pin_changed');

  if (error) { console.error(error); return; }

  const pendingCount = allProfiles.filter(p => !p.password_changed || !p.pin_changed).length;
  $('stat-pending-security').textContent = pendingCount;

  const container = $('stats-security-status');
  container.innerHTML = '';

  allProfiles.forEach(p => {
    const isSecure = p.password_changed && p.pin_changed;
    const div = document.createElement('div');
    div.className = 'stats-row';
    div.innerHTML = `
      <span>${p.name}</span>
      <span class="stats-security-badge ${isSecure ? 'secure' : 'insecure'}">
        ${isSecure ? '<i class="fi fi-br-check"></i> Protegida' : `<i class="fi fi-rr-triangle-warning"></i> ${!p.password_changed ? 'Contraseña sin cambiar' : ''}${!p.password_changed && !p.pin_changed ? ' / ' : ''}${!p.pin_changed ? 'PIN sin cambiar' : ''}`}
      </span>
    `;
    container.appendChild(div);
  });
}

async function clearActivityStats() {
  const confirmMsg = await showPromptMsgBox('warn', 'Confirmar eliminación', 'Esto borrará TODOS los registros de inicios de sesión y páginas visitadas. Los datos de contraseña/PIN protegidos NO se ven afectados. Escribe "BORRAR" para continuar.', 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed || confirmMsg.value !== 'BORRAR') return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Borrando estadísticas...";

  const { error } = await supabaseClient.from('activity_log').delete().not('id', 'is', null);

  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo borrar: ${error.message}`, 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'Estadísticas borradas.', 'Cerrar');
  loadStatsPage();
}

//=================================
// Online Users
//=================================
let presenceChannel = null;
let onlineOthersCount = 0;

function setupPresence() {
	presenceChannel = supabaseClient.channel('online-users', {
		config: { presence: { key: currentUser.id } }
	});

	presenceChannel.on('presence', { event: 'sync' }, () => {
		const state = presenceChannel.presenceState();
		const totalOnline = Object.keys(state).length;
		onlineOthersCount = Math.max(0, totalOnline - 1);
		applyOnlinePresenceToWidget();
		if (!$('page_directory').classList.contains('hidden')) {
			applyDirectoryFilter();
		}
	});

	presenceChannel.subscribe(async (status) => {
		if (status === 'SUBSCRIBED') {
		await presenceChannel.track({ name: userProfile.name, online_at: new Date().toISOString() });
		}
	});
}

function applyOnlinePresenceToWidget() {
	if ($('dashboard_widget_brief').classList.contains('status_ok')) {
		if (onlineOthersCount > 0) {
			$('dashboard_widget_brief').querySelector('.status').textContent =
			`${onlineOthersCount} persona${onlineOthersCount === 1 ? '' : 's'} está${onlineOthersCount === 1 ? '' : 'n'} en línea!`;
		} else {
			$('dashboard_widget_brief').querySelector('.status').textContent = "Todo correcto por aqui!";
		}
	}
}

//=================================
// Mantenince
//=================================
let platformMaintenanceMode = false;
let secretClickCount = 0;
let secretClickTimer = null;

async function checkMaintenanceMode() {
  const { data, error } = await supabaseClient.from('platform_settings').select('maintenance_mode').eq('id', 1).single();
  if (error) { console.error(error); return; }
  platformMaintenanceMode = data.maintenance_mode;
  applyMaintenanceScreenState();
}
checkMaintenanceMode();

function applyMaintenanceScreenState() {
  if (platformMaintenanceMode) {
    $('notAvailable').classList.add('hidden');
    $('login-section').classList.add('hidden');
    $('maintenanceScreen').classList.remove('hidden');
  } else {
    $('maintenanceScreen').classList.add('hidden');
    //const plataformActivated = localStorage.getItem('localTestingBN_activated');
    if (plataformActivated === 'true') {
      $('notAvailable').classList.add('hidden');
      $('login-section').classList.remove('hidden');
    } else {
      $('notAvailable').classList.remove('hidden');
      $('login-section').classList.add('hidden');
    }
  }
}

function secretMaintenanceClick() {
  secretClickCount++;
  clearTimeout(secretClickTimer);
  secretClickTimer = setTimeout(() => { secretClickCount = 0; }, 2000);
  if (secretClickCount >= 5) {
    secretClickCount = 0;
    $('maintenanceScreen').classList.add('hidden');
    $('notAvailable').classList.add('hidden');
    $('login-section').classList.remove('hidden');
  }
}

async function toggleMaintenanceMode() {
  const confirmMsg = await showAskBox(
    'warn',
    'Modo Mantenimiento',
    platformMaintenanceMode
      ? '¿Desactivar el modo mantenimiento?'
      : '¿Activar el modo mantenimiento? Todos los usuarios conectados tendrán 1 minuto para finalizar su trabajo antes de ser desconectados.',
    'Confirmar', 'Cancelar'
  );
  if (!confirmMsg.confirmed) return;

  const newState = !platformMaintenanceMode;
  const { error } = await supabaseClient
    .from('platform_settings')
    .update({ maintenance_mode: newState, maintenance_initiated_at: newState ? new Date().toISOString() : null })
    .eq('id', 1);

  if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }
  showMsgBox('success', 'Éxito!', `Modo mantenimiento ${newState ? 'activado' : 'desactivado'}.`, 'Cerrar');
}

function subscribeToMaintenanceMode() {
  supabaseClient.channel('maintenance-mode')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, (payload) => {
      if (payload.new.maintenance_mode === true && loggedIn) {
        showMaintenanceCountdown();
      }
    })
    .subscribe();
}

function showMaintenanceCountdown() {
  if ($('maintenanceWarningOverlay').classList.contains('show')) return;
  $('maintenanceWarningOverlay').classList.add('show');
  let secondsLeft = 60;
  $('maintenanceCountdownNum').textContent = secondsLeft;
  const interval = setInterval(() => {
    secondsLeft--;
    $('maintenanceCountdownNum').textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(interval);
      forceMaintenanceLogout();
    }
  }, 1000);
}

async function forceMaintenanceLogout() {
  await supabaseClient.auth.signOut();
  loggedIn = false;
  window.location.reload();
}

//=================================
// Feedback
//=================================
async function sendFeedback() {
  const type = $('feedback-type').value;
  const message = $('feedback-message').value.trim();
  if (!message) { showMsgBox('error', 'Error', 'Escribe un mensaje antes de enviar.', 'Cerrar'); return; }

  $('loadingModal').classList.remove('hidden');
  const { data, error } = await supabaseClient.from('feedback').insert([{ user_id: currentUser.id, type, message }]).select();
  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo enviar: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }
  $('feedback-message').value = '';
  showMsgBox('success', 'Éxito!', 'Gracias por tu feedback!', 'Cerrar');
}

async function loadFeedbackList() {
  if (!['admin', 'ceo'].includes(userProfile.role)) return;

  const { data: items, error } = await supabaseClient.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }

  $('admin-feedback-list').classList.remove('hidden');
  const container = $('feedback-list-container');
  container.innerHTML = '';
  if (!items || items.length === 0) { container.innerHTML = '<span>No hay feedback todavía.</span>'; return; }

  const typeLabels = { idea: 'Sugerencia', bug: 'Bug', general: 'Comentario' };
  items.forEach(f => {
    const name = peopleMap[f.user_id] || 'Usuario';
    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
      <div class="top_wrapper">
        <span class="title">${typeLabels[f.type] || f.type} - ${name}</span>
      </div>
      <p>${f.message}</p>
    `;
    container.appendChild(div);
  });
}

//=================================
// Realtime requests
//=================================
function subscribeToIncomingRequests() {
  if (!['admin', 'ceo'].includes(userProfile.role)) return;

  supabaseClient.channel('realtime:incoming-requests')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests', filter: `admin_id=eq.${currentUser.id}` }, (payload) => {
      playNotificationSound();
      sendBrowserNotification('Nueva Solicitud', `${peopleMap[payload.new.employee_id] || 'Un empleado'} envió una solicitud: ${payload.new.type}`);
      loadNotifications();
      if (!$('page_incomingrequests').classList.contains('hidden')) {
        loadIncomingRequests();
      }
    })
    .subscribe();
}

function playNotificationSound() {
  try {
    const audio = new Audio('/assets/notification.mp3');
    audio.play().catch(() => {});
  } catch (e) {}
}

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

function sendBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/assets/breadnet_small.webp' });
  }
}

//=================================
// Lock App (idle)
//=================================
let isManualIdle = false;

function manualIdleLock() {
  isManualIdle = true;
  clearTimeout(inactivityTimer);
  isPinLocked = true;
  $('softLockOverlay').classList.add('show');
  $('softLockAlertOverlay').classList.remove('show');
}

//=================================
// Employee Directory
//=================================
let directoryFullData = [];
let directoryMode = 'normal'; // 'normal' o 'advanced'

const DIRECTORY_NORMAL_COLUMNS = [
  { key: 'online', label: 'Estado' },
  { key: 'name', label: 'Nombre' },
  { key: 'username', label: 'Usuario' },
  { key: 'email', label: 'Correo' },
  { key: 'role', label: 'Rol' },
  { key: 'eid', label: 'EID' },
  { key: 'phone_number', label: 'Teléfono' },
  { key: 'birth_date', label: 'Nacimiento' }
];

const DIRECTORY_ADVANCED_COLUMNS = [
  ...DIRECTORY_NORMAL_COLUMNS,
  { key: 'id', label: 'UID (Supabase)' },
  { key: 'created_at', label: 'Creado' },
  { key: 'is_banned', label: 'Baneado' },
  { key: 'ban_reason', label: 'Razón Baneo' },
  { key: 'ban_expires_at', label: 'Baneo Expira' },
  { key: 'password_changed', label: 'Contraseña Cambiada' },
  { key: 'pin_changed', label: 'PIN Cambiado' },
  { key: 'photo_url', label: 'Foto de Perfil' },
  { key: 'current_cid', label: 'CID Ligado' },
  { key: 'working_areas', label: 'Departamentos' }
];

async function loadDirectory() {
  if (userProfile.role !== 'ceo') return;

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Cargando directorio...";

  const { data: profilesData, error: profilesError } = await supabaseClient.from('profiles').select('*');
  const { data: emailsData, error: emailsError } = await supabaseClient.rpc('get_all_emails');

  $('loadingModal').classList.add('hidden');

  if (profilesError || emailsError) {
    showMsgBox('error', 'Error', `No se pudo cargar el directorio: ${profilesError ? profilesError.message : emailsError.message}`, 'Cerrar');
    return;
  }

  const emailMap = {};
  (emailsData || []).forEach(e => { emailMap[e.id] = e.email; });

  directoryFullData = profilesData
    /*.filter(p => p.role !== 'ceo') */
    .map(p => ({ ...p, email: emailMap[p.id] || '—' }));

  renderDirectoryTable(directoryFullData);
}

function toggleDirectoryMode() {
  directoryMode = $('directory-mode-toggle').checked ? 'advanced' : 'normal';
  $('directory-mode-label').textContent = directoryMode === 'advanced' ? 'Avanzada' : 'Normal';
  applyDirectoryFilter();
}

function applyDirectoryFilter() {
  const query = $('directory-search-input').value.trim().toLowerCase();
  if (!query) {
    renderDirectoryTable(directoryFullData);
    return;
  }
  const filtered = directoryFullData.filter(p => {
    return [p.name, p.username, p.email, p.id, p.eid, p.phone_number, p.role]
      .some(field => field && field.toString().toLowerCase().includes(query));
  });
  renderDirectoryTable(filtered);
}

$('directory-search-input')?.addEventListener('input', applyDirectoryFilter);

function isUserOnline(userId) {
  if (!presenceChannel) return false;
  const state = presenceChannel.presenceState();
  return Object.prototype.hasOwnProperty.call(state, userId);
}

function formatDirectoryValue(key, value, row) {
  if (key === 'online') {
    return isUserOnline(row.id)
      ? `<span class="directory-online-badge online"><i class="fi fi-br-check"></i> En línea</span>`
      : `<span class="directory-online-badge offline">Desconectado</span>`;
  }
  if (key === 'photo_url') {
    return value ? `<img src="${value}" class="directory-thumb">` : '—';
  }
  if (key === 'is_banned') {
    return value ? `<span class="directory-badge danger">Sí</span>` : `<span class="directory-badge ok">No</span>`;
  }
  if (key === 'password_changed' || key === 'pin_changed') {
    return value ? `<span class="directory-badge ok">Sí</span>` : `<span class="directory-badge danger">No</span>`;
  }
  if (key === 'created_at' || key === 'ban_expires_at') {
    return value ? new Date(value).toLocaleString() : '—';
  }
  if (key === 'birth_date') {
    return value ? new Date(value).toLocaleDateString() : '—';
  }
  return (value === null || value === undefined || value === '') ? '—' : value;
}

function renderDirectoryTable(rows) {
  const columns = directoryMode === 'advanced' ? DIRECTORY_ADVANCED_COLUMNS : DIRECTORY_NORMAL_COLUMNS;

  const thead = $('directory-table-head');
  thead.innerHTML = `<tr>${columns.map(c => `<th>${c.label}</th>`).join('')}<th>Acción</th></tr>`;

  const tbody = $('directory-table-body');
  tbody.innerHTML = '';

  $('directory-count').textContent = `${rows.length} cuenta${rows.length === 1 ? '' : 's'} encontrada${rows.length === 1 ? '' : 's'}`;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columns.length + 1}">Sin resultados.</td></tr>`;
    return;
  }

  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = columns.map(c => `<td>${formatDirectoryValue(c.key, row[c.key], row)}</td>`).join('')
      + `<td><button class="btnsmall" onclick="goToManageFromDirectory('${row.id}')"><i class="fi fi-rr-user-gear"></i></button></td>`;
    tbody.appendChild(tr);
  });
}

function goToManageFromDirectory(userId) {
  gotoPage('manageemployees');
  setTimeout(() => {
    $('manage-employee-select').value = userId;
    loadEmployeeManagement();
  }, 50);
}

function exportDirectoryCsv() {
  const columns = directoryMode === 'advanced' ? DIRECTORY_ADVANCED_COLUMNS : DIRECTORY_NORMAL_COLUMNS;
  const query = $('directory-search-input').value.trim().toLowerCase();
  const rows = query
    ? directoryFullData.filter(p => [p.name, p.username, p.email, p.id, p.eid, p.phone_number, p.role].some(f => f && f.toString().toLowerCase().includes(query)))
    : directoryFullData;

  const header = columns.filter(c => c.key !== 'online' && c.key !== 'photo_url').map(c => c.label);
  const csvRows = [header.join(',')];

  rows.forEach(row => {
    const line = columns
      .filter(c => c.key !== 'online' && c.key !== 'photo_url')
      .map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      });
    csvRows.push(line.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `breadnet-directorio-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

//=================================
// Identifications (photos and data)
//=================================
let currentManagedIdentification = null;

async function loadEmployeeIdentification(employeeId) {
  const { data, error } = await supabaseClient
    .from('employee_identification')
    .select('*')
    .eq('user_id', employeeId)
    .maybeSingle();

  if (error) { console.error(error); return; }

  currentManagedIdentification = data;

  $('id-number-input').value = data?.id_number || '';
  $('id-unique-input').value = data?.unique_id_number || '';
  $('id-registered-input').value = data?.registered_at || '';
  $('id-valid-input').checked = data ? data.is_valid : true;
  $('id-requests-input').value = data?.requests_count ?? 0;
  $('id-lost-input').value = data?.lost_count ?? 0;
}

async function saveEmployeeIdentification() {
  if (!currentManagedEmployee) return;

  const payload = {
    user_id: currentManagedEmployee.id,
    id_number: $('id-number-input').value.trim() || null,
    unique_id_number: $('id-unique-input').value.trim() || null,
    registered_at: $('id-registered-input').value || null,
    is_valid: $('id-valid-input').checked,
    requests_count: parseInt($('id-requests-input').value) || 0,
    lost_count: parseInt($('id-lost-input').value) || 0,
    updated_at: new Date().toISOString(),
    updated_by: currentUser.id
  };

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Guardando identificación...";

  const frontInput = $('id-photo-front-input');
  const backInput = $('id-photo-back-input');

  if (frontInput.files.length > 0) {
    let file = frontInput.files[0];
    try {
      const resized = await resizeImagePreservingAspect(file, 1024, 0.85);
      if (resized) file = new File([resized], file.name, { type: resized.type });
    } catch (e) {}

    const path = `id-photos/${currentManagedEmployee.id}-front-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabaseClient.storage.from('shared-files').upload(path, file);
    if (upErr) {
      $('loadingModal').classList.add('hidden');
      showMsgBox('error', 'Error', `No se pudo subir la foto frontal: ${upErr.message}`, 'Cerrar');
      return;
    }
    const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(path);
    payload.photo_front_url = urlData.publicUrl;
  }

  if (backInput.files.length > 0) {
    let file = backInput.files[0];
    try {
      const resized = await resizeImagePreservingAspect(file, 1024, 0.85);
      if (resized) file = new File([resized], file.name, { type: resized.type });
    } catch (e) {}

    const path = `id-photos/${currentManagedEmployee.id}-back-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabaseClient.storage.from('shared-files').upload(path, file);
    if (upErr) {
      $('loadingModal').classList.add('hidden');
      showMsgBox('error', 'Error', `No se pudo subir la foto trasera: ${upErr.message}`, 'Cerrar');
      return;
    }
    const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(path);
    payload.photo_back_url = urlData.publicUrl;
  }

  const { data, error } = await supabaseClient
    .from('employee_identification')
    .upsert([payload], { onConflict: 'user_id' })
    .select();

  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo guardar: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }

  frontInput.value = '';
  backInput.value = '';
  showMsgBox('success', 'Éxito!', 'Identificación actualizada.', 'Cerrar');
  loadEmployeeIdentification(currentManagedEmployee.id);
}

async function loadMyIdentification() {
  const { data, error } = await supabaseClient
    .from('employee_identification')
    .select('*')
    .eq('user_id', currentUser.id)
    .maybeSingle();

  if (error) { console.error(error); return; }

  $('idData-number').textContent = data?.id_number || 'No asignado';
  $('idData-unique').textContent = data?.unique_id_number || 'No asignado';
  $('idData-registered').textContent = data?.registered_at ? new Date(data.registered_at).toLocaleDateString() : 'No asignado';
  $('idData-valid').textContent = data ? (data.is_valid ? 'Sí' : 'No') : 'No asignado';
  $('idData-requests').textContent = data?.requests_count ?? 0;
  $('idData-lost').textContent = data?.lost_count ?? 0;

  if (data?.photo_front_url) $('pageIdentificationIDP_front').src = data.photo_front_url;
  if (data?.photo_back_url) $('pageIdentificationIDP_back').src = data.photo_back_url;
}

//=================================
// Public CID / ID QR Code
//=================================
(function checkCidParam() {
  const params = new URLSearchParams(window.location.search);
  const cid = params.get('cid');
  if (cid) {
    $('cidLookupScreen').classList.remove('hidden');
    lookupCid(cid);
  }
})();

async function lookupCid(cid) {
  const body = $('cidLookupBody');
  body.innerHTML = '<span>Verificando ID...</span>';

  const { data, error } = await supabaseClient.rpc('lookup_id_card_public', { p_cid: cid });

  if (error || !data) {
    body.innerHTML = `<i class="fi fi-rr-triangle-warning"></i><h2>Error</h2><span>No se pudo verificar este ID en este momento.</span>`;
    return;
  }

  if (data.status === 'not_found') {
    body.innerHTML = `<i class="fi fi-rr-triangle-warning"></i><h2>ID no encontrado</h2><span>Este código no corresponde a ningún ID de BreadNet.</span>`;
  } else if (data.status === 'lost' || data.status === 'stolen') {
    body.innerHTML = `<i class="fi fi-rr-ban"></i><h2>ID ${data.status === 'lost' ? 'Perdido' : 'Robado'}</h2><span>Este ID ha sido reportado como ${data.status === 'lost' ? 'perdido' : 'robado'} y ya no es válido. Por favor, entrégalo al departamento de sistemas de Just A Bread Studios.</span>`;
  } else if (data.status === 'active') {
    body.innerHTML = `
      <img src="${data.photo_url || '/assets/userdefault.jpg'}" class="cidLookupPhoto">
      <h2>${data.name}</h2>
      <span><i class="fi fi-rr-envelope"></i> ${data.email || 'No disponible'}</span>
      <span><i class="fi fi-rr-phone-call"></i> ${data.phone_number || 'No disponible'}</span>
      ${data.working_areas && data.working_areas.length ? `<span><i class="fi fi-rr-briefcase"></i> ${data.working_areas.join(', ')}</span>` : ''}
      <p class="cidLookupValidBadge"><i class="fi fi-br-check"></i> ID Vigente</p>
    `;
  } else {
    body.innerHTML = `<span>Estado desconocido.</span>`;
  }
}

//=================================
// CID/IDs Manager
//=================================
function renderCidQr(cid) {
  if (!cid) {
    $('current-cid-qr-wrapper').classList.add('hidden');
    return;
  }
  const lookupUrl = `${window.location.origin}${window.location.pathname}?cid=${encodeURIComponent(cid)}`;
  $('current-cid-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(lookupUrl)}`;
  $('current-cid-qr-wrapper').classList.remove('hidden');
}

async function assignNewCid() {
  if (!currentManagedEmployee) return;
  const newCid = $('new-cid-input').value.trim();
  if (!newCid) {
    showMsgBox('error', 'Error', 'Ingresa un CID.', 'Cerrar');
    return;
  }

  const oldCid = currentManagedEmployee.current_cid;

  if (oldCid === newCid) {
    showMsgBox('error', 'Error', 'Ese ya es el CID actual de este empleado.', 'Cerrar');
    return;
  }

  let oldCidReason = null;
  if (oldCid) {
    const choice = await showAskBox(
      'warn',
      'ID Anterior Detectado',
      `Este empleado ya tenía un ID (CID: ${oldCid}). ¿Cómo se debe marcar el ID anterior?`,
      'Marcar como Perdido',
      'Marcar como Robado'
    );
    oldCidReason = choice.confirmed ? 'lost' : 'stolen';
  }

  $('loadingModal').classList.remove('hidden');
  $('loadingModal').querySelector('span').textContent = "Asignando nuevo ID...";

  if (oldCid && oldCidReason) {
    await supabaseClient
      .from('id_cards')
      .update({
        status: oldCidReason,
        status_reason: 'Reemplazado por nuevo ID',
        status_changed_at: new Date().toISOString(),
        status_changed_by: currentUser.id
      })
      .eq('cid', oldCid);
  }

  const { error: insertError } = await supabaseClient.from('id_cards').insert([{
    cid: newCid,
    user_id: currentManagedEmployee.id,
    status: 'active'
  }]);

  if (insertError) {
    $('loadingModal').classList.add('hidden');
    showMsgBox('error', 'Error', `No se pudo crear el nuevo ID (¿CID duplicado?): ${insertError.message}`, 'Cerrar');
    return;
  }

  const { data, error: updateError } = await supabaseClient
    .from('profiles')
    .update({ current_cid: newCid })
    .eq('id', currentManagedEmployee.id)
    .select();

  $('loadingModal').classList.add('hidden');

  if (updateError || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo actualizar el CID actual: ${updateError ? updateError.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }

  currentManagedEmployee.current_cid = newCid;
  $('current-cid-display').textContent = newCid;
  $('new-cid-input').value = '';
  renderCidQr(newCid);
  showMsgBox('success', 'Éxito!', 'Nuevo ID asignado.', 'Cerrar');
  loadIdCardsHistory(currentManagedEmployee.id);
}

async function loadIdCardsHistory(employeeId) {
  const { data, error } = await supabaseClient
    .from('id_cards')
    .select('*')
    .eq('user_id', employeeId)
    .order('issued_at', { ascending: false });

  if (error) { console.error(error); return; }

  const container = $('id-cards-history');
  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = '<span>Este empleado no tiene IDs registrados.</span>';
    return;
  }

  const currentCid = currentManagedEmployee?.current_cid;

  data.forEach(card => {
    const isCurrent = card.cid === currentCid;
    const div = document.createElement('div');
    div.className = 'element';
    div.innerHTML = `
      <i class="fi fi-rr-id-badge"></i>
      <span>${card.cid} ${isCurrent ? '<strong>(Actual)</strong>' : ''} — <span class="directory-badge ${card.status === 'active' ? 'ok' : 'danger'}">${card.status}</span></span>
      ${!isCurrent && card.status === 'active' ? `
        <button class="btnsmall" onclick="markIdCardStatus('${card.cid}', 'lost')" data-tooltip="Marcar Perdido"><i class="fi fi-rr-question"></i></button>
        <button class="btnsmall" onclick="markIdCardStatus('${card.cid}', 'stolen')" data-tooltip="Marcar Robado"><i class="fi fi-rr-ban"></i></button>
      ` : ''}
    `;
    container.appendChild(div);
  });
}

async function markIdCardStatus(cid, status) {
  const confirmMsg = await showAskBox('warn', 'Confirmar', `¿Marcar el ID ${cid} como ${status === 'lost' ? 'perdido' : 'robado'}?`, 'Confirmar', 'Cancelar');
  if (!confirmMsg.confirmed) return;

  $('loadingModal').classList.remove('hidden');
  const { error } = await supabaseClient
    .from('id_cards')
    .update({ status, status_reason: 'Marcado manualmente', status_changed_at: new Date().toISOString(), status_changed_by: currentUser.id })
    .eq('cid', cid);
  $('loadingModal').classList.add('hidden');

  if (error) {
    showMsgBox('error', 'Error', `No se pudo actualizar: ${error.message}`, 'Cerrar');
    return;
  }
  showMsgBox('success', 'Éxito!', 'ID actualizado.', 'Cerrar');
  loadIdCardsHistory(currentManagedEmployee.id);
}

//=================================
// Work Areas
//=================================
async function saveWorkingAreas() {
  if (!currentManagedEmployee) return;
  const raw = $('working-areas-input').value.trim();
  const areas = raw ? raw.split(',').map(a => a.trim()).filter(Boolean) : [];

  $('loadingModal').classList.remove('hidden');
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ working_areas: areas })
    .eq('id', currentManagedEmployee.id)
    .select();
  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo guardar: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }
  currentManagedEmployee.working_areas = areas;
  showMsgBox('success', 'Éxito!', 'Áreas de trabajo actualizadas.', 'Cerrar');
}