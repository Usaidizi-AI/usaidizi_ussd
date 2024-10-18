const express = require("express");
const router = express.Router();
const AT = require("africastalking")({ apiKey: "", username: "" });

const sms = AT.SMS; // SMS service
const sessionState = {};
const doctors = [
  { name: "Dr. Jane Doe", specialty: "General Practitioner", phone: "+254700000001" },
  { name: "Dr. John Smith", specialty: "Pediatrician", phone: "+254700000002" },
  { name: "Dr. Alice Brown", specialty: "Dermatologist", phone: "+254700000003" },
];
const volunteers = [
  { name: "Jacob Otieno", specialty: "First Aid", phone: "+254700034504" },
  { name: "Susan CheIIah", specialty: "Community Support", phone: "+254734500005" },
  { name: "Greg Onyango", specialty: "Emergency Response", phone: "+254702330006" },
];
const firstAidTips = [
  "Tip 1: If someone is unconscious but breathing, place them in the recovery position.",
  "Tip 2: For burns, run cool water over the area for at least 10 minutes.",
  "Tip 3: If a person is choking, perform the Heimlich maneuver.",
];

router.post("/", (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  console.log("USSD Request:", req.body);

  // Initialize session state if not present
  if (!sessionState[sessionId]) {
    sessionState[sessionId] = { step: 0 };
  }

  const userState = sessionState[sessionId];
  let response = "";

  // Main menu options
  if (userState.step === 0) {
    response = "CON 🌍 Welcome to UsaidiziAI - Emergency Services!\n";
    response += "1. 🚑 Call a doctor\n";
    response += "2. 🗺️ Get map location\n";
    response += "3. 📞 Emergency contact\n";
    response += "4. 👥 Find volunteers\n";
    response += "5. 🩺 First Aid Tips\n";
    response += "6. 🚨 Report an incident\n";
    userState.step = 1;
  } else if (userState.step === 1) {
    switch (text) {
      case "1":
        response = "CON 🚑 Available Doctors:\n";
        doctors.forEach((doc, index) => {
          response += `${index + 1}. ${doc.name} - ${doc.specialty}\n`;
        });
        response += "Select a doctor by number to call:\n";
        userState.step = 2;
        break;
      case "2":
        response = "CON 🗺️ Enter your location to drop a pin (e.g., Nairobi):\n";
        userState.step = 3;
        break;
      case "3":
        response = "CON 📞 Enter emergency contact number:\n";
        userState.step = 4;
        break;
      case "4":
        response = "CON 👥 Available Volunteers:\n";
        volunteers.forEach((volunteer, index) => {
          response += `${index + 1}. ${volunteer.name} - ${volunteer.specialty}\n`;
        });
        response += "Select a volunteer by number to call:\n";
        userState.step = 5;
        break;
      case "5":
        response = "CON 🩺 First Aid Tips:\n";
        firstAidTips.forEach((tip, index) => {
          response += `${index + 1}. ${tip}\n`;
        });
        response += "END 🩺 Stay safe and prepared!";
        userState.step = 0; // End session after showing tips
        break;
      case "6":
        response = "CON 🚨 Please describe the incident:\n";
        userState.step = 6;
        break;
      default:
        response = "END ❌ Invalid option. Please try again.";
        userState.step = 0;
        break;
    }
  } 
  // Calling a doctor
  else if (userState.step === 2) {
    const doctorIndex = parseInt(text) - 1;
    if (doctorIndex >= 0 && doctorIndex < doctors.length) {
      const selectedDoctor = doctors[doctorIndex];
      response = `END 📞 Calling ${selectedDoctor.name} at ${selectedDoctor.phone}.`;

      // Send SMS to the user
      sms.send({ to: [phoneNumber], message: `Calling Dr. ${selectedDoctor.name} - ${selectedDoctor.specialty}: ${selectedDoctor.phone}` })
        .then(() => console.log(`SMS sent to ${phoneNumber}`)) // Log success
        .catch(error => console.error(`Failed to send SMS to ${phoneNumber}:`, error)); // Log error
    } else {
      response = "END ❌ Invalid selection. Please try again.";
      userState.step = 0;
    }
  } 
  // Dropping a pin
  else if (userState.step === 3) {
    const location = text;
    response = `END 📍 Your location '${location}' has been pinned.`;
    // You could add further functionality here, like saving the location.
  } 
  // Emergency contact
  else if (userState.step === 4) {
    const emergencyContact = text;
    response = `END 📞 Your emergency contact number '${emergencyContact}' has been saved.`;
    // Save emergency contact for further use
  } 
  // Calling a volunteer
  else if (userState.step === 5) {
    const volunteerIndex = parseInt(text) - 1;
    if (volunteerIndex >= 0 && volunteerIndex < volunteers.length) {
      const selectedVolunteer = volunteers[volunteerIndex];
      response = `END 📞 Calling ${selectedVolunteer.name} at ${selectedVolunteer.phone}.`;

      // Send SMS to the user
      sms.send({ to: [phoneNumber], message: `Calling Volunteer ${selectedVolunteer.name} - ${selectedVolunteer.specialty}: ${selectedVolunteer.phone}` })
        .then(() => console.log(`SMS sent to ${phoneNumber}`)) // Log success
        .catch(error => console.error(`Failed to send SMS to ${phoneNumber}:`, error)); // Log error
    } else {
      response = "END ❌ Invalid selection. Please try again.";
      userState.step = 0;
    }
  } 
  // Reporting an incident
  else if (userState.step === 6) {
    const incidentDescription = text;
    response = `END 🚨 Your incident report has been submitted: '${incidentDescription}'. We will take action.`;
    // Here, you could add functionality to store or notify about the incident.
  } else {
    response = "END ❌ Invalid option. Please try again.";
    userState.step = 0;
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

module.exports = router;
