type Color =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'base'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | undefined;

export const getStatusColor = (value: number | string): Color => {
  if (typeof value === 'string') {
    switch (value) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'SCHEDULED':
        return 'info';
      case 'ARCHIVED':
        return 'error';
      default:
        return 'neutral';
    }
  }
  return value >= 80 ? 'success' : value >= 50 && value < 80 ? 'warning' : 'error';
};
