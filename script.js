// Asegurarse de que el código se ejecute después de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Función para mostrar notificaciones (toasts)
    function showToast(message, position, isLog = false) {
        const toastContainer = document.createElement('div');
        toastContainer.className = `toast position-fixed bg-light text-dark border p-2`;
        toastContainer.style.zIndex = '1050';
        toastContainer.style.transition = 'opacity 0.5s ease';
        
        if (position === 'top-left') {
            toastContainer.style.top = '20px';
            toastContainer.style.left = '20px';
        } else if (position === 'bottom-right') {
            toastContainer.style.bottom = '20px';
            toastContainer.style.right = '20px';
        }
        
        toastContainer.innerHTML = `<div class="toast-body">${message}</div>`;
        document.body.appendChild(toastContainer);
        
        const toast = new bootstrap.Toast(toastContainer, { delay: isLog ? 10000 : 7000 });
        toast.show();
        
        toastContainer.addEventListener('hidden.bs.toast', () => {
            toastContainer.remove();
        });
    }

    // Event Listener para el botón de la cámara
    document.getElementById('cameraButton').addEventListener('click', async () => {
        try {
            // Verificar si el navegador soporta getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('La API getUserMedia no es soportada por este navegador.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });

            showToast('Acceso a la cámara concedido.', 'top-left');
            showToast('Intento de acceder a la cámara.', 'bottom-right', true);
            
            const cameraStatus = document.getElementById('cameraStatus');
            cameraStatus.innerHTML = '<strong>Cámara:</strong> Activa';

            const cameraPreview = document.getElementById('cameraPreview');
            cameraPreview.innerHTML = '<video id="cameraVideo" autoplay playsinline class="w-100" style="max-height: 200px;"></video>';
            const videoElement = document.getElementById('cameraVideo');
            videoElement.srcObject = stream;

            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.onended = () => {
                cameraStatus.innerHTML = '<strong>Cámara:</strong> Inactiva';
                cameraPreview.innerHTML = '';
            };
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(`Error al acceder a la cámara: ${errorMessage}`, 'top-left');
            showToast('Error al intentar acceder a la cámara.', 'bottom-right', true);
            const cameraStatus = document.getElementById('cameraStatus');
            cameraStatus.innerHTML = `<strong>Cámara:</strong> Error - ${errorMessage}`;
            console.error('Error al acceder a la cámara:', error);
        }
    });

    // Event Listener para el botón del micrófono
    document.getElementById('microphoneButton').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            showToast('Acceso al micrófono concedido.', 'top-left');
            showToast('Intento de acceder al micrófono.', 'bottom-right', true);
            
            const microphoneStatus = document.getElementById('microphoneStatus');
            microphoneStatus.innerHTML = '<strong>Micrófono:</strong> Activo - Volumen: <progress id="micVolume" value="0" max="1"></progress>';
    
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
    
            const dataArray = new Uint8Array(analyser.fftSize);
            function updateVolume() {
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / dataArray.length / 256;
                document.getElementById('micVolume').value = volume;
                requestAnimationFrame(updateVolume);
            }
            updateVolume();
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(`Error al acceder al micrófono: ${errorMessage}`, 'top-left');
            showToast('Error al intentar acceder al micrófono.', 'bottom-right', true);
            const microphoneStatus = document.getElementById('microphoneStatus');
            microphoneStatus.innerHTML = `<strong>Micrófono:</strong> Error - ${errorMessage}`;
            console.error('Error al acceder al micrófono:', error);
        }
    });

    // Event Listener para el botón de geolocalización
    document.getElementById('locationButton').addEventListener('click', () => {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        showToast(`Ubicación obtenida: Latitud ${position.coords.latitude}, Longitud ${position.coords.longitude}`, 'top-left');
                        showToast('Intento de obtener ubicación.', 'bottom-right', true);
                        
                        const locationStatus = document.getElementById('locationStatus');
                        locationStatus.innerHTML = `<strong>Ubicación:</strong> Latitud: ${position.coords.latitude}, Longitud: ${position.coords.longitude}`;
                    },
                    (error) => {
                        const errorMessage = error.message || error.code || 'Error desconocido';
                        showToast(`No se pudo obtener la ubicación: ${errorMessage}`, 'top-left');
                        showToast('Error al intentar obtener la ubicación.', 'bottom-right', true);
                        const locationStatus = document.getElementById('locationStatus');
                        locationStatus.innerHTML = `<strong>Ubicación:</strong> Error - ${errorMessage}`;
                        console.error('Error al obtener la ubicación:', error);
                    }
                );
            } else {
                throw new Error('Geolocalización no soportada por el navegador.');
            }
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(errorMessage, 'top-left');
            showToast('Error al intentar usar geolocalización.', 'bottom-right', true);
            const locationStatus = document.getElementById('locationStatus');
            locationStatus.innerHTML = `<strong>Ubicación:</strong> Error - ${errorMessage}`;
            console.error('Error de geolocalización:', error);
        }
    });

    // Event Listener para el botón de notificaciones
    document.getElementById('notificationButton').addEventListener('click', async () => {
        try {
            if ('Notification' in window) {
                let permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Notificación permitida!');
                    showToast('Notificación permitida!', 'top-left');
                    const notificationStatus = document.getElementById('notificationStatus');
                    notificationStatus.innerHTML = '<strong>Notificación:</strong> Permiso concedido';
                } else {
                    showToast('Permiso de notificación denegado.', 'top-left');
                    const notificationStatus = document.getElementById('notificationStatus');
                    notificationStatus.innerHTML = '<strong>Notificación:</strong> Permiso denegado';
                }
                showToast('Intento de solicitar permiso de notificación.', 'bottom-right', true);
            } else {
                throw new Error('Notificaciones no soportadas por el navegador.');
            }
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(`Error al solicitar permiso de notificación: ${errorMessage}`, 'top-left');
            showToast('Error al intentar solicitar notificación.', 'bottom-right', true);
            const notificationStatus = document.getElementById('notificationStatus');
            notificationStatus.innerHTML = `<strong>Notificación:</strong> Error - ${errorMessage}`;
            console.error('Error de notificación:', error);
        }
    });

    // Event Listener para el botón del portapapeles
    document.getElementById('clipboardButton').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            showToast(`Texto del portapapeles: ${text}`, 'top-left');
            showToast('Intento de leer el portapapeles.', 'bottom-right', true);
            
            const clipboardStatus = document.getElementById('clipboardStatus');
            clipboardStatus.innerHTML = `<strong>Portapapeles:</strong> ${text}`;
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(`No se pudo acceder al portapapeles: ${errorMessage}`, 'top-left');
            showToast('Error al intentar leer el portapapeles.', 'bottom-right', true);
            const clipboardStatus = document.getElementById('clipboardStatus');
            clipboardStatus.innerHTML = `<strong>Portapapeles:</strong> Error - ${errorMessage}`;
            console.error('Error al acceder al portapapeles:', error);
        }
    });

    // Event Listener para el botón de Bluetooth
    document.getElementById('bluetoothButton').addEventListener('click', async () => {
        try {
            if (!navigator.bluetooth || !navigator.bluetooth.requestDevice) {
                throw new Error('La API Bluetooth no es soportada por este navegador.');
            }

            const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
            showToast(`Dispositivo Bluetooth seleccionado: ${device.name}`, 'top-left');
            showToast('Intento de acceder a Bluetooth.', 'bottom-right', true);
            
            const bluetoothStatus = document.getElementById('bluetoothStatus');
            bluetoothStatus.innerHTML = `<strong>Bluetooth:</strong> Dispositivo seleccionado: ${device.name}`;
        } catch (error) {
            const errorMessage = error.message || error.name || 'Error desconocido';
            showToast(`Error al acceder a Bluetooth: ${errorMessage}`, 'top-left');
            showToast('Error al intentar acceder a Bluetooth.', 'bottom-right', true);
            const bluetoothStatus = document.getElementById('bluetoothStatus');
            bluetoothStatus.innerHTML = `<strong>Bluetooth:</strong> Error - ${errorMessage}`;
            console.error('Error al acceder a Bluetooth:', error);
        }
    });
});
