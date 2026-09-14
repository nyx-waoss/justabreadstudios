const $ = (el) => document.getElementById(el);
function hideAllPages() {
    document.body.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
}

let loggedIn = false;

async function runDependentFunctionsOfPage(page) {
	if (page === "strikes") {
		loadMyAccountStatus();
	}
	if (page === "home") {
		loadMyAccountStatus();
    	loadLatestAnnouncementWidget();
		loadCustomBanner();
		loadQuickActionsWidget();
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
	if (page === "store") {
		//loadStore(); //descomentar cuando se lanze la store
		await showAskBox('warn', 'No disponible', 'La tienda todavia no esta disponible, pero la agregaremos en la proxima actualizacion!', 'Vale', 'Cerrar'); //comentar cuando se lanze la store
		gotoPage('home');
	}
	if (page === "settings") {
		loadInventory();
	}
	if (page === "termsreview") {
		loadTermsReviewPanel();
	}

	if (page === "chat" && loggedIn) {
		subscribeToChatRealtime();
		loadChatsList();
	} else {
		unsubscribeFromChatRealtime();
	}
}

function gotoPage(page = "home") {
	hideAllPages();
	console.log("Navigate to:", page);
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
			const deviceInfo = detectDeviceInfo();
			supabaseClient.from('activity_log').insert([{
				user_id: currentUser.id,
				event_type: 'page_view',
				page,
				device_type: deviceInfo.deviceType,
				os_name: deviceInfo.osName,
				browser_name: deviceInfo.browserName
			}]);
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
	} else if (com == 'version') {
    console.log("BreadNet v1.0.0 --- Deploy 6 --- TSXG v1.0.0");
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

$('headerMoreOptionsBtn').onclick = () => {
	$('headerMoreOptionsDialog').classList.toggle('show');
};

$('headerMoreOptionsDialog_btnSearch').onclick = () => {
	setTimeout(() => {
		document.getElementById('header').classList.toggle('displaySearch');

		$('headerMoreOptionsDialog').classList.remove('show');
	}, 100);
};
$('headerMoreOptionsDialog_btnLock').onclick = () => {
	setTimeout(() => {
		manualIdleLock();

		$('headerMoreOptionsDialog').classList.remove('show');
	}, 100);
};
$('headerMoreOptionsDialog_btnSticky').onclick = () => {
	setTimeout(() => {
		createStickyNote();

		$('headerMoreOptionsDialog').classList.remove('show');
	}, 100);
};

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
// Weather Widget
//=================================
	async function cargarClima() {
	let lat = 9.9281;
	let lon = -84.0907;

	try {
		const ipRes = await fetch('https://ipapi.co/json/');
		const ipData = await ipRes.json();
		if (ipData.latitude && ipData.longitude) {
			lat = ipData.latitude;
			lon = ipData.longitude;
		}
	} catch (e) {
		console.log("Uso de ubicación default (San José)");
	}

	try {
		const weatherRes = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
		);
		const weatherData = await weatherRes.json();
		const temp = Math.round(weatherData.current_weather.temperature);
		const code = weatherData.current_weather.weathercode;

		const infoClima = obtenerDetallesClima(code);

		$('weatherTitle').innerText = `${infoClima.texto} | ${temp}°C`;
		$('weatherPreviewBg').style.backgroundImage = `url('${infoClima.bg}')`;
	} catch (e) {
		console.error("Error al cargar clima", e);
	}
}

function obtenerDetallesClima(code) {
	if (code === 0) {
		return {
			texto: "Soleado",
			bg: "https://images.unsplash.com/photo-1615286628718-4a4c8924d0eb?q=80&w=1170&auto=format&fit=crop"
		};
	} else if ([1, 2, 3].includes(code)) {
		return {
			texto: "Parcialmente Nublado",
			bg: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format&fit=crop"
		};
	} else if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) {
		return {
			texto: "Lluvia leve",
			bg: "https://images.unsplash.com/photo-1507027682794-35e6c12ad5b4?q=80&w=687&auto=format&fit=crop"//https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=800&auto=format&fit=crop
		};
	} else if ([95, 96, 99].includes(code)) {
		return {
			texto: "Tormenta",
			bg: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=800&auto=format&fit=crop" //https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fthumbnails%2F042%2F195%2F723%2Fsmall_2x%2Fai-generated-rainy-sky-observations-background-free-photo.jpg&f=1&nofb=1&ipt=b002fe9358c3621b73b0b9ba71743dad09b922ba49c173124ee60f012a7868bb
		};
	}
	
	return {
		texto: "Nublado",
		bg: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?q=80&w=800&auto=format&fit=crop"
	};
}


cargarClima();

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
		addCatPoints(5, 'Cambio de contraseña');
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
		addCatPoints(5, 'Cambio de PIN');
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
			showMsgBox('error', 'Error', 'No se pudo actualizar el perfil (error interno del servidor, por favor reporte este error).', 'Cerrar');
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

let supabaseClient = null;
if (typeof window.supabase !== 'undefined') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.warn("Cannot load Supabase. Check your internet connection");
}

let currentUser = null;
let userProfile = null;
let peopleMap = {};

