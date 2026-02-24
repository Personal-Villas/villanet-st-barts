const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const getRecaptchaToken = async (action: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Verificar si el script ya está cargado, si no, añadirlo
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Esperar a que grecaptcha esté listo
    const checkReady = setInterval(() => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.ready) {
        clearInterval(checkReady);
        // @ts-ignore
        window.grecaptcha.ready(async () => {
          try {
            // @ts-ignore
            const token = await window.grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch (error) {
            console.error('Error al generar token reCAPTCHA:', error);
            resolve(null);
          }
        });
      }
    }, 100);

    // Timeout de seguridad por si falla la carga
    setTimeout(() => {
      clearInterval(checkReady);
      resolve(null);
    }, 10000);
  });
};