export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(' ');
  }
  return typeof detail === 'string' && detail ? detail : fallback;
}