document.getElementById('btn-login').addEventListener('click', async () => {
  if (!navigator.onLine) {
    $('login_error_message').textContent = `No hay conexión a internet.`;
    return;
  }
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
			$('login_error_message').textContent = `Ocurrio un error de comunicacion con el servidor, intentelo nuevamente.`;
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

const breadNetProgramVer = "1";
async function initDashboard(user) {
	currentUser = user;
	//recordLoginTimestamp(user.id);
	updateLoginStreak();

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
	await checkTermsStatus();
	subscribeToTermsChanges();

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

	if ( !localStorage.getItem('breadnetProgramVer')
			|| (localStorage.getItem('breadnetProgramVer') && Number(localStorage.getItem('breadnetProgramVer')) < Number(breadNetProgramVer))
		) {
		setTimeout(() => {
			showMsgBox('info', 'Sistema Actualizado', 'BreadNet acaba de actualizarse a la version v1.0.1, incluyendo nuevas funciones ✨️', 'Cerrar');
		}, 300);
		localStorage.setItem('breadnetProgramVer', breadNetProgramVer);
	}

	gotoPage('home');
	document.getElementById('user-welcome').innerHTML = await getSmartGreeting(profile);
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

	applyEquippedItems();

  	await loadPeopleMap();
	await loadSystemAccountIds();

	if (['admin', 'ceo'].includes(profile.role)) {
		await loadEmployeesDropdowns();
		document.getElementById('btn-create-task').addEventListener('click', createTask);
		$('assigneTaskBtn').classList.remove('hidden');
		$('admin-upload-file').classList.remove('hidden');
    	$('admin-create-announcement').classList.remove('hidden');
		$('newGroupBtn').classList.remove('hidden');
		$('adminCategory').classList.remove('hidden');

		if (profile.role === 'ceo') {
			$('maintenanceToggleBtn').classList.remove('hidden');
			$('directoryBtn').classList.remove('hidden');
      		$('manage-identification-section').classList.remove('hidden');
			$('admin-store-manage').classList.remove('hidden');
			$('publishTermsBtn').classList.remove('hidden');
			$('termsReviewBtn').classList.remove('hidden');
		}

		requestNotificationPermission();
		subscribeToIncomingRequests();
	}

	loadTasks();
	subscribeToTasks();
	loadNotifications();
	setupPresence();
	subscribeToMaintenanceMode();
	const deviceInfo = detectDeviceInfo();
	await supabaseClient.from('activity_log').insert([{
		user_id: currentUser.id,
		event_type: 'login',
		device_type: deviceInfo.deviceType,
		os_name: deviceInfo.osName,
		browser_name: deviceInfo.browserName
	}]);
}

async function loadPeopleMap() {
	const { data: people, error } = await supabaseClient
		.from('profiles')
		.select('id, name, role, photo_url, is_system_account, active_frame_url, active_tag');

	if (error) { console.error('Error cargando nombres:', error); return null; }

	peopleMap = {};
	peoplePhotoMap = {};
	peopleFrameMap = {};
	peopleTagMap = {};
	adminList = [];
	people.forEach(p => {
		peopleMap[p.id] = p.name;
		peoplePhotoMap[p.id] = p.photo_url || '/assets/userdefault.jpg';
		peopleFrameMap[p.id] = p.active_frame_url || null;
		peopleTagMap[p.id] = p.active_tag || null;
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
	const deadline_set = document.getElementById('task-deadline').value;
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
			reference_file_url: referenceFileUrl,
			deadline: deadline_set || null
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

async function loadMyUnusedExtensions() {
  const { data } = await supabaseClient.from('store_purchases')
    .select('*').eq('user_id', currentUser.id).eq('fulfilled', false)
    .in('item_type_snapshot', ['extension_24h', 'extension_48h']);
  return data || [];
}

async function useExtensionOnTask(taskId) {
  const extensions = await loadMyUnusedExtensions();
  if (extensions.length === 0) {
    showMsgBox('error', 'Sin extensiones', 'No tienes extensiones disponibles. Cómpralas en la Tienda.', 'Cerrar');
    return;
  }

  const options = extensions.map(e => `${e.item_type_snapshot === 'extension_24h' ? '24h' : '48h'} (#${e.id.slice(0, 6)})`).join(', ');
  const choice = await showPromptMsgBox('question', 'Usar Extensión', `Extensiones disponibles: ${options}. Escribe "24" o "48" para usar la primera de ese tipo.`, 'Usar', 'Cancelar');
  if (!choice.confirmed) return;

  const wanted = choice.value.trim() === '48' ? 'extension_48h' : 'extension_24h';
  const match = extensions.find(e => e.item_type_snapshot === wanted);
  if (!match) { showMsgBox('error', 'Error', 'No tienes ese tipo de extensión.', 'Cerrar'); return; }

  const { data, error } = await supabaseClient.rpc('use_task_extension', { p_purchase_id: match.id, p_task_id: taskId });
  if (error || !data.success) { showMsgBox('error', 'Error', data?.message || error?.message, 'Cerrar'); return; }

  showMsgBox('success', 'Éxito!', 'Fecha límite extendida.', 'Cerrar');
  loadTasks();
}

async function loadTasks() {
	let query = supabaseClient.from('tasks').select('*');

	if (!['admin', 'ceo'].includes(userProfile.role)) {
		query = query.eq('assigned_to', currentUser.id);
	}

	const { data: tasks, error } = await query;
	if (error) return console.error(error);

	const safeTasks = (tasks || []).filter(t =>
		t.assigned_to === currentUser.id ||
		t.created_by === currentUser.id ||
		['admin', 'ceo'].includes(userProfile.role)
	);

	renderTasks(safeTasks);
}

function renderTasks(tasks) {
  const container = document.getElementById('tasks-list');
  container.innerHTML = '';

  if (tasks.length <= 0) {
    container.innerHTML = '<span>No tienes trabajos pendientes!</span>';
    $('dashboard_widget_tasks').className = "widget status_ok";
    $('dashboard_widget_tasks').querySelector('.status').textContent = "Sin tareas pendientes";
    return;
  } else {
    $('dashboard_widget_tasks').className = "widget status_info";
    $('dashboard_widget_tasks').querySelector('.status').textContent = 
      tasks.length === 1 ? "Tienes 1 tarea pendiente." : `Tienes ${tasks.length} tareas pendientes.`;
  }

  tasks.forEach(task => {
    const div = document.createElement('div');
    const isMine = task.assigned_to === currentUser.id;
    const isCreatedByMe = task.created_by === currentUser.id;
    const assigneeName = peopleMap[task.assigned_to] || 'Empleado';
    const creatorName = peopleMap[task.created_by] || 'Admin';

    let formatedDeadline = "Sin fecha de entrega";
    let tareaVencida = false;

    if (task.deadline) {
      const [year, month, day] = task.deadline.split('-');
      const dateObj = new Date(year, month - 1, day);

      formatedDeadline = `Entrega: ${dateObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (dateObj < hoy && task.status !== 'completed') {
        tareaVencida = true;
      }
    }

    let visibleTaskStatus = task.status;
    if (tareaVencida) {
      visibleTaskStatus = "Vencida";
    }

    div.className = `task-card ${task.status} ${tareaVencida ? 'vencida' : ''}`;

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

    const showUploadSection = task.status === 'pending' && isMine;
    
    div.innerHTML = `
        <div class="top_wrapper">
            <i class="fi fi-sr-note"></i>
            <span class="title">${task.title}</span>
            ${assignedByLabel}
            ${submittedByLabel}
            <span>${formatedDeadline}</span>
			${task.due_date ? `<p><small>Fecha límite: ${new Date(task.due_date).toLocaleString()}</small></p>` : ''}
            <p>Estado: <strong>${visibleTaskStatus}</strong></p>
        </div>
        ${!isMine ? `<p class="assigned-to"><small>Asignado a: ${assigneeName}</small></p>` : ''}
        <p>${task.description || ''}</p>
        ${task.reference_file_url ? `<p><a href="${task.reference_file_url}" target="_blank">Ver Archivo de Referencia</a></p>` : ''}
        ${task.file_url ? `<p><a href="#" onclick="taskOpenFilePreview('${task.file_url}')">${fileLinkLabel}</a></p>` : ''}

        <div class="bottom_wrapper">
            ${showUploadSection ? `
              <input type="file" id="file-${task.id}" ${tareaVencida ? 'disabled' : ''}>
			  ${task.status === 'pending' && isMine ? `<button class="btnsmall" onclick="useExtensionOnTask('${task.id}')"><i class="fi fi-rr-time-add"></i></button>` : ''}
              <button 
                onclick="${tareaVencida ? '' : `uploadFileAndComplete('${task.id}')`}" 
                id="taskButton_${task.id}"
                ${tareaVencida ? 'disabled data-tooltip="No puedes entregar tareas después de la fecha de entrega"' : ''}
              >
                <i class="fi fi-br-check"></i> ${tareaVencida ? 'Plazo Vencido' : 'Enviar Tarea'}
              </button>
            ` : ''}
        </div>
    `;

    container.appendChild(div);
  });
}

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;
let pdfCurrentPage = 1;
let pdfScale = 1.2;

function taskOpenFilePreview(file) {
	const urlLimpia = file.split('?')[0];
	const extension = urlLimpia.split('.').pop().toLowerCase();

	$('filePreview').querySelector('.preview').querySelector('.pdfViewerWrapper').classList.add('hidden');

	if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
		$('filePreview').querySelector('.preview').querySelector('img').classList.remove('hidden');
		$('filePreview').querySelector('.preview').querySelector('iframe').classList.add('hidden');
		$('filePreview').classList.remove('hidden');
		setTimeout(() => {
			$('filePreview').querySelector('.preview').querySelector('img').src = file;
		}, 100);

	} else if (extension === 'pdf') {
		$('filePreview').querySelector('.preview').querySelector('img').classList.add('hidden');
		$('filePreview').querySelector('.preview').querySelector('iframe').classList.add('hidden');
		renderPdfViewer(file);

	} else {
		window.open(file);
	}
}

async function renderPdfViewer(url) {
	$('filePreview').querySelector('.preview').querySelector('.pdfViewerWrapper').classList.remove('hidden');
	$('filePreview').classList.remove('hidden');
	$('filePreview').querySelector('.loading').classList.remove('hidden');

	try {
		pdfDoc = await pdfjsLib.getDocument(url).promise;
		pdfCurrentPage = 1;
		pdfScale = 1.2;
		$('pdfPageCount').textContent = pdfDoc.numPages;
		await renderPdfPage(pdfCurrentPage);
	} catch (e) {
		console.error('Error cargando PDF:', e);
		$('filePreview').querySelector('.loading').classList.add('hidden');
		showMsgBox('error', 'Error', 'No se pudo cargar el PDF.', 'Cerrar');
	}
}

async function renderPdfPage(num) {
	const page = await pdfDoc.getPage(num);
	const canvas = $('pdfCanvas');
	const ctx = canvas.getContext('2d');
	const viewport = page.getViewport({ scale: pdfScale });
	canvas.width = viewport.width;
	canvas.height = viewport.height;

	await page.render({ canvasContext: ctx, viewport }).promise;

	$('pdfPageNum').textContent = num;
	$('pdfPrevBtn').disabled = num <= 1;
	$('pdfNextBtn').disabled = num >= pdfDoc.numPages;
	$('filePreview').querySelector('.loading').classList.add('hidden');
}

function pdfPrevPage() {
	if (!pdfDoc || pdfCurrentPage <= 1) return;
	pdfCurrentPage--;
	renderPdfPage(pdfCurrentPage);
}
function pdfNextPage() {
	if (!pdfDoc || pdfCurrentPage >= pdfDoc.numPages) return;
	pdfCurrentPage++;
	renderPdfPage(pdfCurrentPage);
}
function pdfZoomIn() {
	pdfScale = Math.min(pdfScale + 0.2, 3);
	if (pdfDoc) renderPdfPage(pdfCurrentPage);
}
function pdfZoomOut() {
	pdfScale = Math.max(pdfScale - 0.2, 0.4);
	if (pdfDoc) renderPdfPage(pdfCurrentPage);
}

$('filePreview').addEventListener('pointerdown', () => {
	$('filePreview').querySelector('.preview').querySelector('iframe').src = '';
	$('filePreview').querySelector('.preview').querySelector('img').src = '';
	$('filePreview').querySelector('.preview').querySelector('.pdfViewerWrapper').classList.add('hidden');
	pdfDoc = null;
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
    showMsgBox('error', 'Error', 'No se pudo entregar la tarea (error interno del servidor, por favor reporte este error).', 'Cerrar');
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
async function updateLoginStreak() {
	const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

	const { data: current } = await supabaseClient
		.from('profiles')
		.select('login_streak, last_login_date, cat_points')
		.eq('id', currentUser.id)
		.single();

	if (!current) return;

	if (current.last_login_date === today) return;

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = yesterday.toISOString().split('T')[0];

	let newStreak = 1;
	if (current.last_login_date === yesterdayStr) {
		newStreak = (current.login_streak || 0) + 1;
	}

	let bonusPoints = 0;
	if (newStreak % 7 === 0) {
		bonusPoints = 100;
	}

	const { error } = await supabaseClient
		.from('profiles')
		.update({
		login_streak: newStreak,
		last_login_date: today,
		cat_points: current.cat_points + bonusPoints
		})
		.eq('id', currentUser.id);

	if (!error) {
		userProfile.login_streak = newStreak;
		userProfile.cat_points = current.cat_points + bonusPoints;
		if (bonusPoints > 0) {
		showMsgBox('success', 'Racha de 7 días', `Has iniciado sesión 7 días seguidos. +${bonusPoints} CatPoints!`, 'Genial!');
		}
	}
}

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
	$('catPointsValue').textContent = userProfile.cat_points ?? 10;
	$('loginStreakValue').textContent = userProfile.login_streak ?? 0;

	const isBirthday = await checkBirthdays();

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

	if (!isBirthday) {
		if (strikeCount <= 0) {
			$('dashboard_widget_brief').className = "widget status_ok";
			$('dashboard_widget_brief').querySelector('.status').textContent = "Todo correcto por aqui!";
			$('dashboard_widget_brief').querySelector('.gotoStrikesBtn').classList.add('hidden');
		} else if (strikeCount == 1) {
			$('dashboard_widget_brief').className = "widget status_warn";
			$('dashboard_widget_brief').querySelector('.status').textContent = "Tienes 1 Strike";
			$('dashboard_widget_brief').querySelector('.gotoStrikesBtn').classList.remove('hidden');
		} else if (strikeCount >= 1) {
			$('dashboard_widget_brief').className = "widget status_warn";
			$('dashboard_widget_brief').querySelector('.status').textContent = "Tienes varios strikes!";
			$('dashboard_widget_brief').querySelector('.gotoStrikesBtn').classList.remove('hidden');
		}
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

	const btnAppeal = document.createElement('button');
	btnAppeal.className = "btn_secondary";
    btnAppeal.textContent = 'Apelar';
    btnAppeal.onclick = () => {
		gotoPage('requests');
		setTimeout(() => {sendRequest('Apelar Strike');}, 500);
	};

	const btnsWrapper = document.createElement('div');
	btnsWrapper.className = "btns_wrapper";
	btnsWrapper.appendChild(btnAppeal);
	btnsWrapper.appendChild(btn);

    div.appendChild(icon);
    div.appendChild(span);
    div.appendChild(btnsWrapper);
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
    showMsgBox('error', 'Error', 'No se pudo guardar (error interno del servidor, por favor reporte este error).', 'Cerrar');
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

	$('manage-catpoints-display').textContent = profile.cat_points ?? 10;
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
    showMsgBox('error', 'Error', 'No se pudo agregar el strike (error interno del servidor, por favor reporte este error).', 'Cerrar');
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
    showMsgBox('error', 'Error', 'No se pudo banear (error interno del servidor, por favor reporte este error).', 'Cerrar');
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
    showMsgBox('error', 'Error', 'No se pudo quitar el baneo (error interno del servidor, por favor reporte este error).', 'Cerrar');
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
    showMsgBox('error', 'Error', 'No se pudo enviar la solicitud (error interno del servidor, por favor reporte este error).', 'Cerrar');
    return;
  }

  showMsgBox('success', 'Enviada', 'Tu solicitud fue enviada. +10 CatPoints a tu cuenta', 'Cerrar');
  addCatPoints(10, 'Solicitud enviada');
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
    showMsgBox('error', 'Error', 'No se pudo actualizar (error interno del servidor, por favor reporte este error).', 'Cerrar');
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
		.from('announcements').select('*').order('created_at', { ascending: false });
	if (error) { console.error(error); return; }

	const { data: likes } = await supabaseClient.from('announcement_likes').select('*');

	renderAnnouncements(announcements, likes || []);
}

function renderAnnouncements(announcements, likes) {
	const container = $('announcements-list');
	container.innerHTML = '';
	if (!announcements || announcements.length === 0) {
		container.innerHTML = '<span>No hay novedades publicadas.</span>';
		return;
	}
	const isAdmin = ['admin', 'ceo'].includes(userProfile.role);

	announcements.forEach(a => {
		const likesForThis = likes.filter(l => l.announcement_id === a.id);
		const likedByMe = likesForThis.some(l => l.user_id === currentUser.id);

		const div = document.createElement('div');
		div.className = 'announcement-card';
		div.innerHTML = `
			${a.image_url ? `<div class="announcement-image" style="background-image: url('${a.image_url}')"></div>` : ''}
			<h4>${a.title}</h4>
			<span class="announcement-body">${a.body}</span>
			<button id="announcementLikeBtn_${a.id}" class="like-btn ${likedByMe ? 'liked' : ''}" onclick="toggleAnnouncementLike('${a.id}', ${likedByMe})">
				<i class="fi ${likedByMe ? 'fi-sr-heart' : 'fi-rr-heart'}"></i> ${likesForThis.length}
			</button>
			${isAdmin ? `<button class="btnsmall" onclick="deleteAnnouncement('${a.id}')"><i class="fi fi-rr-trash"></i></button>` : ''}
		`;
		container.appendChild(div);
	});
}

async function toggleAnnouncementLike(announcementId, alreadyLiked) {
	if (alreadyLiked) {
		try {
			$(`announcementLikeBtn_${announcementId}`).classList.remove('liked');
			$(`announcementLikeBtn_${announcementId}`).querySelector('i').className = "fi fi-rr-heart";
		} catch(e) {}
		await supabaseClient.from('announcement_likes').delete().eq('user_id', currentUser.id).eq('announcement_id', announcementId);
	} else {
		try {
			$(`announcementLikeBtn_${announcementId}`).classList.add('liked');
			$(`announcementLikeBtn_${announcementId}`).querySelector('i').className = "fi fi-sr-heart";
		} catch(e) {}
		await supabaseClient.from('announcement_likes').insert([{ user_id: currentUser.id, announcement_id: announcementId }]);
	}
	loadAnnouncements();
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
	renderStatsBreakdown(activity, 'stats-devices', 'device_type');
	renderStatsBreakdown(activity, 'stats-os', 'os_name');
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
  showMsgBox('success', 'Éxito!', 'Gracias por tu feedback! +10 CatPoints a tu cuenta', 'Cerrar');
  addCatPoints(10, 'Feedback enviado');
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
	$('idData-number').className      = "skeletonObj skeleton_TextLine noAnimation";
	$('idData-unique').className      = "skeletonObj skeleton_TextLine noAnimation";
	$('idData-registered').className  = "skeletonObj skeleton_TextLine noAnimation";
	$('idData-valid').className       = "skeletonObj skeleton_TextLine noAnimation";
	$('idData-requests').className    = "skeletonObj skeleton_TextLine noAnimation";
	$('idData-lost').className        = "skeletonObj skeleton_TextLine noAnimation";

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

	$('idData-number').className      = "";
	$('idData-unique').className      = "";
	$('idData-registered').className  = "";
	$('idData-valid').className       = "";
	$('idData-requests').className    = "";
	$('idData-lost').className        = "";

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

function getNameAndSecondName(fullName) {
  if (!fullName) return { name: '', secondName: '' };

  const parts = fullName.trim().split(/\s+/);
  const name = parts.shift() || '';
  const secondName = parts.join(' ');

  return { name, secondName };
}

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
        const renderEmail = (email) => email ? `<a href="mailto:${email}">${email}</a>` : 'No disponible';
        const renderPhone = (phone) => phone ? `<a href="tel:+506${phone}">${phone}</a>` : 'No disponible';
        
        body.innerHTML = `
        <img src="${data.photo_url || '/assets/userdefault.jpg'}" class="cidLookupPhoto">
        <h2>${data.name}</h2>
        <span><i class="fi fi-rr-envelope"></i> ${renderEmail(data.email)}</span>
        <span><i class="fi fi-rr-phone-call"></i> ${renderPhone(data.phone_number)}</span>
        ${data.working_areas && data.working_areas.length ? `<span><i class="fi fi-rr-briefcase"></i> ${data.working_areas.join(', ')}</span>` : ''}
        <p class="cidLookupValidBadge"><i class="fi fi-br-check"></i> ID Vigente</p>
        <button id="cidLookupSaveBtn">Agregar a contactos</button>
        `;

        $('cidLookupSaveBtn').onclick = async () => {
			$('cidLookupSaveBtn').disabled = true;
			$('cidLookupSaveBtn').textContent = "Agregando...";

            const parsedName = getNameAndSecondName(data.name);
            await saveContactToDevice({
                nombre: parsedName.name,
                apellido: parsedName.secondName,
                empresa: 'Just A Bread Studios',
                puesto: data.working_areas && data.working_areas.length ? data.working_areas.join(', ') : '',
                telefono: data.phone_number ? `+506${data.phone_number}` : '',
                email: data.email || '',
                url: `https://justabreadstudios.netlify.app/breadnet/?cid=${cid}`
            });

			$('cidLookupSaveBtn').disabled = false;
			$('cidLookupSaveBtn').textContent = "Agregar a contactos";
        };
    } else {
		body.innerHTML = `<span>Estado desconocido.</span>`;
	}
}

async function saveContactToDevice(data) {
	const vcardText = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${data.apellido || ''};${data.nombre || ''};;;`,
		`FN:${data.nombre || ''} ${data.apellido || ''}`.trim(),
		data.empresa ? `ORG:${data.empresa}` : null,
		data.puesto ? `TITLE:${data.puesto}` : null,
		data.telefono ? `TEL;TYPE=CELL:${data.telefono}` : null,
		data.email ? `EMAIL;TYPE=INTERNET:${data.email}` : null,
		data.url ? `URL:${data.url}` : null,
		'END:VCARD'
	]
	.filter(Boolean)
	.join('\r\n');

	const fileName = `${(data.nombre || 'contacto').toLowerCase().replace(/\s+/g, '_')}.vcf`;

	if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
		try {
			const file = new File([vcardText], fileName, { type: 'text/vcard' });

			if (navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: data.nombre ? `Contacto: ${data.nombre}` : 'Contacto',
					text: 'Guardar contacto en la agenda'
				});
				return;
			}
		} catch (error) {
			if (error.name === 'AbortError') {
				return;
			}
			console.warn('Web Share API failed. Executing download fallback.', error);
		}
	}

	executeDirectVCardDownload(vcardText, fileName);
}

function executeDirectVCardDownload(vcardText, fileName) {
	const blob = new Blob([vcardText], { type: 'text/x-vcard;charset=utf-8' });

	if (window.URL && window.URL.createObjectURL) {
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		
		link.href = url;
		link.download = fileName;
		link.style.display = 'none';
		
		document.body.appendChild(link);
		link.click();

		setTimeout(() => {
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
		}, 200);
		return;
	}

	const encodedUrl = 'data:text/x-vcard;charset=utf-8,' + encodeURIComponent(vcardText);
	window.open(encodedUrl, '_blank');
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

//=================================
// Device Detection
//=================================
	function detectDeviceInfo() {
	const ua = navigator.userAgent;
	let deviceType = 'desktop';
	let osName = 'Desconocido';
	let browserName = 'Desconocido';

	if (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
		deviceType = 'tablet';
		osName = 'iPadOS';
	} else if (/iPhone|iPod/.test(ua)) {
		deviceType = 'mobile';
		osName = 'iOS';
	} else if (/Android/.test(ua)) {
		deviceType = /Mobile/.test(ua) ? 'mobile' : 'tablet';
		osName = 'Android';
	} else if (/Windows/.test(ua)) {
		osName = 'Windows';
	} else if (/Macintosh|Mac OS X/.test(ua)) {
		osName = 'macOS';
	} else if (/Linux/.test(ua)) {
		osName = 'Linux';
	}

	if (/Edg\//.test(ua)) browserName = 'Edge';
	else if (/OPR\//.test(ua)) browserName = 'Opera';
	else if (/Chrome\//.test(ua)) browserName = 'Chrome';
	else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browserName = 'Safari';
	else if (/Firefox\//.test(ua)) browserName = 'Firefox';

	return { deviceType, osName, browserName };
}

function renderStatsBreakdown(activity, containerId, key) {
  const counts = {};
  activity.forEach(a => {
    const val = a[key] || 'Desconocido';
    counts[val] = (counts[val] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const container = $(containerId);
  container.innerHTML = '';
  if (sorted.length === 0) {
    container.innerHTML = '<span>Sin datos todavía.</span>';
    return;
  }
  sorted.forEach(([label, count]) => {
    const div = document.createElement('div');
    div.className = 'stats-row';
    div.innerHTML = `<span>${label}</span><span class="stats-count">${count}</span>`;
    container.appendChild(div);
  });
}

//=================================
// CatPoints
//=================================
async function addCatPoints(amount, reason) {
  const { data: current } = await supabaseClient.from('profiles').select('cat_points').eq('id', currentUser.id).single();
  if (!current) return;

  const newTotal = current.cat_points + amount;
  const { error } = await supabaseClient.from('profiles').update({ cat_points: newTotal }).eq('id', currentUser.id);
  if (error) { console.error('Error adding CatPoints:', error); return; }

  userProfile.cat_points = newTotal;
  console.log(`+${amount} CatPoints (${reason})`);
}

async function grantCatPoints() {
  if (!currentManagedEmployee) return;
  const amount = parseInt($('catpoints-to-add').value);
  if (!amount || amount <= 0) {
    showMsgBox('error', 'Error', 'Ingresa una cantidad válida (mayor a 0).', 'Cerrar');
    return;
  }

  $('loadingModal').classList.remove('hidden');
  const { data, error } = await supabaseClient
    .from('profiles')
    .update({ cat_points: currentManagedEmployee.cat_points + amount })
    .eq('id', currentManagedEmployee.id)
    .select();
  $('loadingModal').classList.add('hidden');

  if (error || !data || data.length === 0) {
    showMsgBox('error', 'Error', `No se pudo otorgar: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
    return;
  }

  currentManagedEmployee.cat_points = data[0].cat_points;
  $('manage-catpoints-display').textContent = currentManagedEmployee.cat_points;
  $('catpoints-to-add').value = '';
  showMsgBox('success', 'Éxito!', `Se otorgaron ${amount} CatPoints.`, 'Cerrar');
}

//=================================
// Birthdays
//=================================
async function checkBirthdays() {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const isMyBirthday = userProfile.birth_date &&
    (new Date(userProfile.birth_date).getUTCMonth() + 1) === todayMonth &&
    new Date(userProfile.birth_date).getUTCDate() === todayDay;

  if (isMyBirthday) {
    $('dashboard_widget_brief').className = "widget status_ok";
    $('dashboard_widget_brief').querySelector('.status').textContent = "Feliz cumpleaños! Te deseamos un gran día 🎉";
    return true;
  }

  const { data: allProfiles, error } = await supabaseClient.from('profiles').select('id, name, birth_date');
  if (error) return false;

  const birthdayPeople = allProfiles.filter(p => {
    if (!p.birth_date || p.id === currentUser.id) return false;
    const d = new Date(p.birth_date);
    return (d.getUTCMonth() + 1) === todayMonth && d.getUTCDate() === todayDay;
  });

  if (birthdayPeople.length > 0) {
    const names = birthdayPeople.map(p => p.name).join(', ');
    $('dashboard_widget_brief').className = "widget status_info";
    $('dashboard_widget_brief').querySelector('.status').textContent = `🎂 Hoy es el cumpleaños de ${names}! No olvides felicitar.`;
    return true;
  }

  return false;
}

//=================================
// Store
//=================================
async function loadStore() {
  const { data: items, error } = await supabaseClient.from('store_items').select('*').eq('active', true).order('cost');
  if (error) { console.error(error); return; }
  $('store-my-points').textContent = userProfile.cat_points ?? 10;
  renderStoreItems(items);
}

function renderStoreItems(items) {
	const container = $('store-items-list');
	container.innerHTML = '';
	const isCeo = userProfile.role === 'ceo';

	items.forEach(item => {
		const div = document.createElement('div');
		div.className = 'element';
		div.innerHTML = `
			<div class="top_wrapper">
				<span class="title">${item.name}</span>
				<span class="store-price">${item.cost} pt</span>
			</div>
			<div class="preview"><img alt="Item Preview" src="${item.image_url || "/assets/optionsInGrid.png"}"></div>
			<p>${item.description || ''}</p>
			<div class="bottom_wrapper">
				<button onclick="buyStoreItem('${item.id}', '${item.type}')"><i class="fi fi-rr-shopping-cart"></i> Comprar</button>
				${isCeo ? `
					<input type="file" id="edit-image-${item.id}" accept="image/*" class="hidden" onchange="updateStoreItemImage('${item.id}')">
					<button class="btnsmall" onclick="document.getElementById('edit-image-${item.id}').click()"><i class="fi fi-rr-picture"></i></button>
					<button class="btnsmall" onclick="removeStoreItem('${item.id}')"><i class="fi fi-rr-trash"></i></button>
				` : ''}
			</div>
		`;
		container.appendChild(div);
	});
}

async function updateStoreItemImage(itemId) {
	const input = $(`edit-image-${itemId}`);
	if (input.files.length === 0) return;

	$('loadingModal').classList.remove('hidden');
	const blob = await resizeImageToHeight(input.files[0], 256, 0.8);
	const path = `store-items/${Date.now()}-${input.files[0].name}`;

	const { error: upErr } = await supabaseClient.storage.from('shared-files').upload(path, blob);
	if (upErr) {
		$('loadingModal').classList.add('hidden');
		showMsgBox('error', 'Error', `No se pudo subir la imagen: ${upErr.message}`, 'Cerrar');
		return;
	}

	const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(path);
	const { error } = await supabaseClient.from('store_items').update({ image_url: urlData.publicUrl }).eq('id', itemId);
	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }
	showMsgBox('success', 'Éxito!', 'Imagen actualizada.', 'Cerrar');
	loadStore();
}

async function buyStoreItem(itemId, itemType) {
	const confirmMsg = await showAskBox('question', 'Confirmar compra', '¿Deseas comprar este producto?', 'Comprar', 'Cancelar');
	if (!confirmMsg.confirmed) return;

	$('loadingModal').classList.remove('hidden');
	const { data, error } = await supabaseClient.rpc('purchase_store_item', { p_item_id: itemId });
	$('loadingModal').classList.add('hidden');

	if (error || !data.success) {
		showMsgBox('error', 'Error', data?.message || error?.message || 'No se pudo comprar.', 'Cerrar');
		return;
	}

	const { data: profile } = await supabaseClient.from('profiles').select('cat_points').eq('id', currentUser.id).single();
	userProfile.cat_points = profile.cat_points;
	$('store-my-points').textContent = profile.cat_points;

	if (itemType === 'custom_announcement') {
		const msgPrompt = await showPromptMsgBox('question', 'Anuncio Custom', 'Escribe el mensaje que verán todos en el inicio por 24h:', 'Publicar', 'Cancelar');
		if (msgPrompt.confirmed && msgPrompt.value.trim()) {
			await supabaseClient.rpc('set_custom_announcement', { p_message: msgPrompt.value.trim() });
		}
	} else if (itemType === 'custom') {
		await supabaseClient.from('feedback').insert([{
			user_id: currentUser.id, type: 'general',
			message: `[COMPRA TIENDA] ${userProfile.name} compró un producto personalizado.`
		}]);
	} else if (['wallpaper', 'frame', 'tag'].includes(itemType)) {
		showMsgBox('success', '¡Comprado!', 'Ve a Configuración > Mi Inventario para activarlo.', 'Cerrar');
		return;
	}

	showMsgBox('success', '¡Comprado!', 'Compra realizada con éxito.', 'Cerrar');
}

async function createStoreItem() {
	const name = $('new-item-name').value.trim();
	const description = $('new-item-desc').value.trim();
	const cost = parseInt($('new-item-cost').value);
	const type = $('new-item-type').value;
	const imageInput = $('new-item-image');

	if (!name || !cost || cost <= 0) { showMsgBox('error', 'Error', 'Ingresa un nombre y un costo válido.', 'Cerrar'); return; }

	let imageUrl = null;
	$('loadingModal').classList.remove('hidden');

	if (imageInput.files.length > 0) {
		const blob = await resizeImageToHeight(imageInput.files[0], 256, 0.8);
		const path = `store-items/${Date.now()}-${imageInput.files[0].name}`;
		const { error: upErr } = await supabaseClient.storage.from('shared-files').upload(path, blob);
		if (!upErr) {
			const { data: urlData } = supabaseClient.storage.from('shared-files').getPublicUrl(path);
			imageUrl = urlData.publicUrl;
		}
	}

	const { error } = await supabaseClient.from('store_items').insert([{ name, description, cost, type, image_url: imageUrl, created_by: currentUser.id }]);
	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }

	$('new-item-name').value = ''; $('new-item-desc').value = ''; $('new-item-cost').value = ''; imageInput.value = '';
	showMsgBox('success', 'Éxito!', 'Producto agregado.', 'Cerrar');
	loadStore();
}

async function removeStoreItem(itemId) {
  const confirmMsg = await showAskBox('warn', 'Confirmar', '¿Eliminar este producto de la tienda?', 'Eliminar', 'Cancelar');
  if (!confirmMsg.confirmed) return;
  await supabaseClient.from('store_items').update({ active: false }).eq('id', itemId);
  showMsgBox('success', 'Éxito!', 'Producto eliminado.', 'Cerrar');
  loadStore();
}

//=================================
// Custom Dashboard Banner
//=================================
async function loadCustomBanner() {
  const { data, error } = await supabaseClient.from('home_custom_banner').select('*').eq('id', 1).single();
  if (error || !data || !data.message || !data.expires_at) return;

  if (new Date(data.expires_at) < new Date()) return;

  const div = document.createElement('div');
  div.className = 'widget status_info custom-banner-widget';
  div.innerHTML = `<div class="header"><i class="fi fi-rr-megaphone"></i><span class="title">Anuncio Especial</span></div><span class="status">${data.message}</span>`;
  $('.widgets')?.prepend?.(div) || document.querySelector('.widgets').prepend(div);
}

//=================================
// Sticky Notes
//=================================
let stickyNoteCount = 0;

function createStickyNote() {
	stickyNoteCount++;
	const id = `stickyNote_${Date.now()}`;
	const note = document.createElement('div');
	note.className = 'sticky-note';
	note.id = id;
	note.style.top = `${80 + (stickyNoteCount % 5) * 20}px`;
	note.style.left = `${100 + (stickyNoteCount % 5) * 20}px`;

	note.innerHTML = `
		<div class="sticky-note-header">
		<i class="fi fi-rr-notebook"></i>
		<div class="btns" id="${id}_btnsWrapper">
			<button onclick="toggleMinimizeNote('${id}')"><i class="fi fi-rr-minus"></i></button>
			<button onclick="document.getElementById('${id}').remove()"><i class="fi fi-rr-cross"></i></button> 
		</div>
		</div>
		<textarea placeholder="Escribe algo..."></textarea>
		<div class="resize-handle"></div>
	`;
	document.body.appendChild(note);
	makeStickyNoteDraggable(note);
	makeStickyNoteResizable(note);
	$(`${id}_btnsWrapper`).onpointerdown = (e) => { e.stopPropagation(); };
}

function toggleMinimizeNote(id) {
  document.getElementById(id).classList.toggle('minimized');
}

function makeStickyNoteDraggable(note) {
  const header = note.querySelector('.sticky-note-header');
  let offsetX, offsetY, dragging = false;

  header.addEventListener('pointerdown', (e) => {
    dragging = true;
    e.preventDefault();
    
    header.setPointerCapture(e.pointerId);

    offsetX = e.clientX - note.offsetLeft;
    offsetY = e.clientY - note.offsetTop;
  });

  header.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    note.style.left = `${e.clientX - offsetX}px`;
    note.style.top = `${e.clientY - offsetY}px`;
  });

  const stopDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (header.hasPointerCapture(e.pointerId)) {
      header.releasePointerCapture(e.pointerId);
    }
  };

  header.addEventListener('pointerup', stopDrag);
  header.addEventListener('pointercancel', stopDrag);
}

