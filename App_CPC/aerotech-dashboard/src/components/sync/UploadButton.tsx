import { useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
export function UploadButton({
  link,
  reconnect,
  upload,
}: {
  link: () => Promise<void>;
  reconnect: () => Promise<void>;
  upload: (file: File) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const name = useFinanceStore((s) => s.fileName),
    status = useFinanceStore((s) => s.status);
  const supports = !!window.showOpenFilePicker;
  return (
    <>
      <button
        className="link-button"
        onClick={() =>
          void (supports
            ? status === 'Reconnecter le fichier'
              ? reconnect()
              : link()
            : input.current?.click())
        }
      >
        {status === 'Reconnecter le fichier'
          ? 'Reconnecter le fichier'
          : name
            ? 'Changer de fichier'
            : 'Lier mon fichier Excel'}{' '}
        <span aria-hidden="true">↗</span>
      </button>
      {name && (
        <p className="filename" title={name}>
          {name}
        </p>
      )}
      {!supports && (
        <p>Synchronisation automatique disponible sur Chrome / Edge desktop.</p>
      )}
      <input
        ref={input}
        type="file"
        hidden
        accept=".xlsx,.xlsm"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = '';
        }}
      />
    </>
  );
}
