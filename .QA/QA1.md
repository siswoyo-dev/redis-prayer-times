Q:
Please answer the below question.
Hi sir, I am a student studying first year cse...i have a doubt in your project?
How and from where you get the time of prayer of each mosque?( I mean how the system knows when the prayer starts in the mosque that is near to me.)

A:

## How the System Gets Prayer Times
The system does not directly get times from each mosque. Instead, it does the following:

1. **Gets Your Location:**

- Using your device's GPS (via navigator.geolocation) or your IP address (as a backup), the system finds your latitude and longitude.

2. **Sends Location to an API:**

- It then uses those coordinates to call a public prayer times API, specifically:

```bash
https://api.aladhan.com/v1/timings?latitude=...&longitude=...&method=20
```
- This API returns daily prayer times calculated based on your location and the selected calculation method (like "Muslim World League", "ISNA", etc.).
- Here, method=20 is used, which refers to:
```
KEMENAG – Kementerian Agama Republik Indonesia
```
- This means the prayer times follow the official calculation method used in Indonesia, as recommended by Kemenag.

3. **Displays the Timings:**

- The system then updates the UI to show these prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha, etc.) along with the Hijri date.