function makeStickyNoteResizable(note) {
  const handle = note.querySelector('.resize-handle');
  let resizing = false;
  let startX, startY, startWidth, startHeight;

  handle.addEventListener('pointerdown', (e) => {
    resizing = true;
    e.preventDefault();
    e.stopPropagation();
    
    handle.setPointerCapture(e.pointerId);

    startX = e.clientX;
    startY = e.clientY;
    startWidth = note.offsetWidth;
    startHeight = note.offsetHeight;
  });

  handle.addEventListener('pointermove', (e) => {
    if (!resizing) return;
    const newWidth = startWidth + (e.clientX - startX);
    const newHeight = startHeight + (e.clientY - startY);

    note.style.width = `${Math.max(160, newWidth)}px`;
    note.style.height = `${Math.max(120, newHeight)}px`;
  });

  const stopResize = (e) => {
    if (!resizing) return;
    resizing = false;
    if (handle.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }
  };

  handle.addEventListener('pointerup', stopResize);
  handle.addEventListener('pointercancel', stopResize);
}

//=================================
// Chats
//=================================
let chatRealtimeChannel = null;
let myChatIds = new Set();
let currentOpenChatId = null;
let currentOpenChatCreator = null;
let peoplePhotoMap = {};
let peopleFrameMap = {};
let peopleTagMap = {};

