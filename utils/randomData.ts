export function generateRandomName(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let name = "";
   
    // First letter uppercase
    name += chars.charAt(Math.floor(Math.random() * chars.length)).toUpperCase();
   
    // Remaining letters lowercase
    for (let i = 1; i < length; i++) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }
   
    return name;
  }