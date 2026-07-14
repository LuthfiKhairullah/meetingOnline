export class DateHelper {
  private static readonly TIME_ZONE = "Asia/Jakarta";
  private static readonly LOCALE = "id-ID";

    static dateTimeISO(
      date: Date | string
    ): string {
      console.log('date');
      console.log(date);
    const jakarta = new Date(
      new Date(date).toLocaleString("en-US", {
        timeZone: this.TIME_ZONE,
      }),
    );

    const year = jakarta.getFullYear();
    const month = String(jakarta.getMonth() + 1).padStart(2, "0");
    const day = String(jakarta.getDate()).padStart(2, "0");

    const hour = String(jakarta.getHours()).padStart(2, "0");
    const minute = String(jakarta.getMinutes()).padStart(2, "0");
    const second = String(jakarta.getSeconds()).padStart(2, "0");
    const millisecond = String(jakarta.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
    // return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
  }

  static format(
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) {
    return new Intl.DateTimeFormat(this.LOCALE, {
      timeZone: this.TIME_ZONE,
      ...options,
    }).format(new Date(date));
  }

  static dateTime(date: Date | string) {
    return this.format(date, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  static date(date: Date | string) {
    return this.format(date, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  static time(date: Date | string) {
    return this.format(date, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }
}