function subscribeToChatRealtime() {
	if (chatRealtimeChannel) return;
	chatRealtimeChannel = supabaseClient.channel('chat-messages-listener')
		.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
		const msg = payload.new;
		if (!myChatIds.has(msg.chat_id)) return;
		if (msg.chat_id === currentOpenChatId && msg.sender_id !== currentUser.id) {
			appendMessageToView(msg);
		}
		loadChatsList();
		})
		.subscribe();
}

function unsubscribeFromChatRealtime() {
	if (chatRealtimeChannel) {
		supabaseClient.removeChannel(chatRealtimeChannel);
		chatRealtimeChannel = null;
	}
	currentOpenChatId = null;
}

async function loadChatsList() {
	$('chatsListContainer').innerHTML = '<span class="chat-empty">Cargando chats...</span>';
	const { data: memberships, error } = await supabaseClient.from('chat_members').select('chat_id').eq('user_id', currentUser.id);
	if (error) { console.error(error); return; }

	const chatIds = memberships.map(m => m.chat_id);
	myChatIds = new Set(chatIds);

	if (chatIds.length === 0) { renderChatsList([]); return; }

	const { data: chats } = await supabaseClient.from('chats').select('*').in('id', chatIds);
	const { data: allMembers } = await supabaseClient.from('chat_members').select('chat_id, user_id').in('chat_id', chatIds);
	const { data: recentMessages } = await supabaseClient
		.from('messages').select('chat_id, content, sender_id, created_at')
		.in('chat_id', chatIds).order('created_at', { ascending: false }).limit(200);

	const lastMsgByChat = {};
	(recentMessages || []).forEach(m => { if (!lastMsgByChat[m.chat_id]) lastMsgByChat[m.chat_id] = m; });

	const chatData = chats.map(chat => {
		let displayName, displayPhoto, otherUserId = null;
		if (chat.type === 'private') {
			const otherMember = allMembers.find(m => m.chat_id === chat.id && m.user_id !== currentUser.id);
			otherUserId = otherMember?.user_id;
			displayName = peopleMap[otherUserId] || 'Usuario';
			displayPhoto = peoplePhotoMap[otherUserId] || '/assets/userdefault.jpg';
		} else {
			displayName = chat.name;
			displayPhoto = '/assets/groupColab.png';
		}
		return { ...chat, displayName, displayPhoto, otherUserId, lastMsg: lastMsgByChat[chat.id] };
	});

	chatData.sort((a, b) => new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at));
	renderChatsList(chatData);
}

