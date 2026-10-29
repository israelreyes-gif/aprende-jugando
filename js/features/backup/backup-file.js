export function backupFileName(now = new Date()) {
  return `aprende-copia-${now.toISOString().slice(0, 10)}.json`;
}

function download(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Entrega el archivo: hoja de compartir si el móvil la admite, descarga normal si no.
 * Devuelve false si la persona cancela. Lanza NotAllowedError si el móvil exige un toque nuevo para compartir.
 * No se pasa título a la hoja de compartir: algunas apps (Drive) lo guardan como un segundo archivo .txt.
 */
export async function saveBackupFile(backup, now = new Date()) {
  const file = new File([JSON.stringify(backup)], backupFileName(now), { type: 'application/json' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
      throw err;
    }
  }
  download(file);
  return true;
}
