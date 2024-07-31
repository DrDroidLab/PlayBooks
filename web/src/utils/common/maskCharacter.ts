export default function maskCharacter(str: string, mask: string, n = 1) {
  return ("" + str).slice(0, -n).replace(/./g, mask) + ("" + str).slice(-n);
}