function renderChatsList(chats) {
	const container = $('chatsListContainer');
	container.innerHTML = '';
	if (chats.length === 0) { container.innerHTML = '<span class="chat-empty">No tienes chats todavía.</span>'; return; }

	chats.forEach(chat => {
		const div = document.createElement('div');
		div.className = 'chatEl';
		div.onclick = () => openChat(chat.id, chat.displayName, chat.displayPhoto, chat.type, chat.created_by, chat.otherUserId);

		const preview = chat.lastMsg
			? `<strong>${chat.lastMsg.sender_id === currentUser.id ? 'Tú' : (peopleMap[chat.lastMsg.sender_id] || '')}:</strong> ${chat.lastMsg.content}`
			: 'Sin mensajes todavía';

		div.innerHTML = `
			<div class="pfp-frame-wrapper">
				<img src="${chat.displayPhoto}" alt="Profile Photo">
				${chat.otherUserId && peopleFrameMap[chat.otherUserId] ? `<img class="pfp-frame-overlay" src="${peopleFrameMap[chat.otherUserId]}">` : ''}
			</div>
			<div class="content">
				<span class="chatName">${chat.displayName}${chat.otherUserId && peopleTagMap[chat.otherUserId] ? ` <span class="employee-tag">${peopleTagMap[chat.otherUserId]}</span>` : ''}</span>
				<span class="lastMsg">${preview}</span>
			</div>
		`;
		container.appendChild(div);
	});
}

