// Small, dependency-free ZIP writer. STORE entries keep text projects readable
// by standard unzip tools without loading a compressor or contacting a service.
const encoder = new TextEncoder();
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function header(size) {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}
export function projectZip(entries) {
  if (entries.length > 65535) throw new Error('Too many files for this ZIP.');
  const local = [], central = [];
  let offset = 0, centralSize = 0;
  for (const [path, text] of entries) {
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '..' || part === '.') || /[\x00-\x1f:]/.test(path)) throw new Error('Invalid ZIP path.');
    const name = encoder.encode(path), data = encoder.encode(text), crc = crc32(data);
    if (name.length > 65535) throw new Error('ZIP path is too long.');
    const l = header(30);
    l.view.setUint32(0, 0x04034b50, true);
    l.view.setUint16(4, 20, true);
    l.view.setUint16(6, 0x800, true); // UTF-8
    l.view.setUint16(12, 33, true); // 1980-01-01
    l.view.setUint32(14, crc, true);
    l.view.setUint32(18, data.length, true);
    l.view.setUint32(22, data.length, true);
    l.view.setUint16(26, name.length, true);
    local.push(l.bytes, name, data);
    const c = header(46);
    c.view.setUint32(0, 0x02014b50, true);
    c.view.setUint16(4, 20, true);
    c.view.setUint16(6, 20, true);
    c.view.setUint16(8, 0x800, true);
    c.view.setUint16(14, 33, true);
    c.view.setUint32(16, crc, true);
    c.view.setUint32(20, data.length, true);
    c.view.setUint32(24, data.length, true);
    c.view.setUint16(28, name.length, true);
    c.view.setUint32(42, offset, true);
    central.push(c.bytes, name);
    offset += 30 + name.length + data.length;
    centralSize += 46 + name.length;
  }
  if (offset + centralSize > 0xffffffff) throw new Error('Project is too large for this ZIP.');
  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(8, entries.length, true);
  end.view.setUint16(10, entries.length, true);
  end.view.setUint32(12, centralSize, true);
  end.view.setUint32(16, offset, true);
  return new Blob([...local, ...central, end.bytes], { type: 'application/zip' });
}
