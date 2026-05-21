export function calculateAge(birthday: string | null | undefined): number | null {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export function isOldEnough(age: number | null, rating: string | null | undefined): boolean {
  if (!rating || rating === "all") return true;
  if (age === null) return false;

  const requiredAge = parseInt(rating.replace("+", ""), 10);
  if (isNaN(requiredAge)) return true;

  return age >= requiredAge;
}
