/** Firma ECDSA en formato DER (lo que manda el móvil) -> r||s de 64 bytes (lo que espera WebCrypto). */
export function derToRaw(der) {
  const bytes = new Uint8Array(der);
  let pos = 0;
  const expect = (value) => { if (bytes[pos++] !== value) throw new Error('Firma no válida'); };
  const length = () => {
    const first = bytes[pos++];
    if (first < 0x80) return first;
    const count = first & 0x7f;
    let value = 0;
    for (let i = 0; i < count; i += 1) value = (value << 8) | bytes[pos++];
    return value;
  };
  expect(0x30); length();
  const integer = () => {
    expect(0x02);
    const size = length();
    let part = bytes.slice(pos, pos + size);
    pos += size;
    while (part.length > 32 && part[0] === 0) part = part.slice(1);
    if (part.length > 32) throw new Error('Firma no válida');
    const out = new Uint8Array(32);
    out.set(part, 32 - part.length);
    return out;
  };
  const r = integer();
  const s = integer();
  return new Uint8Array([...r, ...s]);
}
