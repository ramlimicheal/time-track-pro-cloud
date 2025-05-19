
// Generate a random username based on name
export const generateUsername = (name: string): string => {
  const nameParts = name.toLowerCase().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}.${lastName.substring(0, 3)}${randomNum}`;
};

// Generate a random password
export const generatePassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const departments = ["Engineering", "Marketing", "Finance", "HR", "Operations", "Sales"];
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