async function openChat(chatId, name, photo, type, createdBy, otherUserId) {
	currentOpenChatId = chatId;
	currentOpenChatCreator = createdBy;
	/*document.querySelector('.chatContainer')?.classList.add('mobile-open');*/
	document.getElementById('pageChat_chatsList').classList.add('hideOnTouch');
	document.querySelector('.chatContainer').classList.remove('hideOnTouch');
	const tagHtml = otherUserId && peopleTagMap[otherUserId] ? ` <span class="employee-tag">${peopleTagMap[otherUserId]}</span>` : '';
	$('chatHeaderName').innerHTML = `${name}${tagHtml}`;
	$('chatHeaderImg').src = photo;
	applyFrameOverlay($('chatHeaderImg'), otherUserId ? peopleFrameMap[otherUserId] : null);

	const canManage = type === 'group' && (createdBy === currentUser.id || userProfile.role === 'ceo');
	$('manageGroupBtn').classList.toggle('hidden', !canManage);

	const { data: messages, error } = await supabaseClient
		.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true }).limit(200);
	if (error) { console.error(error); return; }

	const container = $('pageChat_chatMessages');
	container.innerHTML = '';
	messages.forEach(m => appendMessageToView(m, false));
	container.scrollTop = container.scrollHeight;
}

function appendMessageToView(msg, scroll = true) {
	if (msg.chat_id !== currentOpenChatId) return;
	const container = $('pageChat_chatMessages');
	const div = document.createElement('div');
	div.className = `msg ${msg.sender_id === currentUser.id ? 'this' : 'other'}`;
	div.textContent = msg.content;
	container.appendChild(div);
	if (scroll) container.scrollTop = container.scrollHeight;
}

$('pageChat_chatTextInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });
	document.querySelector('.chatBottomCom button')?.addEventListener('click', sendChatMessage);

	async function sendChatMessage() {
	const input = $('pageChat_chatTextInput');
	const content = input.value.trim();
	if (!content || !currentOpenChatId) return;

	const maxLen = ['admin', 'ceo'].includes(userProfile.role) ? 800 : 500;
	if (content.length > maxLen) {
		showMsgBox('error', 'Mensaje muy largo', `El límite es de ${maxLen} caracteres.`, 'Cerrar');
		return;
	}

	input.value = '';
	const { data, error } = await supabaseClient.rpc('send_chat_message', { p_chat_id: currentOpenChatId, p_content: content });

	if (error || !data.success) {
		showMsgBox('error', 'Error', (data && data.message) || error?.message || 'No se pudo enviar el mensaje.', 'Cerrar');
		return;
	}

	appendMessageToView({ chat_id: currentOpenChatId, sender_id: currentUser.id, content });
	loadChatsList();
}

$('pageChat_chatGoBackBtnMb')?.addEventListener('click', () => {
	document.getElementById('pageChat_chatsList').classList.remove('hideOnTouch');
	document.querySelector('.chatContainer').classList.add('hideOnTouch');
	currentOpenChatId = null;
});

//=================================
// Chat Modals
//=================================
function closeModal(id) { $(id).classList.remove('show'); }

function getChattablePeople() {
	return Object.entries(peopleMap)
		.filter(([id]) => id !== currentUser.id)
		.filter(([id]) => userProfile.is_system_account || !isSystemAccount(id));
}

function isSystemAccount(userId) {
  	return systemAccountIds.has(userId);
}
let systemAccountIds = new Set();

async function loadSystemAccountIds() {
	const { data } = await supabaseClient.from('profiles').select('id').eq('is_system_account', true);
	systemAccountIds = new Set((data || []).map(p => p.id));
}

function openNewChatModal() {
	const container = $('newChatPeopleList');
	container.innerHTML = '';
	getChattablePeople().forEach(([id, name]) => {
		const div = document.createElement('div');
		div.className = 'element';
		div.innerHTML = `<img src="${peoplePhotoMap[id] || '/assets/userdefault.jpg'}" class="directory-thumb"><span>${name}</span>`;
		div.onclick = () => startPrivateChat(id, name);
		container.appendChild(div);
	});
	$('newChatModal').classList.add('show');
}

async function startPrivateChat(userId, name) {
	$('newChatModal').classList.remove('show');

	$('loadingModal').classList.remove('hidden');
	const { data: chatId, error } = await supabaseClient.rpc('create_or_get_private_chat', { p_other_user_id: userId });
	$('loadingModal').classList.add('hidden');

	if (error) {
		showMsgBox('error', 'Error', error.message, 'Cerrar');
		return;
	}
	closeModal('newChatModal');
	await loadChatsList();
	openChat(chatId, name, peoplePhotoMap[userId] || '/assets/userdefault.jpg', 'private', null, userId);
}

function openNewGroupModal() {
	$('newGroupNameInput').value = '';
	const container = $('newGroupPeopleList');
	container.innerHTML = '';
	getChattablePeople().forEach(([id, name]) => {
		const div = document.createElement('div');
		div.className = 'element';
		div.innerHTML = `<label><input type="checkbox" value="${id}" class="newGroupMemberCheckbox"> ${name}</label>`;
		container.appendChild(div);
	});
	$('newGroupModal').classList.add('show');
}

async function submitNewGroup() {
	$('newGroupModal').classList.remove('show');

	const name = $('newGroupNameInput').value.trim();
	if (!name) { showMsgBox('error', 'Error', 'Ingresa un nombre para el grupo.', 'Cerrar'); return; }

	const memberIds = Array.from(document.querySelectorAll('.newGroupMemberCheckbox:checked')).map(c => c.value);

	$('loadingModal').classList.remove('hidden');
	const { data: chatId, error } = await supabaseClient.rpc('create_group_chat', { p_name: name, p_member_ids: memberIds });
	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }

	closeModal('newGroupModal');
	showMsgBox('success', 'Éxito!', 'Grupo creado.', 'Cerrar');
	await loadChatsList();
	openChat(chatId, name, '/assets/groupColab.png', 'group', currentUser.id);
}

