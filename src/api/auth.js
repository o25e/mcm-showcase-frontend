const MEMBER_STORAGE_KEY = 'mcm.member';

export function getStoredMember() {
  try {
    const storedMember = localStorage.getItem(MEMBER_STORAGE_KEY)
      || sessionStorage.getItem(MEMBER_STORAGE_KEY);
    return storedMember ? JSON.parse(storedMember) : null;
  } catch {
    return null;
  }
}

export function storeMember(member) {
  const serializedMember = JSON.stringify(member);
  sessionStorage.setItem(MEMBER_STORAGE_KEY, serializedMember);
  localStorage.setItem(MEMBER_STORAGE_KEY, serializedMember);
}

export function clearMember() {
  sessionStorage.removeItem(MEMBER_STORAGE_KEY);
  localStorage.removeItem(MEMBER_STORAGE_KEY);
}
