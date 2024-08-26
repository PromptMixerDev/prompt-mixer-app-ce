export const convertDate = (utcDate: string | Date): string => {
  if (!utcDate) {
    return '';
  }

  const date: Date = new Date(utcDate);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  };

  const locale: string = navigator.language;

  const formattedDatePart: string = new Intl.DateTimeFormat(
    locale,
    dateOptions
  ).format(date);
  const formattedTimePart: string = new Intl.DateTimeFormat(
    locale,
    timeOptions
  ).format(date);

  return `${formattedDatePart}, ${formattedTimePart}`;
};