async function openManageGroupModal() {
	if (!currentOpenChatId) return;

	const { data: members } = await supabaseClient.from('chat_members').select('*').eq('chat_id', currentOpenChatId);

	const listContainer = $('manageGroupMembersList');
	listContainer.innerHTML = '';
	members.forEach(m => {
		const isCreator = m.user_id === currentOpenChatCreator;
		const div = document.createElement('div');
		div.className = 'element';
		div.innerHTML = `
			<span>${peopleMap[m.user_id] || 'Usuario'} ${isCreator ? '(Creador)' : ''}</span>
			${!isCreator ? `
				<label><input type="checkbox" ${m.can_send ? 'checked' : ''} onchange="toggleMemberPermission('${m.user_id}', this.checked)"> Puede enviar</label>
				<button class="btnsmall" onclick="removeGroupMember('${m.user_id}')"><i class="fi fi-rr-trash"></i></button>
			` : ''}
		`;
		listContainer.appendChild(div);
	});

	const memberIds = new Set(members.map(m => m.user_id));
	const addContainer = $('manageGroupAddList');
	addContainer.innerHTML = '';
	getChattablePeople().filter(([id]) => !memberIds.has(id)).forEach(([id, name]) => {
		const div = document.createElement('div');
		div.className = 'element';
		div.innerHTML = `<span>${name}</span><button class="btnsmall" onclick="addGroupMember('${id}')"><i class="fi fi-rr-plus"></i></button>`;
		addContainer.appendChild(div);
	});

	$('manageGroupModal').classList.add('show');
}

async function toggleMemberPermission(userId, canSend) {
	const { error } = await supabaseClient.rpc('toggle_chat_member_permission', { p_chat_id: currentOpenChatId, p_user_id: userId, p_can_send: canSend });
	if (error) showMsgBox('error', 'Error', error.message, 'Cerrar');
}

async function addGroupMember(userId) {
	const { error } = await supabaseClient.rpc('manage_group_members', { p_chat_id: currentOpenChatId, p_add: [userId], p_remove: null });
	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }
	openManageGroupModal();
}

async function removeGroupMember(userId) {
	const { error } = await supabaseClient.rpc('manage_group_members', { p_chat_id: currentOpenChatId, p_add: null, p_remove: [userId] });
	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }
	openManageGroupModal();
}

//=================================
// Store Inventory
//=================================
async function loadInventory() {
  const { data, error } = await supabaseClient.from('user_inventory').select('*').eq('user_id', currentUser.id).order('acquired_at', { ascending: false });
  if (error) { console.error(error); return; }

  const container = $('inventory-list');
  container.innerHTML = '';
  if (!data || data.length === 0) { container.innerHTML = '<span>No tienes items todavía. Visita la Tienda!</span>'; return; }

  data.forEach(inv => {
    const div = document.createElement('div');
    div.className = `inventory-item ${inv.active ? 'active' : ''}`;
    div.innerHTML = `
      ${inv.image_url ? `<img src="${inv.image_url}">` : `<i class="fi fi-rr-star"></i>`}
      <span>${inv.name}</span>
      <button class="btnsmall" onclick="${inv.active ? `unequipInventoryType('${inv.type}')` : `equipInventoryItem('${inv.id}')`}">
        ${inv.active ? 'Quitar' : 'Usar'}
      </button>
    `;
    container.appendChild(div);
  });
}

async function equipInventoryItem(inventoryId) {
  const { data, error } = await supabaseClient.rpc('equip_inventory_item', { p_inventory_id: inventoryId });
  if (error || !data.success) { showMsgBox('error', 'Error', data?.message || error?.message, 'Cerrar'); return; }
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
  userProfile = profile;
  applyEquippedItems();
  loadInventory();
  showMsgBox('success', 'Éxito!', 'Item activado.', 'Cerrar');
}

async function unequipInventoryType(type) {
  const { error } = await supabaseClient.rpc('unequip_inventory_type', { p_type: type });
  if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', currentUser.id).single();
  userProfile = profile;
  applyEquippedItems();
  loadInventory();
}

function applyEquippedItems() {
	if (userProfile.active_wallpaper_url) {
		$('softLockOverlay').style.backgroundImage = `url('${userProfile.active_wallpaper_url}')`;
		$('page_login').style.backgroundImage = `url('${userProfile.active_wallpaper_url}')`;
		$('page_home').style.backgroundImage = `url('${userProfile.active_wallpaper_url}')`;
		$('cidLookupScreen').style.backgroundImage = `url('${userProfile.active_wallpaper_url}')`;
	} else {
		$('softLockOverlay').style.backgroundImage = `url('/assets/wallpaper.webp')`;
		$('page_login').style.backgroundImage = `url('/assets/wallpaper.webp')`;
		$('page_home').style.backgroundImage = `url('/assets/wallpaper.webp')`;
		$('cidLookupScreen').style.backgroundImage = `url('/assets/wallpaper.webp')`;
	}

	const frameTargets = ['headerPFPimg', 'settings_pfp', 'strikesPagePFPimg'];
    frameTargets.forEach(id => applyFrameOverlay($(id), userProfile.active_frame_url));

	const nameEl = $('header_pfp')?.querySelector('.name');
	if (nameEl) {
		const existingTag = nameEl.querySelector('.employee-tag');
		if (existingTag) existingTag.remove();
		if (userProfile.active_tag) {
		nameEl.insertAdjacentHTML('beforeend', `<span class="employee-tag">${userProfile.active_tag}</span>`);
		}
	}
}

function resizeImageToHeight(file, targetHeight = 256, quality = 0.8) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = () => {
				const scale = targetHeight / img.height;
				const newWidth = Math.round(img.width * scale);
				const canvas = document.createElement('canvas');
				canvas.width = newWidth;
				canvas.height = targetHeight;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, newWidth, targetHeight);
				canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
			};
			img.onerror = reject;
			img.src = e.target.result;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

//=================================
// Dynamic Greeting
//=================================
async function getSmartGreeting(profile) {
	const now = new Date();
	const hour = now.getHours();
	const day = now.getDay();
	const isWeekend = day === 0 || day === 6;

	const { data: tasks } = await supabaseClient.from('tasks').select('id, status').eq('assigned_to', currentUser.id);
	const pendingCount = (tasks || []).filter(t => t.status === 'pending').length;

	const { data: recentViews } = await supabaseClient
		.from('activity_log').select('page').eq('user_id', currentUser.id).eq('event_type', 'page_view')
		.gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

	const pageCounts = {};
	(recentViews || []).forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });
	const favoritePage = Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
	const pageLabels = { tasks: 'tareas', chat: 'chat', store: 'tienda', news: 'novedades', strikes: 'estado de cuenta' };

	let timeTag, timePhrases;
	if (hour >= 5 && hour < 12) {
		timeTag = 'c-gradient-morning';
		timePhrases = ['Buenos días', 'A darle con todo', 'Buen día'];
	} else if (hour >= 12 && hour < 19) {
		timeTag = 'c-gradient-afternoon';
		timePhrases = ['Buenas tardes', 'Linda tarde', 'Que vaya bien tu tarde'];
	} else {
		timeTag = 'c-gradient-night';
		timePhrases = ['Buenas noches', 'Terminando el día', 'A descansar pronto'];
	}

	const extras = [];
	if (isWeekend) extras.push('¿Trabajando en fin de semana? Eso se aprecia.');
	if (pendingCount === 0) extras.push('Vas al día con tus tareas, excelente!');
	else if (pendingCount === 1) extras.push('Tienes 1 tarea esperando por ti.');
	else if (pendingCount >= 3) extras.push(`Tienes ${pendingCount} tareas pendientes, vamos con calma.`);
	if (userProfile.login_streak >= 3) extras.push(`Llevas ${userProfile.login_streak} días seguidos entrando, sigue así!`);
	if (favoritePage && pageLabels[favoritePage]) extras.push(`Veo que sueles revisar ${pageLabels[favoritePage]} seguido.`);
	if (hour >= 23 || hour < 5) extras.push('Es tarde, no te desveles demasiado.');

	const chosenTimePhrase = timePhrases[Math.floor(Math.random() * timePhrases.length)];
	const chosenExtra = extras.length > 0 ? extras[Math.floor(Math.random() * extras.length)] : '';

	return `<${timeTag}>${chosenTimePhrase}</${timeTag}>,<br>${profile.name}${chosenExtra ? `<br><span class="greeting-extra">${chosenExtra}</span>` : ''}`;
}

