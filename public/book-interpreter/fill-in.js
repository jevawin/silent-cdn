// copy below into https://chriszarate.github.io/bookmarkleter/ to convert to bookmarklet
javascript: document.querySelector("[data-name='Appointment: service']").click();
document.querySelector("[data-name='Appointment: specialism']").click();
document.querySelector("[data-name='Appointment: organisation']").click();
document.querySelector("[data-name='Appointment: duration hours']").value = 2;
document.querySelector("[data-name='Appointment: duration minutes']").value = 30;
document.querySelector("[data-name='Appointment: access to work'][value='No']").click();
document.querySelector("[data-name='Appointment: interpreter gender'][value='Any']").click();
let timeNow = new Date();
timeNow.setMinutes(timeNow.getMinutes() + 1440 - timeNow.getTimezoneOffset());
document.querySelector("[data-name='Appointment: date']").value = timeNow
  .toISOString()
  .slice(0, 16);
document.querySelector("#Terms-and-conditions").click();
for (const [el, val] of Object.entries({
  "Booker: name": "Jamie Evawin",
  "Appointment: details":
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Appointment: client name": "Bob Dylan",
  "Appointment: contact name": "Marvin Gaye",
  "Appointment: contact number": "07123456789",
  "Appointment: address 1": "1 End of the Road",
  "Appointment: address 2": "2 Streetside",
  "Appointment: city": "Cityville",
  "Appointment: post code": "AB1 2CD",
  "Booker: number": "01234567890",
  "Booker: email": "iamjevawin+booker@gmail.com",
  "Finance: department": "Radiotherapy",
  "Finance: company name": "Companies House",
  "Finance: address 1": "1 Government",
  "Finance: address 2": "2 House",
  "Finance: city": "London",
  "Finance: post code": "CA5 5HH",
  "Finance: email address": "iamjevawin+finance@gmail.com",
  "Finance: PO / cost centre code": "12345",
})) {
  document.querySelector(`[data-name="${el}"]`).value = val;
}
