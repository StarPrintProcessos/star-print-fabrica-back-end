export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  return Object.keys(obj).reduce((acc, key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    // Evita mergulhar em objetos Date
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(acc, flattenObject(value, path));
    } else {
      acc[path] = value;
    }

    return acc;
  }, {} as Record<string, any>);
}