//=================================
// Quick Actions Widget
//=================================
async function loadQuickActionsWidget() {
	const actions = [];

	const { data: tasks } = await supabaseClient.from('tasks').select('id, status').eq('assigned_to', currentUser.id);
	const pendingCount = (tasks || []).filter(t => t.status === 'pending').length;
	if (pendingCount > 0) actions.push({ label: `Ver ${pendingCount} tarea(s) pendiente(s)`, icon: 'fi-rr-task-checklist', page: 'tasks' });

	if (['admin', 'ceo'].includes(userProfile.role)) {
		const { data: incoming } = await supabaseClient.from('requests').select('id').eq('admin_id', currentUser.id).eq('status', 'pending');
		if (incoming && incoming.length > 0) actions.push({ label: `Revisar ${incoming.length} solicitud(es)`, icon: 'fi-rr-inbox', page: 'incomingrequests' });
	}

	const { data: myRequests } = await supabaseClient.from('requests').select('status').eq('employee_id', currentUser.id);
	const stillPending = (myRequests || []).filter(r => r.status === 'pending').length;
	if (stillPending > 0) actions.push({ label: 'Ver mis solicitudes', icon: 'fi-rr-envelope', page: 'requests' });

	actions.push({ label: 'Visitar la Tienda', icon: 'fi-rr-shopping-bag', page: 'store' });
	actions.push({ label: 'Ver Novedades', icon: 'fi-rr-resources', page: 'news' });
	actions.push({ label: 'Abrir el Chat', icon: 'fi-rr-comment', page: 'chat' });

	const finalActions = actions.slice(0, 4);
	const container = $('quickActionsButtons');
	container.innerHTML = '';
	finalActions.forEach(a => {
		const btn = document.createElement('button');
		btn.innerHTML = `<i class="fi ${a.icon}"></i> ${a.label}`;
		btn.onclick = () => gotoPage(a.page);
		container.appendChild(btn);
	});
}

//=================================
// PFP Frames
//=================================
function applyFrameOverlay(imgElement, frameUrl) {
  if (!imgElement) return;
  const parent = imgElement.parentElement;
  parent.classList.add('pfp-frame-wrapper');

  let overlay = parent.querySelector('.pfp-frame-overlay');
  if (!frameUrl) {
    if (overlay) overlay.remove();
    return;
  }

  if (!overlay) {
    overlay = document.createElement('img');
    overlay.className = 'pfp-frame-overlay';
    parent.appendChild(overlay);
  }
  overlay.src = frameUrl;
}

//=================================
// Terms & Conditions
//=================================
let platformTermsVersion = 0;
let platformTermsActive = false;

async function checkTermsStatus() {
	const { data, error } = await supabaseClient
		.from('platform_settings')
		.select('terms_version, terms_active')
		.eq('id', 1)
		.single();

	if (error) { console.error(error); return false; }

	platformTermsVersion = data.terms_version;
	platformTermsActive = data.terms_active;

	const mustAccept = platformTermsActive && (userProfile.accepted_terms_version || 0) < platformTermsVersion;

	$('termsBlockOverlay').classList.toggle('show', mustAccept);
	return mustAccept;
}

async function acceptTerms() {
	$('acceptTermsBtn').disabled = true;

	const { data, error } = await supabaseClient
		.from('profiles')
		.update({ accepted_terms_version: platformTermsVersion })
		.eq('id', currentUser.id)
		.select();

	$('acceptTermsBtn').disabled = false;

	if (error || !data || data.length === 0) {
		showMsgBox('error', 'Error', `No se pudo registrar la aceptación: ${error ? error.message : 'permiso denegado'}`, 'Cerrar');
		return;
	}

	userProfile.accepted_terms_version = platformTermsVersion;
	$('termsBlockOverlay').classList.remove('show');
	showMsgBox('success', 'Gracias!', 'Términos y condiciones aceptados.', 'Cerrar');
}

async function publishNewTerms() {
	const confirmMsg = await showAskBox(
		'warn',
		'Nuevos Términos y Condiciones',
		'Esto iniciará una nueva revisión: todos los usuarios (incluido tú) deberán aceptar los nuevos términos antes de seguir usando la plataforma. ¿Continuar?',
		'Publicar', 'Cancelar'
	);
	if (!confirmMsg.confirmed) return;

	$('loadingModal').classList.remove('hidden');

	const { data: current } = await supabaseClient.from('platform_settings').select('terms_version').eq('id', 1).single();
	const newVersion = (current?.terms_version || 0) + 1;

	const { error } = await supabaseClient
		.from('platform_settings')
		.update({ terms_version: newVersion, terms_active: true, terms_updated_at: new Date().toISOString() })
		.eq('id', 1);

	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }

	showMsgBox('success', 'Publicado!', 'Los nuevos términos fueron publicados.', 'Cerrar');
	checkTermsStatus();
}

async function loadTermsReviewPanel() {
	$('loadingModal').classList.remove('hidden');

	const { data: settings } = await supabaseClient.from('platform_settings').select('terms_version, terms_active').eq('id', 1).single();
	const { data: profiles, error } = await supabaseClient.from('profiles').select('id, name, accepted_terms_version');

	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', 'No se pudo cargar la información.', 'Cerrar'); return; }

	const version = settings.terms_version;
	const accepted = profiles.filter(p => (p.accepted_terms_version || 0) >= version);
	const pending = profiles.filter(p => (p.accepted_terms_version || 0) < version);

	$('termsReviewStatus').innerHTML = `
		<p>Versión actual: <strong>${version}</strong></p>
		<p>Estado: <strong>${settings.terms_active ? 'Revisión activa (bloqueando a quien no acepte)' : 'Inactiva'}</strong></p>
		<p>${accepted.length} de ${profiles.length} han aceptado.</p>
	`;
	$('endTermsReviewBtn').classList.toggle('hidden', !settings.terms_active);

	$('termsAcceptedList').innerHTML = accepted.length
		? accepted.map(p => `<div class="element"><span>${p.name}</span></div>`).join('')
		: '<span>Nadie ha aceptado todavía.</span>';

	$('termsPendingList').innerHTML = pending.length
		? pending.map(p => `<div class="element"><span>${p.name}</span><button class="btnsmall" onclick="goToManageFromDirectory('${p.id}')"><i class="fi fi-rr-user-gear"></i></button></div>`).join('')
		: '<span>Todos han aceptado!</span>';
}

async function endTermsReview() {
	const confirmMsg = await showAskBox('warn', 'Finalizar Revisión', 'Esto quitará el bloqueo a quienes no hayan aceptado. Podrás decidir manualmente si banear a alguien desde Gestionar Empleados. ¿Continuar?', 'Finalizar', 'Cancelar');
	if (!confirmMsg.confirmed) return;

	$('loadingModal').classList.remove('hidden');
	const { error } = await supabaseClient.from('platform_settings').update({ terms_active: false }).eq('id', 1);
	$('loadingModal').classList.add('hidden');

	if (error) { showMsgBox('error', 'Error', error.message, 'Cerrar'); return; }

	showMsgBox('success', 'Éxito!', 'Revisión finalizada. La próxima vez que publiques nuevos términos, el proceso queda listo para repetirse.', 'Cerrar');
	loadTermsReviewPanel();
	checkTermsStatus();
}

function subscribeToTermsChanges() {
	supabaseClient.channel('terms-changes')
		.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'platform_settings' }, () => {
			if (loggedIn) checkTermsStatus();
		})
		.subscribe();
}