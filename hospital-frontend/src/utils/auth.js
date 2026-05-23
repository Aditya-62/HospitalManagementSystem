export function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username =
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            payload['unique_name'] || payload['name'] || payload['sub'] || 'User';
        const role =
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
            payload['role'] || payload['Role'] || 'Patient';
        return { username, role };
    } catch {
        return { username: 'User', role: 'Patient' };
    }
}

export function getUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return decodeToken(token);
}
